#!/bin/bash

# Automatically grant execute permissions to this script for future runs
chmod +x run.sh

echo "🚀 Welcome to OpenLabor Setup!"
echo ""
echo "This script will install dependencies, build the application, and start a local server."
echo "It requires Node.js to be installed on your system."
echo ""

# Consent Prompt
read -p "Do you consent to proceeding with the installation and setup? (y/N): " consent
if [[ "$consent" != "y" && "$consent" != "Y" ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo "Please install it from https://nodejs.org/ and try again."
    exit 1
fi

# Install dependencies (if not already installed)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed."
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Start the local server
echo ""
echo "✅ Setup complete! Starting local server..."
echo "OpenLabor is now running at: http://localhost:8070"
echo "Press Ctrl+C to stop the server."
echo ""

# Serve the built files on port 8070
npx serve dist -l 8070 -s
