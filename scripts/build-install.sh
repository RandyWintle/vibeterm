#!/bin/bash

# Build and install VibeTerm to /Applications
# Usage: ./scripts/build-install.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_NAME="vibeterm"
BUILD_DIR="$PROJECT_DIR/out/${APP_NAME}-darwin-arm64"
APP_PATH="$BUILD_DIR/${APP_NAME}.app"
DEST_PATH="/Applications/${APP_NAME}.app"

cd "$PROJECT_DIR"

echo "🔨 Building VibeTerm..."
npm run make

echo ""
echo "📦 Installing to /Applications..."

# Kill any running instance
pkill -f "vibeterm" 2>/dev/null || true
sleep 1

# Remove old version if exists
if [ -d "$DEST_PATH" ]; then
    echo "   Removing old version..."
    rm -rf "$DEST_PATH"
fi

# Copy new version
echo "   Copying new version..."
cp -R "$APP_PATH" "$DEST_PATH"

echo ""
echo "✅ VibeTerm installed to /Applications"
echo ""
echo "🚀 Launching..."
open "$DEST_PATH"
