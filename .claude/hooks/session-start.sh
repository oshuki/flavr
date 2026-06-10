#!/bin/bash
set -euo pipefail

# Only needed in remote (Claude Code on the web) sessions; local setups manage
# their own node_modules.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR/backend"
npm install --no-audit --no-fund

cd "$CLAUDE_PROJECT_DIR/frontend"
npm install --no-audit --no-fund

echo "session-start: backend and frontend dependencies installed"
