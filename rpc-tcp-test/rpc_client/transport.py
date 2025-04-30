import asyncio
from abc import ABC, abstractmethod
from typing import Optional, Callable, Dict
import json

class Transport(ABC):
    @abstractmethod
    async def connect(self) -> None:
        pass

    @abstractmethod
    def disconnect(self) -> None:
        pass

    @abstractmethod
    def send(self, data: str) -> None:
        pass

    @abstractmethod
    def is_connected(self) -> bool:
        pass

    @abstractmethod
    def add_event_listener(self, event: str, callback: Callable) -> None:
        pass

    @abstractmethod
    def remove_event_listener(self, event: str, callback: Callable) -> None:
        pass

class TcpTransport(Transport):
    def __init__(self, host: str, port: int, connect_timeout: int):
        self.host = host
        self.port = port
        self.connect_timeout = connect_timeout / 1000  # Convert to seconds
        self.reader: Optional[asyncio.StreamReader] = None
        self.writer: Optional[asyncio.StreamWriter] = None
        self.connected = False
        self.event_handlers: Dict[str, set[Callable]] = {
            'data': set(),
            'error': set(),
            'close': set()
        }
        self._read_task: Optional[asyncio.Task] = None

    async def connect(self) -> None:
        if self.connected:
            return

        try:
            self.reader, self.writer = await asyncio.wait_for(
                asyncio.open_connection(self.host, self.port),
                timeout=self.connect_timeout
            )
            self.connected = True
            self._read_task = asyncio.create_task(self._read_loop())
        except asyncio.TimeoutError:
            raise TimeoutError("Connection timeout")
        except Exception as e:
            raise ConnectionError(f"Failed to connect: {str(e)}")

    def disconnect(self) -> None:
        if self.writer:
            self.writer.close()
        if self._read_task:
            self._read_task.cancel()
        self.connected = False
        self.reader = None
        self.writer = None
        self._read_task = None
        self._emit('close')

    def send(self, data: str) -> None:
        print(f"[TcpTransport#send] Sending data: {data}")
        if not self.connected or not self.writer:
            raise ConnectionError("Not connected")
        try:
            self.writer.write((data + '\n').encode())
            # Add the drain call to ensure data is sent immediately
            asyncio.get_running_loop().create_task(self.writer.drain())
        except Exception as e:
            self._emit('error', e)
            raise

    def is_connected(self) -> bool:
        return self.connected

    def add_event_listener(self, event: str, callback: Callable) -> None:
        if event not in self.event_handlers:
            self.event_handlers[event] = set()
        self.event_handlers[event].add(callback)

    def remove_event_listener(self, event: str, callback: Callable) -> None:
        if event in self.event_handlers:
            self.event_handlers[event].discard(callback)

    def _emit(self, event: str, *args) -> None:
        if event in self.event_handlers:
            for callback in self.event_handlers[event]:
                try:
                    callback(*args)
                except Exception as e:
                    print(f"Error in event handler: {str(e)}")

    async def _read_loop(self) -> None:
        try:
            while self.connected and self.reader:
                try:
                    data = await self.reader.readline()
                    if not data:  # EOF
                        break
                    self._emit('data', data.decode().strip())
                except Exception as e:
                    self._emit('error', e)
                    break
        finally:
            self.disconnect()

class RpcTransport(Transport):
    def __init__(self, appspace: str, client_id: str, connect_timeout: int):
        self.appspace = appspace
        self.client_id = client_id
        self.connect_timeout = connect_timeout / 1000  # Convert to seconds
        self.connected = False
        self.event_handlers: Dict[str, set[Callable]] = {
            'data': set(),
            'error': set(),
            'close': set()
        }
        self._server: Optional[asyncio.AbstractServer] = None
        self._clients: set[asyncio.StreamWriter] = set()

    async def connect(self) -> None:
        if self.connected:
            return

        try:
            # Start local server to receive messages
            self._server = await asyncio.start_server(
                self._handle_connection,
                'localhost',
                0  # Let OS assign port
            )
            addr = self._server.sockets[0].getsockname()
            print(f"RPC server listening on {addr}")
            self.connected = True
        except Exception as e:
            raise ConnectionError(f"Failed to start RPC server: {str(e)}")

    def disconnect(self) -> None:
        if self._server:
            self._server.close()
        for client in self._clients:
            client.close()
        self.connected = False
        self._emit('close')

    def send(self, data: str) -> None:
        if not self.connected:
            raise ConnectionError("Not connected")
        try:
            message = {
                'appspace': self.appspace,
                'client_id': self.client_id,
                'data': data
            }
            for client in self._clients:
                client.write((json.dumps(message) + '\n').encode())
        except Exception as e:
            self._emit('error', e)
            raise

    def is_connected(self) -> bool:
        return self.connected

    def add_event_listener(self, event: str, callback: Callable) -> None:
        if event not in self.event_handlers:
            self.event_handlers[event] = set()
        self.event_handlers[event].add(callback)

    def remove_event_listener(self, event: str, callback: Callable) -> None:
        if event in self.event_handlers:
            self.event_handlers[event].discard(callback)

    def _emit(self, event: str, *args) -> None:
        if event in self.event_handlers:
            for callback in self.event_handlers[event]:
                try:
                    callback(*args)
                except Exception as e:
                    print(f"Error in event handler: {str(e)}")

    async def _handle_connection(
        self,
        reader: asyncio.StreamReader,
        writer: asyncio.StreamWriter
    ) -> None:
        self._clients.add(writer)
        try:
            while True:
                data = await reader.readline()
                if not data:  # EOF
                    break
                self._emit('data', data.decode().strip())
        except Exception as e:
            self._emit('error', e)
        finally:
            writer.close()
            self._clients.discard(writer)