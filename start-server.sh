#!/bin/bash

echo "Starting IODD Server..."
echo "========================"

# Navigate to server directory
cd server3/s32_iodd-data-api

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server
echo "Starting server on port 54382..."
echo "Press Ctrl+C to stop the server"
echo ""

node server.mjs