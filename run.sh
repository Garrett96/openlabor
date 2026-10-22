#!/bin/bash

chmod +x run.sh

echo "🚀 Welcome to OpenLabor Setup!"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo " Node.js is not installed."
    echo "Please install it from https://nodejs.org/ and try again."
    exit 1
fi

echo "✅ Node.js is installed."

# Consent Prompt - In the event user does not have Node.js
if [ ! -d "node_modules" ]; then
    echo ""
    echo "This script will install dependencies, build the application, and start a local server."
    echo ""
    read -p "Do you consent to proceeding with the installation and setup? (y/N): " consent
    if [[ "$consent" != "y" && "$consent" != "Y" ]]; then
        echo "Setup cancelled."
        exit 0
    fi

    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed."
fi

echo " Building application..."
npm run build

echo ""
echo "✅ Setup complete! Starting local server..."
echo "OpenLabor is now running at: http://localhost:8070"
echo "Press Ctrl+C to stop the server."
echo ""

npx serve dist -l 8070 -s
