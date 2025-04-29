import asyncio
import logging
import os
import json
from rpc_client.client import RooCodeClient
from rpc_client.types import TcpConfig, RooCodeClientConfig, RooCodeSettings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variable to store received message chunks for streaming test
received_message_chunks = []
full_received_message = ""

async def main():
    # Get configuration from environment variables
    host = os.environ.get('ROO_CODE_IPC_TCP_HOST', 'localhost')
    port = int(os.environ.get('ROO_CODE_IPC_TCP_PORT', '7800'))

    logger.info(f"Connecting to {host}:{port}")

    # Create client configuration
    config = TcpConfig(
        host=host,
        port=port,
        client_config=RooCodeClientConfig(
            connect_timeout=5000,
            request_timeout=60000 # Increased timeout for potentially long AI responses
        )
    )

    # Create client instance
    client = RooCodeClient(config)

    # Set up event handlers
    def on_connect(data):
        logger.info(f"Event: Connected: {data}")

    def on_disconnect():
        logger.info("Event: Disconnected")

    def on_error(error):
        logger.error(f"Event: Error: {error}")

    def on_task_update(data):
        logger.info(f"Event: Task update: {data}")

    def on_task_started(data):
        logger.info(f"Event: Task Started: {data}")

    def on_task_completed(data):
        logger.info(f"Event: Task Completed: {data}")

    def on_message_received(data):
        global received_message_chunks, full_received_message
        logger.info(f"Event: Message Received (chunk): {data}")
        # Assuming 'data' contains the message chunk
        if isinstance(data, str):
            received_message_chunks.append(data)
            full_received_message += data
        # Check if this is the last chunk (this might require inspecting the data structure
        # or waiting for a task completion event, depending on server implementation)
        # For now, we'll just accumulate and check the full message later.

    def on_tool_use(data):
        logger.info(f"Event: Tool Use: {data}")

    def on_tool_result(data):
        logger.info(f"Event: Tool Result: {data}")

    def on_tool_error(data):
        logger.error(f"Event: Tool Error: {data}")


    client.add_event_listener('connect', on_connect)
    client.add_event_listener('disconnect', on_disconnect)
    client.add_event_listener('error', on_error)
    client.add_event_listener('taskUpdate', on_task_update)
    client.add_event_listener('taskStarted', on_task_started)
    client.add_event_listener('taskCompleted', on_task_completed)
    client.add_event_listener('messageReceived', on_message_received)
    client.add_event_listener('toolUse', on_tool_use)
    client.add_event_listener('toolResult', on_tool_result)
    client.add_event_listener('toolError', on_tool_error)


    try:
        # Connect to server
        await client.connect()
        logger.info("Connected to server")

        # Test various commands
        try:
            # --- Test Configuration Commands ---
            logger.info("\n--- Testing Configuration Commands ---")
            initial_config = await client.get_configuration()
            logger.info(f"Initial configuration: {initial_config}")

            test_settings = RooCodeSettings(
                apiProvider="test-provider",
                currentApiConfigName="test-config",
                autoApprovalEnabled=False,
                alwaysAllowReadOnly=False,
                alwaysAllowWrite=False,
                alwaysAllowBrowser=False,
                alwaysAllowExecute=False
            )
            await client.set_configuration(test_settings)
            logger.info("Set configuration to test values")

            updated_config = await client.get_configuration()
            logger.info(f"Updated configuration: {updated_config}")
            # Basic verification (more robust checks could be added)
            if updated_config.get("apiProvider") == "test-provider":
                 logger.info("Configuration test: set_configuration and get_configuration successful.")
            else:
                 logger.warning("Configuration test: set_configuration or get_configuration failed.")


            # --- Test Basic API Commands ---
            logger.info("\n--- Testing Basic API Commands ---")
            # Start a new task
            task_id = await client.start_new_task(
                text="Hello from Python client! Test basic commands.",
                configuration={
                    "apiProvider": "fake-ai",  # Use fake-ai provider for testing
                    "currentApiConfigName": "test",
                    "autoApprovalEnabled": True,  # Enable auto-approval for test
                    "alwaysAllowReadOnly": True,
                    "alwaysAllowWrite": True,
                    "alwaysAllowBrowser": True,
                    "alwaysAllowExecute": True
                }
            )
            logger.info(f"Started new task: {task_id}")

            # Check if task exists
            exists = await client.is_task_in_history(task_id)
            logger.info(f"Task exists in history: {exists}")

            # Get current task stack
            stack = await client.get_current_task_stack()
            logger.info(f"Current task stack: {stack}")

            # Send a message
            await client.send_message("Another test message from Python")
            logger.info("Message sent")

            # Test profile operations (already in original script, keeping for completeness)
            logger.info("\n--- Testing Profile Operations ---")
            profile_name = "test_profile"
            try:
                created_profile = await client.create_profile(profile_name)
                logger.info(f"Created profile: {created_profile}")

                profiles = await client.get_profiles()
                logger.info(f"Available profiles: {profiles}")

                await client.set_active_profile(profile_name)
                logger.info(f"Set active profile to: {profile_name}")

                active_profile = await client.get_active_profile()
                logger.info(f"Current active profile: {active_profile}")

            except Exception as e:
                 logger.warning(f"Profile operations test failed: {e}")
            finally:
                 # Clean up profile if it was created
                 try:
                     await client.delete_profile(profile_name)
                     logger.info(f"Deleted profile: {profile_name}")
                 except Exception:
                     pass # Ignore if delete fails (e.g., profile wasn't created)


            # --- Test Streaming Functionality ---
            logger.info("\n--- Testing Streaming Functionality ---")
            global received_message_chunks, full_received_message
            received_message_chunks = [] # Reset for this test
            full_received_message = ""

            # Send a message designed to trigger a long AI response
            await client.send_message("Write a detailed explanation of quantum entanglement. Make it at least 500 words long.")
            logger.info("Sent message to trigger streaming.")

            # Wait for task completion or a significant amount of time
            # A more robust test would wait for a specific event indicating the end of the message stream
            # For now, we'll wait a fixed time and check the accumulated message
            await asyncio.sleep(30) # Wait for potential streaming to finish

            logger.info(f"Streaming test: Received {len(received_message_chunks)} chunks.")
            logger.info(f"Streaming test: Full received message length: {len(full_received_message)}")
            if len(received_message_chunks) > 1 and len(full_received_message) > 100: # Basic check for streaming and content
                 logger.info("Streaming test: Streaming appears to be working and chunks were assembled.")
            else:
                 logger.warning("Streaming test: Streaming may not have worked as expected.")
                 logger.warning("Full received message content (first 200 chars):")
                 logger.warning(full_received_message[:200] + "...")


            # --- Test Event Broadcasting (already handled by logging in event handlers) ---
            logger.info("\n--- Testing Event Broadcasting ---")
            logger.info("Event broadcasting is being tested by logging messages from event handlers.")
            logger.info("Look for 'Event:' lines in the output.")


            # Clear current task after all tests
            await client.clear_current_task("All tests completed")
            logger.info("Cleared current task")

        except Exception as e:
            logger.error(f"Error during test execution: {e}")

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