import json
import time
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import uuid

class MessageType(Enum):
    USER_COMMAND = "user_command"
    AGENT_UPDATE = "agent_update"
    HELP_REQUEST = "help_request"
    TASK_ASSIGNMENT = "task_assignment"
    STATUS_REPORT = "status_report"
    ALERT = "alert"
    CHAT = "chat"

class Priority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class ChatMessage:
    id: str
    sender: str
    recipient: str
    message_type: MessageType
    content: str
    data: Optional[Dict] = None
    priority: Priority = Priority.MEDIUM
    timestamp: datetime = field(default_factory=datetime.now)
    read: bool = False

@dataclass
class AgentTask:
    id: str
    assigned_to: str
    assigned_by: str
    task_type: str
    description: str
    status: str  # PENDING, IN_PROGRESS, COMPLETED, FAILED
    priority: Priority
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    result: Optional[Dict] = None

class ChatSystem:
    """Real-time chat and communication system for AI agents"""
    
    def __init__(self):
        self.messages = []
        self.tasks = {}
        self.active_agents = {}
        self.logger = logging.getLogger("ChatSystem")
        
        # Message handlers
        self.handlers = {
            MessageType.USER_COMMAND: self._handle_user_command,
            MessageType.AGENT_UPDATE: self._handle_agent_update,
            MessageType.HELP_REQUEST: self._handle_help_request,
            MessageType.TASK_ASSIGNMENT: self._handle_task_assignment,
            MessageType.STATUS_REPORT: self._handle_status_report,
            MessageType.ALERT: self._handle_alert,
            MessageType.CHAT: self._handle_chat
        }
    
    def register_agent(self, agent_id: str, agent_name: str, agent_type: str):
        """Register an agent in the chat system"""
        self.active_agents[agent_id] = {
            'name': agent_name,
            'type': agent_type,
            'status': 'online',
            'last_seen': datetime.now(),
            'unread_count': 0
        }
        
        self.logger.info(f"Agent registered: {agent_name} ({agent_type})")
        
        # Send welcome message
        welcome_msg = ChatMessage(
            id=str(uuid.uuid4()),
            sender="system",
            recipient=agent_id,
            message_type=MessageType.CHAT,
            content=f"Welcome {agent_name}! You are now connected to the AI Civilization network.",
            priority=Priority.LOW
        )
        self.messages.append(welcome_msg)
    
    def send_message(self, sender: str, recipient: str, message_type: MessageType, 
                    content: str, data: Optional[Dict] = None, priority: Priority = Priority.MEDIUM) -> str:
        """Send a message between agents or from user"""
        message = ChatMessage(
            id=str(uuid.uuid4()),
            sender=sender,
            recipient=recipient,
            message_type=message_type,
            content=content,
            data=data,
            priority=priority
        )
        
        self.messages.append(message)
        
        # Update recipient's unread count
        if recipient in self.active_agents:
            self.active_agents[recipient]['unread_count'] += 1
            self.active_agents[recipient]['last_seen'] = datetime.now()
        
        # Handle message based on type
        if message_type in self.handlers:
            try:
                self.handlers[message_type](message)
            except Exception as e:
                self.logger.error(f"Error handling message {message_type}: {e}")
        
        self.logger.info(f"Message sent: {sender} -> {recipient} ({message_type.value})")
        return message.id
    
    def _handle_user_command(self, message: ChatMessage):
        """Handle user commands"""
        if message.data:
            command = message.data.get('command', '')
            target_agent = message.data.get('target_agent', '')
            
            if command and target_agent:
                # Forward command to specific agent
                self.send_message(
                    sender="system",
                    recipient=target_agent,
                    message_type=MessageType.TASK_ASSIGNMENT,
                    content=f"User command: {command}",
                    data=message.data,
                    priority=Priority.HIGH
                )
    
    def _handle_agent_update(self, message: ChatMessage):
        """Handle agent status updates"""
        if message.data and message.sender in self.active_agents:
            self.active_agents[message.sender].update(message.data)
            self.active_agents[message.sender]['last_seen'] = datetime.now()
    
    def _handle_help_request(self, message: ChatMessage):
        """Handle help requests from agents"""
        # Broadcast help request to other agents
        for agent_id in self.active_agents:
            if agent_id != message.sender:
                self.send_message(
                    sender=message.sender,
                    recipient=agent_id,
                    message_type=MessageType.HELP_REQUEST,
                    content=f"Help needed: {message.content}",
                    data=message.data,
                    priority=Priority.HIGH
                )
    
    def _handle_task_assignment(self, message: ChatMessage):
        """Handle task assignments"""
        if message.data:
            task = AgentTask(
                id=str(uuid.uuid4()),
                assigned_to=message.recipient,
                assigned_by=message.sender,
                task_type=message.data.get('task_type', 'general'),
                description=message.content,
                status='PENDING',
                priority=message.priority
            )
            
            self.tasks[task.id] = task
            
            # Notify recipient
            self.send_message(
                sender="system",
                recipient=message.recipient,
                message_type=MessageType.TASK_ASSIGNMENT,
                content=f"New task assigned: {message.content}",
                data={'task_id': task.id},
                priority=message.priority
            )
    
    def _handle_status_report(self, message: ChatMessage):
        """Handle status reports"""
        if message.data and message.sender in self.active_agents:
            self.active_agents[message.sender]['status'] = message.data.get('status', 'online')
    
    def _handle_alert(self, message: ChatMessage):
        """Handle alerts"""
        # Broadcast alerts to all agents
        for agent_id in self.active_agents:
            if agent_id != message.sender:
                self.send_message(
                    sender=message.sender,
                    recipient=agent_id,
                    message_type=MessageType.ALERT,
                    content=message.content,
                    data=message.data,
                    priority=Priority.HIGH
                )
    
    def _handle_chat(self, message: ChatMessage):
        """Handle general chat messages"""
        # Chat messages are just stored and delivered
        pass
    
    def get_messages_for_agent(self, agent_id: str, unread_only: bool = False) -> List[Dict]:
        """Get messages for a specific agent"""
        messages = []
        
        for message in self.messages:
            if message.recipient == agent_id:
                if not unread_only or not message.read:
                    messages.append({
                        'id': message.id,
                        'sender': message.sender,
                        'content': message.content,
                        'type': message.message_type.value,
                        'priority': message.priority.value,
                        'timestamp': message.timestamp.isoformat(),
                        'data': message.data,
                        'read': message.read
                    })
        
        # Sort by timestamp (newest first)
        messages.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return messages
    
    def mark_messages_read(self, agent_id: str, message_ids: List[str]):
        """Mark messages as read"""
        for message in self.messages:
            if message.recipient == agent_id and message.id in message_ids:
                message.read = True
        
        # Update unread count
        if agent_id in self.active_agents:
            self.active_agents[agent_id]['unread_count'] = max(0, 
                self.active_agents[agent_id]['unread_count'] - len(message_ids))
    
    def get_agent_tasks(self, agent_id: str) -> List[Dict]:
        """Get tasks for a specific agent"""
        tasks = []
        
        for task_id, task in self.tasks.items():
            if task.assigned_to == agent_id:
                tasks.append({
                    'id': task.id,
                    'type': task.task_type,
                    'description': task.description,
                    'status': task.status,
                    'priority': task.priority.value,
                    'created_at': task.created_at.isoformat(),
                    'completed_at': task.completed_at.isoformat() if task.completed_at else None,
                    'result': task.result
                })
        
        return tasks
    
    def update_task_status(self, task_id: str, status: str, result: Optional[Dict] = None):
        """Update task status"""
        if task_id in self.tasks:
            task = self.tasks[task_id]
            task.status = status
            task.result = result
            
            if status == 'COMPLETED':
                task.completed_at = datetime.now()
            
            # Notify task assigner
            self.send_message(
                sender=task.assigned_to,
                recipient=task.assigned_by,
                message_type=MessageType.STATUS_REPORT,
                content=f"Task {task_id} updated: {status}",
                data={'task_id': task_id, 'status': status, 'result': result},
                priority=Priority.MEDIUM
            )
    
    def get_active_agents(self) -> Dict:
        """Get list of active agents"""
        return {
            agent_id: {
                'name': info['name'],
                'type': info['type'],
                'status': info['status'],
                'last_seen': info['last_seen'].isoformat(),
                'unread_count': info['unread_count']
            }
            for agent_id, info in self.active_agents.items()
        }
    
    def broadcast_message(self, sender: str, content: str, data: Optional[Dict] = None, 
                        priority: Priority = Priority.MEDIUM):
        """Broadcast message to all agents"""
        for agent_id in self.active_agents:
            if agent_id != sender:
                self.send_message(
                    sender=sender,
                    recipient=agent_id,
                    message_type=MessageType.CHAT,
                    content=content,
                    data=data,
                    priority=priority
                )
    
    def get_system_status(self) -> Dict:
        """Get overall system status"""
        total_messages = len(self.messages)
        unread_messages = sum(1 for m in self.messages if not m.read)
        active_tasks = len([t for t in self.tasks.values() if t.status in ['PENDING', 'IN_PROGRESS']])
        
        return {
            'total_agents': len(self.active_agents),
            'online_agents': len([a for a in self.active_agents.values() if a['status'] == 'online']),
            'total_messages': total_messages,
            'unread_messages': unread_messages,
            'active_tasks': active_tasks,
            'completed_tasks': len([t for t in self.tasks.values() if t.status == 'COMPLETED']),
            'system_uptime': datetime.now().isoformat()
        }
