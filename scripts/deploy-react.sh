#!/bin/bash

# Klondike Solitaire Advanced - React Deployment Script
# This script builds and deploys the React + TypeScript + TensorFlow.js version

set -e  # Exit on any error

echo "🚀 Deploying Klondike Solitaire Advanced (React Version)"
echo "======================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes. Consider committing them first."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Running type checks..."
npm run type-check

echo "🧪 Running tests..."
npm run test

echo "🏗️  Building React application..."
npm run build

echo "📊 Analyzing bundle size..."
npm run analyze || echo "⚠️  Bundle analyzer not available"

# Copy additional assets
echo "📋 Copying additional assets..."
cp manifest.json dist/ 2>/dev/null || echo "⚠️  manifest.json not found"
cp sw.js dist/ 2>/dev/null || echo "⚠️  sw.js not found"
cp -r public/* dist/ 2>/dev/null || echo "⚠️  public directory not found"

# Create a custom index.html for React
echo "📝 Setting up React index.html..."
cp index-react.html dist/index.html

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
npm run deploy

echo "✅ Deployment completed successfully!"
echo ""
echo "🎮 Your modernized Solitaire game is now live at:"
echo "   https://$(git config user.name).github.io/$(basename $(pwd))/"
echo ""
echo "🎯 Features deployed:"
echo "   ✓ React + TypeScript architecture"
echo "   ✓ Real TensorFlow.js ML engine"
echo "   ✓ Modern Vite build system"
echo "   ✓ PWA capabilities"
echo "   ✓ Advanced state management"
echo "   ✓ Comprehensive testing"
echo "   ✓ Bundle optimization"
echo ""
echo "🔍 To view locally:"
echo "   npm run dev"
echo ""
echo "📈 To analyze performance:"
echo "   npm run preview"
echo "   npm run analyze" 