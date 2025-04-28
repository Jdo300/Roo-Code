import asyncio
import json
from typing import Any, Dict, List, Optional, Union, TypeVar, cast

from .types import (
    ConnectionConfig, TcpConfig, RpcConfig, RooCodeSettings,
    IpcMessage, IpcMessageType, IpcOrigin, TaskCommand, TaskCommandName,
    TaskEvent, PendingRequest
)
from .transport import Transport, TcpTransport, RpcTransport

T = TypeVar('T')

class RooCodeClient:
    def __init__(self, config: ConnectionConfig):
        self.client_id = config.client_config.client_id
        self.transport: Transport
        
        if config.type == "tcp":
            config = cast(TcpConfig, config)
            self.transport = TcpTransport(
                config.host,
                config.port,
                config.client_config.connect_timeout
            )
        else:
            config = cast(RpcConfig, config)
            self.transport = RpcTransport(
                config.appspace,
                self.client_id,
                config.client_config.connect_timeout
            )

        self.request_timeout = config.client_config.request_timeout / 1000  # Convert to seconds
        self.buffer = ""
        self.pending_requests: Dict[str, PendingRequest] = {}
        self._event_handlers: Dict[str, set[callable]] = {}

        # Set up transport event handlers
        self.transport.add_event_listener('data', self._handle_data)
        self.transport.add_event_listener('error', self._handle_error)
        self.transport.add_event_listener('close', self._handle_close)

    async def connect(self) -> None:
        await self.transport.connect()

    def disconnect(self) -> None:
        self.transport.disconnect()

    def add_event_listener(self, event: str, callback: callable) -> None:
        if event not in self._event_handlers:
            self._event_handlers[event] = set()
        self._event_handlers[event].add(callback)

    def remove_event_listener(self, event: str, callback: callable) -> None:
        if event in self._event_handlers:
            self._event_handlers[event].discard(callback)

    def _emit(self, event: str, *args) -> None:
        if event in self._event_handlers:
            for callback in self._event_handlers[event]:
                try:
                    callback(*args)
                except Exception as e:
                    print(f"Error in event handler: {str(e)}")

    def _handle_data(self, data: str) -> None:
        self.buffer += data
        self._process_buffer()

    def _handle_error(self, error: Exception) -> None:
        self._emit('error', error)

    def _handle_close(self) -> None:
        self._emit('disconnect')

    def _process_buffer(self) -> None:
        messages = self.buffer.split('\n')
        self.buffer = messages.pop() if messages else ""

        for message in messages:
            try:
                parsed = json.loads(message)
                self._handle_message(parsed)
            except Exception as error:
                self._emit('error', f"Failed to parse message: {error}")

    def _handle_message(self, message: dict) -> None:
        try:
            ipc_message = IpcMessage(**message)
            
            if ipc_message.type == IpcMessageType.ACK:
                self._emit('connect', ipc_message.data)
            
            elif ipc_message.type == IpcMessageType.TASK_EVENT:
                event = TaskEvent(**ipc_message.data)
                self._emit(event.event_name, event.payload)
            
            elif ipc_message.type == IpcMessageType.TASK_COMMAND:
                if ipc_message.client_id in self.pending_requests:
                    request = self.pending_requests[ipc_message.client_id]
                    request.future.set_result(ipc_message.data)
                    request.timeout_handle.cancel()
                    del self.pending_requests[ipc_message.client_id]
            
            else:
                self._emit('error', f"Unknown message type: {ipc_message.type}")

        except Exception as error:
            self._emit('error', f"Failed to handle message: {error}")

    async def _send_command(self, command: TaskCommand) -> Any:
        if not self.transport.is_connected():
            raise ConnectionError("Not connected")

        message = IpcMessage(
            type=IpcMessageType.TASK_COMMAND,
            origin=IpcOrigin.CLIENT,
            client_id=self.client_id,
            data=command
        )

        future = asyncio.get_running_loop().create_future()
        timeout_handle = asyncio.get_running_loop().call_later(
            self.request_timeout,
            lambda: self._handle_timeout(self.client_id)
        )

        self.pending_requests[self.client_id] = PendingRequest(
            future=future,
            timeout_handle=timeout_handle
        )

        try:
            self.transport.send(json.dumps(message.__dict__))
            return await future
        except Exception as error:
            if self.client_id in self.pending_requests:
                self.pending_requests[self.client_id].timeout_handle.cancel()
                del self.pending_requests[self.client_id]
            raise error

    def _handle_timeout(self, request_id: str) -> None:
        if request_id in self.pending_requests:
            request = self.pending_requests[request_id]
            request.future.set_exception(TimeoutError("Request timeout"))
            del self.pending_requests[request_id]

    # API Methods

    async def start_new_task(
        self,
        configuration: Optional[RooCodeSettings] = None,
        text: Optional[str] = None,
        images: Optional[List[str]] = None,
        new_tab: Optional[bool] = None
    ) -> str:
        command = TaskCommand(
            command_name=TaskCommandName.START_NEW_TASK,
            data={
                'configuration': configuration or {},
                'text': text,
                'images': images,
                'newTab': new_tab
            }
        )
        return await self._send_command(command)

    async def resume_task(self, task_id: str) -> None:
        command = TaskCommand(
            command_name=TaskCommandName.RESUME_TASK,
            data=task_id
        )
        await self._send_command(command)

    async def is_task_in_history(self, task_id: str) -> bool:
        command = TaskCommand(
            command_name=TaskCommandName.IS_TASK_IN_HISTORY,
            data=task_id
        )
        return await self._send_command(command)

    async def get_current_task_stack(self) -> List[str]:
        command = TaskCommand(
            command_name=TaskCommandName.GET_CURRENT_TASK_STACK,
            data=None
        )
        return await self._send_command(command)

    async def clear_current_task(self, last_message: Optional[str] = None) -> None:
        command = TaskCommand(
            command_name=TaskCommandName.CLEAR_CURRENT_TASK,
            data=last_message
        )
        await self._send_command(command)

    async def cancel_current_task(self) -> None:
        command = TaskCommand(
            command_name=TaskCommandName.CANCEL_CURRENT_TASK,
            data=None
        )
        await self._send_command(command)

    async def send_message(
        self,
        message: Optional[str] = None,
        images: Optional[List[str]] = None
    ) -> None:
        command = TaskCommand(
            command_name=TaskCommandName.SEND_MESSAGE,
            data={'message': message, 'images': images}
        )
        await self._send_command(command)

    async def press_primary_button(self) -> None:
        command = TaskCommand(
            command_name=TaskCommandName.PRESS_PRIMARY_BUTTON,
            data=None
        )
        await self._send_command(command)

    async def press_secondary_button(self) -> None:
        command = TaskCommand(
            command_name=TaskCommandName.PRESS_SECONDARY_BUTTON,
            data=None
        )
        await self._send_command(command)

    async def set_configuration(self, values: RooCodeSettings) -> None:
        command = TaskCommand(
            command_name=TaskCommandName.SET_CONFIGURATION,
            data=values
        )
        await self._send_command(command)

    async def is_ready(self) -> bool:
        command = TaskCommand(
            command_name=TaskCommandName.IS_READY,
            data=None
        )
        return await self._send_command(command)

    async def get_messages(self, task_id: str) -> None:
        command = TaskCommand(
            command_name=TaskCommandName.GET_MESSAGES,
            data=task_id
        )
        await self._send_command(command)

    async def get_token_usage(self, task_id: str) -> None:
        command = TaskCommand(
            command_name=TaskCommandName.GET_TOKEN_USAGE,
            data=task_id
        )
        await self._send_command(command)

    async def create_profile(self, name: str) -> str:
        command = TaskCommand(
            command_name=TaskCommandName.CREATE_PROFILE,
            data=name
        )
        return await self._send_command(command)

    async def get_profiles(self) -> List[str]:
        command = TaskCommand(
            command_name=TaskCommandName.GET_PROFILES,
            data=None
        )
        return await self._send_command(command)

    async def set_active_profile(self, name: str) -> None:
        command = TaskCommand(
            command_name=TaskCommandName.SET_ACTIVE_PROFILE,
            data=name
        )
        await self._send_command(command)

    async def get_active_profile(self) -> Optional[str]:
        command = TaskCommand(
            command_name=TaskCommandName.GET_ACTIVE_PROFILE,
            data=None
        )
        return await self._send_command(command)

    async def delete_profile(self, name: str) -> None:
        command = TaskCommand(
            command_name=TaskCommandName.DELETE_PROFILE,
            data=name
        )
        await self._send_command(command)