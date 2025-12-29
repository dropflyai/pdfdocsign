#!/bin/bash

# iOS Simulator Test Script for PDF Form Fields
set -e

echo "🍎 Starting iOS Simulator Test..."

# Kill existing simulators
killall Simulator 2>/dev/null || true
sleep 2

# Boot iPhone 17 Pro simulator (or whatever iPhone Pro is available)
DEVICE_ID=$(xcrun simctl list devices | grep -E "iPhone (17|16|15) Pro \(" | grep -v "unavailable" | grep -v "Max" | head -n 1 | sed -E 's/.*\(([A-F0-9-]+)\).*/\1/')

if [ -z "$DEVICE_ID" ]; then
    echo "❌ No iPhone Pro simulator found"
    echo "Available devices:"
    xcrun simctl list devices
    exit 1
fi

echo "✅ Found device: $DEVICE_ID"

# Boot the device
echo "🔄 Booting simulator..."
xcrun simctl boot "$DEVICE_ID" 2>/dev/null || true
sleep 5

# Open simulator app
open -a Simulator
sleep 3

# Open Safari to localhost:3000
echo "🌐 Opening Safari to http://localhost:3000..."
xcrun simctl openurl "$DEVICE_ID" "http://localhost:3000"
sleep 5

# Take screenshot 1 - Initial load
echo "📸 Taking screenshot 1: Initial load..."
xcrun simctl io "$DEVICE_ID" screenshot tests/screenshots/ios-sim-1-initial.png

echo "⏳ Waiting 10 seconds for you to upload a PDF manually..."
echo "   Please upload a PDF with form fields in the simulator"
sleep 10

# Take screenshot 2 - After PDF upload
echo "📸 Taking screenshot 2: After PDF upload..."
xcrun simctl io "$DEVICE_ID" screenshot tests/screenshots/ios-sim-2-pdf-loaded.png

sleep 5

# Take screenshot 3 - Final state
echo "📸 Taking screenshot 3: Final state..."
xcrun simctl io "$DEVICE_ID" screenshot tests/screenshots/ios-sim-3-final.png

echo ""
echo "✅ Screenshots saved to tests/screenshots/"
echo "   - ios-sim-1-initial.png"
echo "   - ios-sim-2-pdf-loaded.png"
echo "   - ios-sim-3-final.png"
echo ""
echo "📱 Simulator is still running. Check the screenshots to see what's happening!"
