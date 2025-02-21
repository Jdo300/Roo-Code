const WebSocket = require('ws');

class RooCodeClient {
    constructor(port = 7800) {
        this.port = port;
        this.ws = null;
        this.messageHandlers = new Map();
        this.connected = false;
    }

    async connect(retries = 3, retryDelay = 2000) {
        return new Promise(async (resolve, reject) => {
            let attempts = 0;
            
            const tryConnect = async () => {
                try {
                    this.ws = new WebSocket(`ws://localhost:${this.port}`);

                    this.ws.on('open', () => {
                        console.log('Connected to Roo Code WebSocket server');
                        this.connected = true;
                        resolve();
                    });

                    this.ws.on('message', (data) => {
                        const response = JSON.parse(data.toString());
                        
                        // Call any registered message handlers
                        if (this.messageHandlers.has(response.type)) {
                            this.messageHandlers.get(response.type)(response);
                        }
                    });

                    this.ws.on('error', async (error) => {
                        console.error(`WebSocket error (attempt ${attempts + 1}/${retries}):`, error.message);
                        if (attempts < retries) {
                            attempts++;
                            console.log(`Retrying in ${retryDelay}ms...`);
                            await new Promise(r => setTimeout(r, retryDelay));
                            tryConnect();
                        } else {
                            reject(new Error(`Failed to connect after ${retries} attempts: ${error.message}`));
                        }
                    });

                    this.ws.on('close', () => {
                        console.log('Disconnected from Roo Code WebSocket server');
                        this.connected = false;
                    });
                } catch (error) {
                    if (attempts < retries) {
                        attempts++;
                        console.log(`Retrying in ${retryDelay}ms...`);
                        await new Promise(r => setTimeout(r, retryDelay));
                        tryConnect();
                    } else {
                        reject(new Error(`Failed to connect after ${retries} attempts: ${error.message}`));
                    }
                }
            };

            await tryConnect();
        });
    }

    async send(command, value) {
        if (!this.connected) {
            throw new Error('Not connected to server');
        }

        return new Promise((resolve, reject) => {
            const message = { command, value };

            // Register one-time handler for the response
            const responseType = `${command}_response`;
            const handler = (response) => {
                this.messageHandlers.delete(responseType);
                resolve(response);
            };
            this.messageHandlers.set(responseType, handler);

            // Send the message
            this.ws.send(JSON.stringify(message), (error) => {
                if (error) {
                    this.messageHandlers.delete(responseType);
                    reject(error);
                }
            });

            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.messageHandlers.has(responseType)) {
                    this.messageHandlers.delete(responseType);
                    reject(new Error('Response timeout'));
                }
            }, 30000);
        });
    }

    async close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.connected = false;
        }
    }

    // Helper methods for common commands with verification support
    async run(action) {
        return this.send('run', action);
    }

    async stop() {
        return this.send('stop');
    }

    async reject(reason) {
        return this.send('reject', { message: reason });
    }

    async allowAction(action) {
        return this.send('allow_action', action);
    }

    async denyAction(reason) {
        return this.send('deny_action', { message: reason });
    }

    // Setting commands with verification support
    async setAutoApproveFiles(enabled, verify = false) {
        const response = await this.send('set_auto_approve_files', enabled);
        if (verify) {
            return this.verifySettingUpdate('autoApproveFiles', enabled, response);
        }
        return response;
    }

    async setAutoApproveTerminal(enabled, verify = false) {
        const response = await this.send('set_auto_approve_terminal', enabled);
        if (verify) {
            return this.verifySettingUpdate('autoApproveTerminal', enabled, response);
        }
        return response;
    }

    async setAutoApproveBrowser(enabled, verify = false) {
        const response = await this.send('set_auto_approve_browser', enabled);
        if (verify) {
            return this.verifySettingUpdate('autoApproveBrowser', enabled, response);
        }
        return response;
    }

    // Verification helper method - now using standard JS syntax
    async verifySettingUpdate(settingName, expectedValue, response) {
        const state = await this.send('requestState');
        const actualValue = state?.message ? JSON.parse(state.message)[settingName] : undefined;
        const success = actualValue === expectedValue;

        return {
            ...response,
            verification: {
                success,
                settingName,
                expectedValue,
                actualValue
            }
        };
    }
}

module.exports = { RooCodeClient };

// Example usage
if (require.main === module) {
    (async () => {
        const client = new RooCodeClient(7800);
        try {
            console.log("Attempting to connect to Roo Code WebSocket server...");
            await client.connect();
            console.log("Connection established, waiting for messages...");
            
            // Handle process termination
            process.on('SIGINT', async () => {
                console.log("\nClosing connection...");
                await client.close();
                process.exit(0);
            });
        } catch (error) {
            console.error("Connection failed:", error);
            process.exit(1);
        }
    })();
}
