#!/bin/bash

# Looker CLI Setup Script
echo "🚀 Setting up Looker CLI..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📄 Creating .env file from example..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your Google OAuth credentials."
else
    echo "✅ .env file already exists."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed."
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Test the CLI
echo "🧪 Testing CLI..."
node dist/index.js --help

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your Google OAuth credentials"
echo "2. Run: looker-cli list (to authenticate and list reports)"
echo "3. Check README.md for detailed usage instructions"
echo ""
echo "💡 Quick commands:"
echo "   npm run dev -- list          # Run in development mode"
echo "   node dist/index.js list       # Run built version"
echo "   npm run build                 # Build TypeScript"
echo ""
