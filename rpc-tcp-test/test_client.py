import asyncio
import logging
import os
from rpc_client.client import RooCodeClient
from rpc_client.types import TcpConfig, RooCodeClientConfig

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    # Get configuration from environment variables
    host = os.environ.get('ROO_CODE_IPC_TCP_HOST', 'localhost')
    port = int(os.environ.get('ROO_CODE_IPC_TCP_PORT', '3000'))
    
    logger.info(f"Connecting to {host}:{port}")
    
    # Create client configuration
    config = TcpConfig(
        host=host,
        port=port,
        client_config=RooCodeClientConfig(
            connect_timeout=5000,
            request_timeout=30000
        )
    )

    # Create client instance
    client = RooCodeClient(config)

    # Set up event handlers
    def on_connect(data):
        logger.info(f"Connected: {data}")

    def on_disconnect():
        logger.info("Disconnected")

    def on_error(error):
        logger.error(f"Error: {error}")

    def on_task_update(data):
        logger.info(f"Task update: {data}")

    client.add_event_listener('connect', on_connect)
    client.add_event_listener('disconnect', on_disconnect)
    client.add_event_listener('error', on_error)
    client.add_event_listener('taskUpdate', on_task_update)

    try:
        # Connect to server
        await client.connect()
        logger.info("Connected to server")

        # Test various commands
        try:
            # Start a new task
            task_id = await client.start_new_task(
                text="Hello from Python client!",
                configuration={"mode": "test"}
            )
            logger.info(f"Started new task: {task_id}")

            # Check if task exists
            exists = await client.is_task_in_history(task_id)
            logger.info(f"Task exists in history: {exists}")

            # Get current task stack
            stack = await client.get_current_task_stack()
            logger.info(f"Current task stack: {stack}")

            # Send a message
            await client.send_message("Test message from Python")
            logger.info("Message sent")

            # Test profile operations
            profile_name = "test_profile"
            created_profile = await client.create_profile(profile_name)
            logger.info(f"Created profile: {created_profile}")

            profiles = await client.get_profiles()
            logger.info(f"Available profiles: {profiles}")

            await client.set_active_profile(profile_name)
            logger.info(f"Set active profile to: {profile_name}")

            active_profile = await client.get_active_profile()
            logger.info(f"Current active profile: {active_profile}")

            # Clean up
            await client.delete_profile(profile_name)
            logger.info(f"Deleted profile: {profile_name}")

            # Clear current task
            await client.clear_current_task("Test completed")
            logger.info("Cleared current task")

        except Exception as e:
            logger.error(f"Error during test: {e}")

    except Exception as e:
        logger.error(f"Connection error: {e}")

    finally:
        # Disconnect
        client.disconnect()
        logger.info("Disconnected from server")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Test client stopped by user")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")