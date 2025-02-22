#!/usr/bin/env node

const WebSocket = require('ws');
const fs = require('fs');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const ws = new WebSocket('ws://localhost:7800');

function sendMessage(message) {
    console.log('\nSending:', JSON.stringify(message, null, 2));
    ws.send(JSON.stringify(message));
}

function startInteractiveMode() {
    console.log('\nStarting Interactive Mode');
    displayHelp();
    promptCommand();
}

function displayHelp() {
    console.log('\nAvailable commands:');
    console.log('  help, ?             - Display this help message');
    console.log('  exit                - Exit the test script');
    
    console.log('\nMessage format:');
    console.log('  {"message": "Chat message to send"}');
    console.log('  {"command": "commandName", "value": value}');
    
    console.log('\nExamples:');
    console.log('  {"message": "Hello Cline!"}');
    console.log('  {"command": "requestState"}');
    console.log('  {"command": "alwaysAllowFiles", "value": true}');
}

function promptCommand() {
    readline.question('> ', (commandString) => {
        try {
            const command = JSON.parse(commandString);
            sendMessage(command);
        } catch (error) {
            console.error('Error parsing command (must be valid JSON):', error.message);
        }
        promptCommand();
    });
}

function startNonInteractiveMode(filePath) {
    let commands;
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        commands = JSON.parse(fileContent);
        if (!Array.isArray(commands)) {
            commands = [commands]; // Convert single command to array
        }
    } catch (error) {
        console.error('Error reading/parsing commands file:', error.message);
        process.exit(1);
    }

    console.log(`Running ${commands.length} commands from ${filePath}...`);
    let commandsSentCount = 0;

    function sendCommandsSequentially(index) {
        if (index < commands.length) {
            const command = commands[index];
            console.log(`\n[Command ${index + 1}/${commands.length}]`);
            console.log(JSON.stringify(command, null, 2));
            sendMessage(command);
        }
    }

    ws.on('message', (message) => {
        try {
            const response = JSON.parse(message);
            console.log('\n[Response]');
            console.log(JSON.stringify(response, null, 2));
        } catch (error) {
            console.error('Error parsing response:', error.message);
            console.log('Raw response:', message.toString());
        } finally {
            // Send next command or exit
            commandsSentCount++;
            if (commandsSentCount < commands.length) {
                sendCommandsSequentially(commandsSentCount);
            } else {
                ws.close();
            }
        }
    });

    // Start sending commands
    sendCommandsSequentially(commandsSentCount);
}

ws.on('open', () => {
    console.log('WebSocket Connected');
    
    // Add a 1-second delay before sending commands
    setTimeout(() => {
        const args = process.argv.slice(2);
        if (args[0] === 'non-interactive') {
            if (!args[1]) {
                console.error('Error: No commands file specified');
                console.log('Usage: node test-commands.cjs non-interactive <commands.json>');
                process.exit(1);
            }
            startNonInteractiveMode(args[1]);
        } else {
            startInteractiveMode();
        }
    }, 1000); // 1000 milliseconds = 1 second
});

ws.on('error', (error) => {
    console.error('WebSocket Error:', error);
    readline.close();
    process.exit(1);
});

ws.on('close', () => {
    console.log('\nWebSocket Disconnected');
    readline.close();
    process.exit(0);
});
