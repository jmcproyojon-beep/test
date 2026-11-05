#!/usr/bin/env python3
"""Generate synthetic small-business sales data for TimesFM demos.

Writes two CSVs (all numbers are made up, seeded for reproducibility):

  data/tea_shop_daily.csv       Daily cups sold for a tea shop, Jan 2024 - Oct 2026.
                                Columns: date, hot_tea, iced_tea, bubble_tea, promo
  data/clothing_brand_weekly.csv Weekly units sold for a clothing brand, 2023 - Oct 2026.
                                Columns: week, tshirts, jackets, swimwear, hoodies

Patterns baked in, so you can check the forecasts make sense:
  - Tea: weekend peaks, hot tea up in winter, iced tea up in summer,
    bubble tea growing steadily, ~1 promo day a fortnight (+35%).
  - Clothing: jackets/hoodies peak in winter, swimwear peaks in early summer,
    t-shirts flat-ish with growth, Black Friday week spike on everything.

Usage:
    python make_demo_data.py [--out-dir data]
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd


def tea_shop(rng: np.random.Generator) -> pd.DataFrame:
    dates = pd.date_range("2024-01-01", "2026-10-31", freq="D")
    n = len(dates)
    doy = dates.day_of_year.to_numpy()
    dow = dates.day_of_week.to_numpy()

    # +1 in mid-January, -1 in mid-July
    winter = np.cos(2 * np.pi * (doy - 15) / 365.25)
    weekly = np.where(dow >= 5, 1.30, np.where(dow == 4, 1.10, 1.0))
    promo = (rng.random(n) < 1 / 14).astype(int)
    lift = 1 + 0.35 * promo

    hot = (120 + 45 * winter) * weekly * lift
    iced = (90 - 55 * winter) * weekly * lift
    bubble = (60 + 0.04 * np.arange(n)) * weekly * lift

    def noisy(x):
        return np.maximum(0, rng.poisson(np.maximum(x, 1))).astype(int)

    return pd.DataFrame(
        {
            "date": dates.date,
            "hot_tea": noisy(hot),
            "iced_tea": noisy(iced),
            "bubble_tea": noisy(bubble),
            "promo": promo,
        }
    )


def clothing_brand(rng: np.random.Generator) -> pd.DataFrame:
    weeks = pd.date_range("2023-01-02", "2026-10-26", freq="W-MON")
    n = len(weeks)
    woy = weeks.isocalendar().week.to_numpy().astype(float)
    t = np.arange(n)

    winter = np.cos(2 * np.pi * (woy - 2) / 52.18)  # +1 early Jan
    summer = np.exp(-0.5 * ((woy - 24) / 5) ** 2)  # bump around mid-June
    growth = 1 + 0.003 * t

    # Black Friday = 4th Thursday of November -> spike that ISO week
    bf = np.zeros(n)
    for y in sorted(set(weeks.year)):
        nov = pd.date_range(f"{y}-11-01", f"{y}-11-30", freq="W-THU")
        bf_week = nov[3].isocalendar().week
        bf[(weeks.year == y) & (woy == bf_week)] = 1.0
    spike = 1 + 1.2 * bf

    tshirts = 800 * growth * (1 + 0.15 * summer) * spike
    jackets = 300 * growth * np.maximum(0.15, 1 + 0.9 * winter) * spike
    swimwear = 40 + 600 * summer * growth
    hoodies = 400 * growth * (1 + 0.5 * winter) * spike

    def noisy(x, cv=0.08):
        return np.maximum(0, x * rng.normal(1, cv, n)).round().astype(int)

    return pd.DataFrame(
        {
            "week": weeks.date,
            "tshirts": noisy(tshirts),
            "jackets": noisy(jackets),
            "swimwear": noisy(swimwear, 0.12),
            "hoodies": noisy(hoodies),
        }
    )


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--out-dir", default=str(Path(__file__).parent / "data"))
    args = ap.parse_args()

    out = Path(args.out_dir)
    out.mkdir(parents=True, exist_ok=True)
    rng = np.random.default_rng(42)

    tea = tea_shop(rng)
    tea.to_csv(out / "tea_shop_daily.csv", index=False)
    clo = clothing_brand(rng)
    clo.to_csv(out / "clothing_brand_weekly.csv", index=False)
    print(f"tea_shop_daily.csv: {len(tea)} rows | clothing_brand_weekly.csv: {len(clo)} rows -> {out}")


if __name__ == "__main__":
    main()
