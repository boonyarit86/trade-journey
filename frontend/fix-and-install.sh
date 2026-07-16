#!/bin/bash

echo "Fixing frontend dependencies installation..."

# Fix npm cache permissions
echo "Step 1: Fixing npm cache permissions..."
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"

# Remove node_modules with proper permissions
echo "Step 2: Removing old node_modules..."
sudo rm -rf node_modules package-lock.json

# Install dependencies
echo "Step 3: Installing dependencies..."
npm install --legacy-peer-deps

echo "Done! You can now run: npm run test"
