#!/usr/bin/env node

const WebSocket = require('ws');

// Create WebSocket connection
const ws = new WebSocket('ws://localhost:7800');

// Connection opened
ws.on('open', () => {
    console.log('\n[Connected] WebSocket connection established');
    
    // Send initial state request
    const message = {
        type: "status",
        statusType: "requestState"
    };
    ws.send(JSON.stringify(message));
    console.log('\n[Sent] Initial state request');
});

// Listen for messages
ws.on('message', (data) => {
    try {
        const message = JSON.parse(data.toString());
        console.log('\n[Received Message]');
        console.log(JSON.stringify(message, null, 2));
        console.log(''); // Empty line for readability
    } catch (error) {
        console.error('[Error] Parsing message:', error);
        console.log('[Raw message]:', data.toString());
    }
});

// Handle errors
ws.on('error', (error) => {
    console.error('[Error]', error.message);
});

// Handle disconnection
ws.on('close', () => {
    console.log('\n[Disconnected] WebSocket connection closed');
    process.exit(0);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\nClosing WebSocket connection...');
    ws.close();
});

console.log('\n[Starting] Connecting to WebSocket server...');
