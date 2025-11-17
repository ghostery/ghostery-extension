#!/bin/sh

set -e

echo "=========================================="
echo "Installing Node.js and dependencies"
echo "=========================================="

# Navigate to the repository root
cd "$CI_WORKSPACE"

# Install asdf if not already installed
if ! command -v asdf &> /dev/null; then
    echo "Installing asdf..."
    brew install asdf
    
    # Source asdf
    if [ -f /opt/homebrew/opt/asdf/libexec/asdf.sh ]; then
        . /opt/homebrew/opt/asdf/libexec/asdf.sh
    elif [ -f /usr/local/opt/asdf/libexec/asdf.sh ]; then
        . /usr/local/opt/asdf/libexec/asdf.sh
    fi
else
    echo "asdf is already installed"
    
    # Source asdf
    if [ -f /opt/homebrew/opt/asdf/libexec/asdf.sh ]; then
        . /opt/homebrew/opt/asdf/libexec/asdf.sh
    elif [ -f /usr/local/opt/asdf/libexec/asdf.sh ]; then
        . /usr/local/opt/asdf/libexec/asdf.sh
    fi
fi

# Install Node.js plugin for asdf if not already installed
if ! asdf plugin list | grep -q nodejs; then
    echo "Adding Node.js plugin to asdf..."
    asdf plugin add nodejs
fi

# Install Node.js version specified in .tool-versions
echo "Installing Node.js version from .tool-versions..."
asdf install nodejs

# Set the local Node.js version
asdf reshim nodejs

echo "Node.js installed via asdf:"
node --version
npm --version

# Install npm dependencies
echo "Installing npm dependencies..."
npm ci

echo "=========================================="
echo "Dependencies installed successfully"
echo "=========================================="
