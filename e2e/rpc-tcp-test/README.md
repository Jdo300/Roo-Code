# RPC TCP Test Client

This is a test client for the Roo Code RPC TCP interface. It tests various API methods and logs the results.

## Configuration

The client can be configured using environment variables:

- `ROO_HOST`: The host to connect to (default: 'localhost')
- `ROO_PORT`: The port to connect to (default: 3000)

## Running the Tests

To run the tests:

```bash
# Using default configuration
node test-client.js

# Using custom host and port
ROO_HOST=192.168.1.100 ROO_PORT=4000 node test-client.js
```

## Test Coverage

The test script exercises the following RooCodeClient functionality:

1. Connection handling and event listeners
2. Basic API methods:
    - isReady()
    - startNewTask()
    - getCurrentTaskStack()
    - sendMessage()
    - getMessages()
    - getTokenUsage()
    - clearCurrentTask()

## Output

The test script logs all operations with timestamps and categories:

- `[INFO]`: General information about test execution
- `[EVENT]`: Client events (connect, disconnect, etc.)
- `[TEST]`: Start of individual test cases
- `[RESULT]`: Test results and responses
- `[ERROR]`: Error messages and failures

Example output:

```
[2025-04-27T20:55:00.000Z] [INFO] Connecting to server... {"host":"localhost","port":3000}
[2025-04-27T20:55:00.100Z] [EVENT] Connected to server
[2025-04-27T20:55:00.200Z] [TEST] Testing isReady()
[2025-04-27T20:55:00.300Z] [RESULT] isReady() returned true
```

## Error Handling

The script includes comprehensive error handling:

- All API calls are wrapped in try/catch blocks
- Connection errors are logged and handled gracefully
- Process exits with code 1 on fatal errors
