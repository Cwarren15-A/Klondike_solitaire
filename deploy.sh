#!/bin/bash

# Klondike Solitaire Deployment Script
echo "🚀 Deploying Klondike Solitaire to GitHub Pages..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "🎮 Deploy Klondike Solitaire v2.0 with enhanced features

- Added haptic feedback for mobile
- Integrated particle effects system
- PWA capabilities with offline support
- Enhanced AI analysis and hints
- Improved mobile touch controls
- Service worker for caching
- Deployment ready"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🌐 Please add your GitHub repository URL:"
    echo "git remote add origin https://github.com/yourusername/klondike-solitaire-ai.git"
    echo ""
    echo "Then run this script again to deploy!"
    exit 1
fi

# Push to main branch
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Click 'Settings' → 'Pages'"
echo "3. Set source to 'Deploy from a branch'"
echo "4. Choose 'main' branch and '/ (root)'"
echo "5. Your game will be live at: https://yourusername.github.io/repository-name/"
echo ""
echo "🎮 Game features deployed:"
echo "• Enhanced mobile controls with haptic feedback"
echo "• Particle effects for victory and card placement"
echo "• PWA installation support"
echo "• Offline gameplay capability"
echo "• Advanced AI analysis and hints"
echo "• Complete board vision AI system"
echo ""
echo "💡 Pro tip: Share your game URL on social media!" 