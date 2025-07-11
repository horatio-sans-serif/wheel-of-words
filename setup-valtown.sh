#!/bin/bash

# Val.town setup script for Wheel of Words

echo "Setting up Val.town for Wheel of Words..."

# Check if deno is installed
if ! command -v deno &> /dev/null; then
    echo "Deno is required. Please install Deno first:"
    echo "curl -fsSL https://deno.land/install.sh | sh"
    exit 1
fi

# Install vt CLI globally using Deno
echo "Installing Val.town CLI..."
deno install -grAf jsr:@valtown/vt

# Note: Authentication happens on first use
echo "The CLI will prompt for authentication on first use."
echo "You'll need to create an API key with 'user read & val read+write' permissions"

# Create the wheelOfWordsStorage val directory
echo "Creating wheelOfWordsStorage val..."
vt create wheelOfWordsStorage

# Copy the val code to the created directory
echo "Setting up the val code..."
cp valtown-endpoint.js wheelOfWordsStorage/index.ts

# Push the val to Val.town
echo "Pushing val to Val.town..."
cd wheelOfWordsStorage
vt push
cd ..

# Get the username from the val town config
USERNAME=$(vt config get username 2>/dev/null | grep -v "error" | tr -d '"')

# Update the HTML file with the correct endpoint
if [ ! -z "$USERNAME" ]; then
    echo "Updating index.html with your Val.town username: $USERNAME"
    sed -i.bak "s|YOUR_USERNAME|$USERNAME|g" index.html
    echo "Updated! Your endpoint is: https://${USERNAME}.val.run/wheelOfWordsStorage"
else
    echo "Could not determine username. Please manually update YOUR_USERNAME in index.html"
fi

echo "Setup complete! Your Val.town storage endpoint is ready."
echo "You can now use the SAVE and LOAD buttons in your Wheel of Words app."