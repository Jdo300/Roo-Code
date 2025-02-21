const { RooCodeClient } = require('./index.cjs');

async function testChat() {
    const client = new RooCodeClient(7800);
    
    try {
        console.log("Connecting to Roo Code WebSocket server...");
        await client.connect();
        console.log("Connected! Sending chat message...\n");

        // Send a chat message to Cline
        console.log("Sending message to Cline...");
        const message = "Hello Cline! This message was sent through the WebSocket server.";
        const result = await client.send('chat', { message });
        console.log("Response:", result);

        // Close connection
        console.log("\nTest complete, closing connection...");
        await client.close();
        console.log("Connection closed.");
        
    } catch (error) {
        console.error("Error during test:", error);
        process.exit(1);
    }
}

testChat();
