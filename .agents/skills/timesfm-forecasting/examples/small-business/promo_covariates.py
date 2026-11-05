#!/usr/bin/env python3
"""Does telling TimesFM about planned promo days improve the tea-shop forecast?

Runs 6 rolling 28-day backtests on each tea series, twice:
  - plain `forecast()` (no knowledge of promos)
  - `forecast_with_covariates()` with `promo` (0/1) as a dynamic covariate,
    known for both the history AND the forecast window (promos are planned).

Needs jax + scikit-learn (CPU is fine). Run make_demo_data.py first.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import timesfm
import torch

H = 28
HERE = Path(__file__).parent

df = pd.read_csv(HERE / "data" / "tea_shop_daily.csv")
cols = ["hot_tea", "iced_tea", "bubble_tea"]
promo = df["promo"].to_numpy(dtype=np.float32)

torch.set_float32_matmul_precision("high")
model = timesfm.TimesFM_2p5_200M_torch.from_pretrained("google/timesfm-2.5-200m-pytorch")
model.compile(
    timesfm.ForecastConfig(
        max_context=1024, max_horizon=128, normalize_inputs=True,
        use_continuous_quantile_head=True, force_flip_invariance=True,
        infer_is_positive=True, fix_quantile_crossing=True,
        return_backcast=True,  # required by forecast_with_covariates
    )
)

WINDOWS = 6  # rolling backtests, each 28 days, ending 0, 28, ... days before the last date
err = {c: {"plain": [], "promo": [], "plain_pd": [], "promo_pd": [], "actual": []} for c in cols}
n_promo = 0
for k in range(WINDOWS):
    end = len(df) - k * H
    inputs = [df[c].to_numpy(dtype=np.float32)[: end - H] for c in cols]
    cov = promo[:end]
    plain, _ = model.forecast(horizon=H, inputs=inputs)
    # Covariates cover context + horizon; horizon = len(covariate) - len(input)
    with_cov, _ = model.forecast_with_covariates(
        inputs=inputs,
        dynamic_numerical_covariates={"promo": [cov] * len(cols)},
        xreg_mode="xreg + timesfm",
    )
    is_promo = cov[-H:] == 1
    n_promo += int(is_promo.sum())
    for i, c in enumerate(cols):
        a = df[c].to_numpy(dtype=np.float32)[end - H : end]
        # return_backcast=True makes forecast() return backcast + forecast: keep the tail
        p, q = np.asarray(plain[i])[-H:], np.asarray(with_cov[i])[-H:]
        err[c]["plain"].append(np.abs(a - p)); err[c]["promo"].append(np.abs(a - q))
        err[c]["plain_pd"].append(np.abs(a - p)[is_promo]); err[c]["promo_pd"].append(np.abs(a - q)[is_promo])
        err[c]["actual"].append(a)

print(f"{WINDOWS} rolling {H}-day backtests, {n_promo} promo days in total\n")
print(f"{'series':<12}{'plain WAPE':>12}{'+promo WAPE':>13}   promo-day abs error (plain -> +promo)")
for c, e in err.items():
    tot = np.sum(np.concatenate(e["actual"]))
    wp = np.sum(np.concatenate(e["plain"])) / tot * 100
    wq = np.sum(np.concatenate(e["promo"])) / tot * 100
    pp, pq = np.mean(np.concatenate(e["plain_pd"])), np.mean(np.concatenate(e["promo_pd"]))
    print(f"{c:<12}{wp:>11.1f}%{wq:>12.1f}%   {pp:.1f} -> {pq:.1f} cups")
