from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Union, Callable
import uuid

class IpcMessageType(str, Enum):
    ACK = "ack"
    TASK_COMMAND = "taskCommand"
    TASK_EVENT = "taskEvent"

class IpcOrigin(str, Enum):
    CLIENT = "client"
    SERVER = "server"

class TaskCommandName(str, Enum):
    START_NEW_TASK = "startNewTask"
    RESUME_TASK = "resumeTask"
    IS_TASK_IN_HISTORY = "isTaskInHistory"
    GET_CURRENT_TASK_STACK = "getCurrentTaskStack"
    CLEAR_CURRENT_TASK = "clearCurrentTask"
    CANCEL_CURRENT_TASK = "cancelCurrentTask"
    SEND_MESSAGE = "sendMessage"
    PRESS_PRIMARY_BUTTON = "pressPrimaryButton"
    PRESS_SECONDARY_BUTTON = "pressSecondaryButton"
    SET_CONFIGURATION = "setConfiguration"
    IS_READY = "isReady"
    GET_MESSAGES = "getMessages"
    GET_TOKEN_USAGE = "getTokenUsage"
    CREATE_PROFILE = "createProfile"
    GET_PROFILES = "getProfiles"
    SET_ACTIVE_PROFILE = "setActiveProfile"
    GET_ACTIVE_PROFILE = "getActiveProfile"
    DELETE_PROFILE = "deleteProfile"

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
    client_id: str
    data: Any

@dataclass
class TaskCommand:
    command_name: TaskCommandName
    data: Any

@dataclass
class TaskEvent:
    event_name: str
    payload: Any

RooCodeSettings = Dict[str, Any]
ConnectionConfig = Union[TcpConfig, RpcConfig]