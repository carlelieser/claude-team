# Tray Icons

This directory contains tray icons for different states of the Claude Team application.

## Required Icons

| File | Description | Color |
|------|-------------|-------|
| `tray-idle.png` | Default idle state | Gray outline |
| `tray-idle@2x.png` | Retina version | Gray outline |
| `tray-working.png` | Processing tasks | Blue/animated |
| `tray-working@2x.png` | Retina version | Blue/animated |
| `tray-working-0.png` to `tray-working-3.png` | Animation frames | Blue |
| `tray-attention.png` | Requires user attention | Orange |
| `tray-attention@2x.png` | Retina version | Orange |
| `tray-error.png` | Error state | Red |
| `tray-error@2x.png` | Retina version | Red |

## Sizes

- Standard: 16x16 pixels
- Retina (@2x): 32x32 pixels

## macOS Template Images

On macOS, icons should be template images (monochrome with transparency).
The app will automatically set `setTemplateImage(true)` for macOS.

## Generating Icons

You can generate icons from SVG using the provided script:

```bash
# Install dependencies (macOS)
brew install librsvg

# Generate all icons
./generate-icons.sh
```

Or manually using ImageMagick:

```bash
# Standard size
rsvg-convert -w 16 -h 16 tray-idle.svg > tray-idle.png

# Retina size
rsvg-convert -w 32 -h 32 tray-idle.svg > tray-idle@2x.png
```
