#!/usr/bin/env bash
# Install TimesFM 2.5 (CPU PyTorch + XReg covariates) into its own venv.
#
#   bash .agents/skills/timesfm-forecasting/install.sh            # venv at ~/.venvs/timesfm
#   TIMESFM_VENV=/path/to/venv bash .../install.sh                # custom location
#   TIMESFM_TORCH_INDEX=https://download.pytorch.org/whl/cu121 bash .../install.sh   # NVIDIA GPU
#
# Weights (~800 MB) download from Hugging Face on first model load.
set -euo pipefail

VENV="${TIMESFM_VENV:-$HOME/.venvs/timesfm}"
TORCH_INDEX="${TIMESFM_TORCH_INDEX:-https://download.pytorch.org/whl/cpu}"
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

python3 -m venv "$VENV"
"$VENV/bin/pip" install -q --upgrade pip
"$VENV/bin/pip" install -q torch --index-url "$TORCH_INDEX"
# Install from GitHub source to match this skill. Not the [xreg] extra: it pins
# jax[cuda] (GBs of CUDA wheels). Plain jax + scikit-learn is all XReg needs on CPU.
"$VENV/bin/pip" install -q "timesfm[torch] @ git+https://github.com/google-research/timesfm.git" \
  jax scikit-learn matplotlib pandas psutil

"$VENV/bin/python" "$SKILL_DIR/scripts/check_system.py" || true
"$VENV/bin/python" -c "import timesfm; print('timesfm OK:', timesfm.TimesFM_2p5_200M_torch.__name__)"
echo "Done. Use: $VENV/bin/python your_script.py"
