import asyncio
from roo_code_client import RooCodeClient

async def test_basic_functionality():
    """Test basic client functionality."""
    client = RooCodeClient()
    
    try:
        print('Testing basic functionality...')
        await client.connect()

        # Test auto-approve settings
        print('\nTesting auto-approve settings...')
        auto_approve_response = await client.set_auto_approve_files(True)
        print('Auto-approve files:', auto_approve_response)

        # Test run command
        print('\nTesting run command...')
        run_response = await client.run('Create a hello world program')
        print('Run response:', run_response)

        # Test allow action
        print('\nTesting allow action...')
        allow_response = await client.allow_action('test action')
        print('Allow response:', allow_response)

        # Test deny action
        print('\nTesting deny action...')
        deny_response = await client.deny_action('test denial')
        print('Deny response:', deny_response)

        # Test stop command
        print('\nTesting stop command...')
        stop_response = await client.stop()
        print('Stop response:', stop_response)

        # Clean up auto-approve setting
        await client.set_auto_approve_files(False)

        print('\nBasic functionality tests completed successfully!')
    finally:
        await client.close()

async def test_error_handling():
    """Test error handling scenarios."""
    print('\nTesting error handling...')
    
    # Test invalid port connection
    try:
        invalid_client = RooCodeClient(1234)
        await invalid_client.connect()
        print('ERROR: Expected connection error for invalid port')
    except Exception as e:
        print('Successfully caught invalid port error:', str(e))

    # Test sending command without connection
    try:
        disconnected_client = RooCodeClient()
        await disconnected_client.run('test')
        print('ERROR: Expected error for sending without connection')
    except ConnectionError as e:
        print('Successfully caught disconnected error:', str(e))

    # Test invalid command format
    client = RooCodeClient()
    try:
        await client.connect()
        await client.send('invalid_command', {})
        print('ERROR: Expected error for invalid command')
    except Exception as e:
        print('Successfully caught invalid command error:', str(e))
    finally:
        await client.close()

    print('Error handling tests completed successfully!')

async def test_connection_timeout():
    """Test connection timeout scenarios."""
    print('\nTesting connection timeout...')
    
    # Test connection timeout
    timeout_client = RooCodeClient(9999)  # Use non-existent port
    try:
        async with asyncio.timeout(5):  # Python 3.11+ syntax
            await timeout_client.connect()
        print('ERROR: Expected timeout error')
    except asyncio.TimeoutError:
        print('Successfully caught timeout error')
    except Exception as e:
        print('Successfully caught connection error:', str(e))

    print('Timeout tests completed successfully!')

async def run_all_tests():
    """Run all test suites."""
    try:
        await test_basic_functionality()
        await test_error_handling()
        await test_connection_timeout()
        print('\nAll tests completed successfully!')
    except Exception as e:
        print('\nTest suite failed:', e)
        raise

def main():
    """Main entry point for tests."""
    try:
        asyncio.run(run_all_tests())
    except KeyboardInterrupt:
        print('\nTests interrupted by user')
    except Exception as e:
        print('Error running tests:', e)
        exit(1)

if __name__ == '__main__':
    main()
