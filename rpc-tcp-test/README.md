# RooCode RPC Client

A Python implementation of the RooCode RPC client for communicating with the RooCode server.

## Features

- Async/await based API
- Support for both TCP and RPC transport
- Event-based communication
- Comprehensive task management interface
- Profile management
- Configurable timeouts and connection settings

## Installation

No installation required - just copy the `rpc_client` directory into your project.

## Usage

```python
import asyncio
from rpc_client import RooCodeClient, TcpConfig

async def main():
    # Create client configuration
    config = TcpConfig(
        host="localhost",
        port=3000,
        connect_timeout=5000,  # milliseconds
        request_timeout=30000  # milliseconds
    )

    # Create client instance
    client = RooCodeClient(config)

    # Set up event handlers
    client.add_event_listener('connect', lambda data: print(f"Connected: {data}"))
    client.add_event_listener('disconnect', lambda: print("Disconnected"))
    client.add_event_listener('error', lambda error: print(f"Error: {error}"))

    try:
        # Connect to server
        await client.connect()

        # Start a new task
        task_id = await client.start_new_task(
            text="Hello!",
            configuration={"mode": "test"}
        )

        # Send a message
        await client.send_message("Test message")

        # Clean up
        await client.clear_current_task()

    finally:
        client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
```

## API Reference

### Configuration

#### TcpConfig

- `host`: Server hostname
- `port`: Server port
- `client_id`: Optional client identifier (default: random UUID)
- `connect_timeout`: Connection timeout in milliseconds (default: 5000)
- `request_timeout`: Request timeout in milliseconds (default: 30000)

#### RpcConfig

- `appspace`: RPC application space name
- Other fields same as TcpConfig

### Client Methods

#### Connection Management

- `connect()`: Connect to the server
- `disconnect()`: Disconnect from the server
- `is_ready()`: Check if client is ready

#### Task Management

- `start_new_task(configuration=None, text=None, images=None, new_tab=None)`: Start a new task
- `resume_task(task_id)`: Resume an existing task
- `is_task_in_history(task_id)`: Check if task exists in history
- `get_current_task_stack()`: Get current task stack
- `clear_current_task(last_message=None)`: Clear current task
- `cancel_current_task()`: Cancel current task
- `send_message(message=None, images=None)`: Send a message
- `get_messages(task_id)`: Get task messages
- `get_token_usage(task_id)`: Get token usage for task

#### Profile Management

- `create_profile(name)`: Create a new profile
- `get_profiles()`: Get all profiles
- `set_active_profile(name)`: Set active profile
- `get_active_profile()`: Get current active profile
- `delete_profile(name)`: Delete a profile

#### Button Controls

- `press_primary_button()`: Press primary button
- `press_secondary_button()`: Press secondary button

### Event Handling

The client emits the following events:

- `connect`: When connected to server
- `disconnect`: When disconnected from server
- `error`: When an error occurs
- `taskUpdate`: When task status updates

Add event listeners using:

```python
client.add_event_listener('event_name', callback_function)
```

Remove event listeners using:

```python
client.remove_event_listener('event_name', callback_function)
```

## Error Handling

The client throws the following exceptions:

- `ConnectionError`: When connection fails or not connected
- `TimeoutError`: When operations timeout
- `ValueError`: When invalid parameters are provided

## Testing

Run the test client:

```bash
python test_client.py
```

This will run through a series of API calls to demonstrate and test the functionality.
