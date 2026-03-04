#!/usr/bin/env bash
# click.sh — Click at absolute screen coordinates using xdotool
# Usage: ./click.sh <x> <y> [left|right|middle|double]
# Defaults to left click
set -euo pipefail

X="${1:?Usage: click.sh <x> <y> [left|right|middle|double]}"
Y="${2:?Usage: click.sh <x> <y> [left|right|middle|double]}"
TYPE="${3:-left}"

XDO="XAUTHORITY=/home/rgadmin/.Xauthority DISPLAY=:0 xdotool"

case "$TYPE" in
    left)
        eval "$XDO mousemove $X $Y"
        sleep 0.1
        eval "$XDO click 1"
        ;;
    right)
        eval "$XDO mousemove $X $Y"
        sleep 0.1
        eval "$XDO click 3"
        ;;
    middle)
        eval "$XDO mousemove $X $Y"
        sleep 0.1
        eval "$XDO click 2"
        ;;
    double)
        eval "$XDO mousemove $X $Y"
        sleep 0.1
        eval "$XDO click --repeat 2 --delay 100 1"
        ;;
    *)
        echo "Unknown click type: $TYPE (use: left, right, middle, double)" >&2
        exit 1
        ;;
esac

echo "Clicked $TYPE at ($X, $Y)"
