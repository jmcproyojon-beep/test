# TimesFM Forecasting Skill — Provenance

Vendored from Google Research's first-party agent skill:

- **Source**: https://github.com/google-research/timesfm (`timesfm-forecasting/`)
- **Vendored commit**: `e51928e` (2026-09-29), package version `3.0.2`
- **Vendor date**: 2026-11-05

## What's vendored vs. local

| Path | Origin |
|---|---|
| `SKILL.md`, `references/`, `scripts/`, `examples/{anomaly-detection,covariates-forecasting,finetuning,global-temperature}/` | Upstream, unchanged except the "Using this skill in OpenMontage" section at the top of `SKILL.md` |
| `examples/*/output/` | **Not vendored** (~2 MB of pre-rendered PNG/GIF). Regenerate by running the examples |
| `install.sh` | Local: one-shot CPU install with plain `jax` instead of `jax[cuda]` |
| `examples/small-business/` | Local: synthetic tea-shop and clothing-brand demo, backtests, promo covariates |

## Upstream quirks found while testing

- `pip install timesfm[xreg]` pins `jax[cuda]`, which downloads several GB of CUDA wheels
  even on CPU-only machines. `install.sh` installs `jax scikit-learn` instead.
- `scripts/forecast_csv.py` labels q10/q90 as `lower_90`/`upper_90`, but q10–q90 is an
  **80%** interval, and q20–q80 (`lower_80`/`upper_80`) is a 60% interval.
- With `return_backcast=True` (required by `forecast_with_covariates`), plain `forecast()`
  returns backcast + forecast. Slice `[-horizon:]`.

## Re-vendoring

```bash
git clone --depth 1 https://github.com/google-research/timesfm.git /tmp/timesfm
(cd /tmp/timesfm/timesfm-forecasting && tar cf - --exclude='./examples/*/output' .) \
  | tar xf - -C .agents/skills/timesfm-forecasting
# then re-add the OpenMontage section at the top of SKILL.md and update this file
```
