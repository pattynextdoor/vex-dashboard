#!/bin/bash
# Deploy script for vex-dashboard
# Checks for new commits and deploys if needed

set -e

cd /root/vex-dashboard

# Store current commit hash
OLD_COMMIT=$(git rev-parse HEAD)

# Check for updates
echo "Checking for updates..."
git fetch origin main

# Get latest commit hash from remote
NEW_COMMIT=$(git rev-parse origin/main)

if [ "$OLD_COMMIT" != "$NEW_COMMIT" ]; then
  echo "🜏 New commits found, deploying..."
  
  # Pull latest changes
  git pull origin main
  
  # Install dependencies
  bun install
  
  # Build project
  bun run build
  
  # Restart service
  systemctl restart vex-dashboard
  
  echo "🜏 Dashboard deployed! ($OLD_COMMIT -> $NEW_COMMIT)"
else
  echo "No updates available"
fi