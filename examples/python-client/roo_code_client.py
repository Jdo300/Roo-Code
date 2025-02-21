import asyncio
import json
import websockets
from typing import Optional, Any, Dict

class RooCodeClient:
    def __init__(self, port: int = 7800):
        self.port = port
        self.uri = f"ws://localhost:{port}"
        self.ws: Optional[websockets.WebSocketClientProtocol] = None
        self.connected = False

    async def connect(self) -> None:
        """Connect to the Roo Code WebSocket server."""
        try:
            self.ws = await websockets.connect(self.uri)
            self.connected = True
            print("Connected to Roo Code WebSocket server")
        except Exception as e:
            print(f"Failed to connect: {e}")
            raise

    async def send(self, command: str, value: Any = None) -> Dict:
        """Send a command to the server and wait for response."""
        if not self.ws or not self.connected:
            raise ConnectionError("Not connected to server")

        message = {
            "command": command,
            "value": value
        }

        try:
            await self.ws.send(json.dumps(message))
            response = await asyncio.wait_for(self.ws.recv(), timeout=30)
            return json.loads(response)
        except asyncio.TimeoutError:
            raise TimeoutError("Server response timeout")
        except Exception as e:
            raise ConnectionError(f"Error sending message: {e}")

    async def close(self) -> None:
        """Close the WebSocket connection."""
        if self.ws:
            await self.ws.close()
            self.ws = None
            self.connected = False
            print("Disconnected from Roo Code WebSocket server")

    # Helper methods for common commands
    async def run(self, action: str) -> Dict:
        """Execute a proposed action."""
        return await self.send("run", action)

    async def stop(self) -> Dict:
        """Stop the current task."""
        return await self.send("stop")

    async def reject(self, reason: str) -> Dict:
        """Reject a proposed action."""
        return await self.send("reject", {"message": reason})

    async def allow_action(self, action: str) -> Dict:
        """Allow a specific action."""
        return await self.send("allow_action", action)

    async def deny_action(self, reason: str) -> Dict:
        """Deny a specific action."""
        return await self.send("deny_action", {"message": reason})

    async def set_auto_approve_files(self, enabled: bool) -> Dict:
        """Enable/disable auto-approve for file operations."""
        return await self.send("set_auto_approve_files", enabled)

    async def set_auto_approve_terminal(self, enabled: bool) -> Dict:
        """Enable/disable auto-approve for terminal commands."""
        return await self.send("set_auto_approve_terminal", enabled)

    async def set_auto_approve_browser(self, enabled: bool) -> Dict:
        """Enable/disable auto-approve for browser actions."""
        return await self.send("set_auto_approve_browser", enabled)

class RooCodeContextManager:
    """Context manager for auto-closing the client connection."""
    def __init__(self, port: int = 7800):
        self.client = RooCodeClient(port)

    async def __aenter__(self) -> RooCodeClient:
        await self.client.connect()
        return self.client

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.close()

# Example usage with context manager
async def example_usage():
    async with RooCodeContextManager() as client:
        # Enable auto-approve for files
        await client.set_auto_approve_files(True)
        
        # Run a command
        response = await client.run("Create a hello world program")
        print(f"Run response: {response}")
        
        # Stop the task
        await client.stop()
        
        # Disable auto-approve for files
        await client.set_auto_approve_files(False)

if __name__ == "__main__":
    # Run the example
    asyncio.run(example_usage())
