# Small-business demo: tea shop + clothing brand

Zero-shot TimesFM 2.5 forecasts on **synthetic** sales data (all numbers are generated,
seeded with 42). Use it to sanity-check an install or as a template for real shop data.

```bash
PY=~/.venvs/timesfm/bin/python        # from ../../install.sh
$PY make_demo_data.py                 # -> data/*.csv
$PY run_demo.py                       # -> output/*_forecast.png|csv, *_metrics.json
$PY promo_covariates.py               # does knowing promo days help? (XReg)
```

| Dataset | Series | Granularity | Built-in patterns |
|---|---|---|---|
| `tea_shop_daily.csv` | `hot_tea`, `iced_tea`, `bubble_tea` (+ `promo` flag) | Daily, Jan 2024 – Oct 2026 | Weekend peaks, winter/summer swap, bubble-tea growth, ~1 promo day per fortnight (+35%) |
| `clothing_brand_weekly.csv` | `tshirts`, `jackets`, `swimwear`, `hoodies` | Weekly, 2023 – Oct 2026 | Winter outerwear, June swimwear peak, growth, Black Friday spike |

## Results on CPU (4 cores, no GPU, ~18 s total including model load)

`run_demo.py` hides the last horizon, forecasts it and compares against a
seasonal-naive baseline (repeat last week or last year). WAPE = total abs error / total sales.

| Series | Horizon | TimesFM WAPE | Seasonal-naive WAPE | 80% interval coverage |
|---|---|---|---|---|
| hot_tea | 28 days | 9.8% | 17.8% | 82% |
| iced_tea | 28 days | 9.4% | 33.8% | 86% |
| bubble_tea | 28 days | 7.8% | 17.7% | 89% |
| tshirts | 13 weeks | 9.3% | 13.4% | 69% |
| jackets | 13 weeks | 15.7% | 13.6% | 100% |
| swimwear | 13 weeks | 11.9% | 13.6% | 100% |
| hoodies | 13 weeks | 11.6% | 13.8% | 100% |

`promo_covariates.py`: six rolling 28-day backtests, 7 promo days in total:

| Series | Plain WAPE | + promo covariate | Mean error on promo days |
|---|---|---|---|
| hot_tea | 10.0% | 9.1% | 33.8 → 19.3 cups |
| iced_tea | 7.8% | 6.9% | 42.7 → 10.0 cups |
| bubble_tea | 8.9% | 7.9% | 47.2 → 24.7 cups |

## What this shows

- Without training, it picks up weekly cycles, season swaps and next year's Black Friday spike.
- It beats the naive baseline on 6 of 7 series. Jackets lose slightly: with only 3.8 years of
  weekly history and a steep autumn ramp, "same as last year" is already a strong guess.
- Known future events (promos, holidays, price changes) belong in `forecast_with_covariates()`.
  Plain `forecast()` can't know a promo is planned.
- Synthetic data is cleaner than real data. Expect higher errors on a real shop's sales.

## Using your own data

Any CSV with a date column and one numeric column per product works:

```bash
$PY ../../scripts/forecast_csv.py my_sales.csv --horizon 28 --date-col date \
    --value-cols latte,croissant --output my_forecast.csv
```

Its `lower_90`/`upper_90` columns are q10/q90, which is an **80%** interval (see `../../PROVENANCE.md`).
