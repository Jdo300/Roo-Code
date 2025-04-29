from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Union, Callable
import uuid

class IpcMessageType(str, Enum):
    ACK = "Ack"
    TASK_COMMAND = "TaskCommand"
    TASK_EVENT = "TaskEvent"

class IpcOrigin(str, Enum):
    CLIENT = "client"
    SERVER = "server"

class TaskCommandName(str, Enum):
    START_NEW_TASK = "StartNewTask"
    RESUME_TASK = "ResumeTask"
    IS_TASK_IN_HISTORY = "IsTaskInHistory"
    GET_CURRENT_TASK_STACK = "GetCurrentTaskStack"
    CLEAR_CURRENT_TASK = "ClearCurrentTask"
    CANCEL_CURRENT_TASK = "CancelCurrentTask"
    SEND_MESSAGE = "SendMessage"
    PRESS_PRIMARY_BUTTON = "PressPrimaryButton"
    PRESS_SECONDARY_BUTTON = "PressSecondaryButton"
    SET_CONFIGURATION = "SetConfiguration"
    GET_CONFIGURATION = "GetConfiguration"
    IS_READY = "IsReady"
    GET_MESSAGES = "GetMessages"
    GET_TOKEN_USAGE = "GetTokenUsage"
    CREATE_PROFILE = "CreateProfile"
    GET_PROFILES = "GetProfiles"
    SET_ACTIVE_PROFILE = "SetActiveProfile"
    GET_ACTIVE_PROFILE = "getActiveProfile"
    DELETE_PROFILE = "DeleteProfile"

@dataclass
class RooCodeClientConfig:
    connect_timeout: int = 5000
    request_timeout: int = 30000
    client_id: str = field(default_factory=lambda: str(uuid.uuid4()))

@dataclass
class TcpConfig:
    host: str
    port: int
    client_config: RooCodeClientConfig = field(default_factory=RooCodeClientConfig)
    type: str = "tcp"

@dataclass
class RpcConfig:
    appspace: str
    client_config: RooCodeClientConfig = field(default_factory=RooCodeClientConfig)
    type: str = "rpc"

@dataclass
class PendingRequest:
    future: Any  # asyncio.Future
    timeout_handle: Any  # asyncio.Handle

@dataclass
class ClineMessage:
    role: str
    content: str

@dataclass
class TokenUsage:
    total: int
    prompt: int
    completion: int

@dataclass
class IpcMessage:
    type: IpcMessageType
    origin: IpcOrigin
    clientId: str
    data: Any

@dataclass
class TaskCommand:
    command_name: TaskCommandName
    data: Any

    def to_dict(self):
        return {
            "commandName": self.command_name.value,
            "data": self.data
        }

@dataclass
class TaskEvent:
    event_name: str
    payload: Any

RooCodeSettings = Dict[str, Any]
ConnectionConfig = Union[TcpConfig, RpcConfig]