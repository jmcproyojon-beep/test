#!/usr/bin/env python3
"""TimesFM 2.5 demo on synthetic tea-shop and clothing-brand sales.

For each business it:
  1. Backtests: hides the last `horizon` points, forecasts them, and scores
     TimesFM against a seasonal-naive baseline (repeat last season).
  2. Forecasts the real future from the full history.
  3. Writes a chart, a forecast CSV and a metrics JSON to output/.

Usage:
    python make_demo_data.py          # once, creates data/
    python run_demo.py                # tea: 28 days, clothing: 13 weeks
    python run_demo.py --tea-horizon 14 --clothing-horizon 26
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import timesfm
import torch

HERE = Path(__file__).parent
IDX_MEAN, IDX_Q10, IDX_Q90 = 0, 1, 9  # quantile index 0 is the MEAN, not q0


def load_model(max_horizon: int):
    torch.set_float32_matmul_precision("high")
    model = timesfm.TimesFM_2p5_200M_torch.from_pretrained(
        "google/timesfm-2.5-200m-pytorch"
    )
    model.compile(
        timesfm.ForecastConfig(
            max_context=1024,
            max_horizon=max_horizon,
            normalize_inputs=True,
            use_continuous_quantile_head=True,
            force_flip_invariance=True,
            infer_is_positive=True,  # sales can't go below zero
            fix_quantile_crossing=True,
        )
    )
    return model


def seasonal_naive(history: np.ndarray, horizon: int, season: int) -> np.ndarray:
    last = history[-season:]
    return np.tile(last, horizon // season + 1)[:horizon]


def scores(actual, pred, q10=None, q90=None) -> dict:
    out = {
        "mae": float(np.mean(np.abs(actual - pred))),
        # WAPE: robust to near-zero days, which plain MAPE is not
        "wape_pct": float(np.sum(np.abs(actual - pred)) / np.sum(np.abs(actual)) * 100),
    }
    if q10 is not None:
        out["coverage_80_pct"] = float(np.mean((actual >= q10) & (actual <= q90)) * 100)
    return out


def run_business(model, name, csv, date_col, horizon, season, freq, out_dir):
    df = pd.read_csv(csv, parse_dates=[date_col])
    cols = [c for c in df.columns if c not in (date_col, "promo")]
    values = {c: df[c].to_numpy(dtype=np.float32) for c in cols}
    dates = df[date_col]

    # 1. Backtest on the last `horizon` points
    t0 = time.time()
    bt_point, bt_q = model.forecast(
        horizon=horizon, inputs=[v[:-horizon] for v in values.values()]
    )
    # 2. Real future forecast from full history
    fc_point, fc_q = model.forecast(horizon=horizon, inputs=list(values.values()))
    secs = time.time() - t0
    assert not np.isnan(fc_point).any() and fc_q.shape == (len(cols), horizon, 10)

    future = pd.date_range(dates.iloc[-1], periods=horizon + 1, freq=freq)[1:]
    metrics, rows = {}, []
    fig, axes = plt.subplots(len(cols), 1, figsize=(12, 3.2 * len(cols)), sharex=True)
    tail = min(len(dates), season * 8 if season < 30 else 104)

    for i, c in enumerate(cols):
        v = values[c]
        actual = v[-horizon:]
        m_tfm = scores(actual, bt_point[i], bt_q[i, :, IDX_Q10], bt_q[i, :, IDX_Q90])
        m_naive = scores(actual, seasonal_naive(v[:-horizon], horizon, season))
        metrics[c] = {"timesfm": m_tfm, "seasonal_naive": m_naive}

        for h in range(horizon):
            rows.append(
                {
                    "series": c,
                    "date": future[h].date(),
                    "forecast": round(float(fc_point[i, h]), 1),
                    "low_q10": round(float(fc_q[i, h, IDX_Q10]), 1),
                    "high_q90": round(float(fc_q[i, h, IDX_Q90]), 1),
                }
            )

        ax = axes[i]
        ax.plot(dates.iloc[-tail:], v[-tail:], color="0.35", lw=1, label="history")
        bt_dates = dates.iloc[-horizon:]
        ax.plot(bt_dates, bt_point[i], color="tab:blue", lw=1.5, ls="--",
                label=f"backtest (WAPE {m_tfm['wape_pct']:.1f}%)")
        ax.plot(future, fc_point[i], color="tab:orange", lw=2, label="forecast")
        ax.fill_between(future, fc_q[i, :, IDX_Q10], fc_q[i, :, IDX_Q90],
                        color="tab:orange", alpha=0.25, label="80% interval")
        ax.set_title(c.replace("_", " ").title(), loc="left", fontsize=11)
        ax.legend(loc="upper left", fontsize=8, ncol=4, frameon=False)
        ax.grid(alpha=0.3)

    fig.suptitle(f"{name} — TimesFM 2.5 zero-shot forecast ({horizon} {freq_label(freq)})")
    fig.tight_layout()
    slug = name.lower().replace(" ", "_")
    fig.savefig(out_dir / f"{slug}_forecast.png", dpi=130)
    plt.close(fig)
    pd.DataFrame(rows).to_csv(out_dir / f"{slug}_forecast.csv", index=False)
    (out_dir / f"{slug}_metrics.json").write_text(json.dumps(metrics, indent=2))

    print(f"\n== {name}: {len(cols)} series, {len(v)} points each, "
          f"horizon {horizon}, {secs:.1f}s ==")
    print(f"{'series':<12}{'TimesFM WAPE':>14}{'naive WAPE':>12}{'80% cover':>11}")
    for c, m in metrics.items():
        print(f"{c:<12}{m['timesfm']['wape_pct']:>13.1f}%{m['seasonal_naive']['wape_pct']:>11.1f}%"
              f"{m['timesfm']['coverage_80_pct']:>10.0f}%")
    return metrics


def freq_label(freq: str) -> str:
    return "days" if freq == "D" else "weeks"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--data-dir", default=str(HERE / "data"))
    ap.add_argument("--out-dir", default=str(HERE / "output"))
    ap.add_argument("--tea-horizon", type=int, default=28)
    ap.add_argument("--clothing-horizon", type=int, default=13)
    args = ap.parse_args()

    data, out = Path(args.data_dir), Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)

    print("Loading TimesFM 2.5 (first run downloads ~800 MB to ~/.cache/huggingface)...")
    model = load_model(max(args.tea_horizon, args.clothing_horizon, 128))

    run_business(model, "Tea Shop", data / "tea_shop_daily.csv", "date",
                 args.tea_horizon, season=7, freq="D", out_dir=out)
    run_business(model, "Clothing Brand", data / "clothing_brand_weekly.csv", "week",
                 args.clothing_horizon, season=52, freq="W-MON", out_dir=out)
    print(f"\nCharts, forecast CSVs and metrics written to {out}")


if __name__ == "__main__":
    main()
