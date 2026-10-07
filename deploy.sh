#!/bin/bash
# Build the Lean structure visualisation and publish it to
# https://oli.show/leanstructure/ via the box (replaces the FTP GitHub Action).
# Usage: ./deploy.sh [--dry-run]
set -euo pipefail
cd "$(dirname "$0")/math-vis"
yarn install --frozen-lockfile
yarn build
if [ "${1:-}" = --dry-run ]; then find build -type f | sort; echo "would run: box site leanstructure build"; exit 0; fi
~/Code/infra/box site leanstructure build
