#!/bin/bash

# Generate tray icons from SVG sources
# Requires: librsvg (brew install librsvg) or ImageMagick (brew install imagemagick)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check for rsvg-convert or convert
if command -v rsvg-convert &> /dev/null; then
  CONVERT_CMD="rsvg-convert"
elif command -v convert &> /dev/null; then
  CONVERT_CMD="magick convert"
else
  echo "Error: Please install librsvg (brew install librsvg) or ImageMagick (brew install imagemagick)"
  exit 1
fi

echo "Generating tray icons..."

# Generate idle icons
if [ -f "tray-idle.svg" ]; then
  if [ "$CONVERT_CMD" = "rsvg-convert" ]; then
    rsvg-convert -w 16 -h 16 tray-idle.svg > tray-idle.png
    rsvg-convert -w 32 -h 32 tray-idle.svg > tray-idle@2x.png
  else
    convert -background none -resize 16x16 tray-idle.svg tray-idle.png
    convert -background none -resize 32x32 tray-idle.svg tray-idle@2x.png
  fi
  echo "  Created tray-idle.png and tray-idle@2x.png"
fi

# Create placeholder PNGs for other states if SVGs don't exist
for state in working attention error; do
  if [ ! -f "tray-${state}.png" ]; then
    # Copy idle as placeholder
    cp tray-idle.png "tray-${state}.png" 2>/dev/null || true
    cp tray-idle@2x.png "tray-${state}@2x.png" 2>/dev/null || true
    echo "  Created tray-${state}.png (placeholder)"
  fi
done

# Create working animation frames
for i in 0 1 2 3; do
  if [ ! -f "tray-working-${i}.png" ]; then
    cp tray-working.png "tray-working-${i}.png" 2>/dev/null || true
    echo "  Created tray-working-${i}.png (placeholder)"
  fi
done

echo "Done!"
