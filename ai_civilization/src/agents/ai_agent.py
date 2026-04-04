import random
import time
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum

class Role(Enum):
    WARRIOR = "warrior"
    TRADER = "trader"
    EXPLORER = "explorer"
    DIPLOMAT = "diplomat"
    THIEF = "thief"
    HEALER = "healer"
    LEADER = "leader"

class Emotion(Enum):
    HAPPY = "happy"
    ANGRY = "angry"
    NEUTRAL = "neutral"
    FEARFUL = "fearful"
    EXCITED = "excited"
    SAD = "sad"

@dataclass
class AgentState:
    position: Tuple[int, int]
    health: int = 100
    energy: int = 100
    balance: int = 50
    emotion: Emotion = Emotion.NEUTRAL
    is_alive: bool = True
    current_action: Optional[str] = None
    target_agent: Optional[str] = None
    action_duration: int = 0
    thought: Optional[str] = None

@dataclass
class Personality:
    aggression: float = 0.5
    cooperation: float = 0.5
    intelligence: float = 0.5
    risk_tolerance: float = 0.5
    empathy: float = 0.5
    greed: float = 0.5
    curiosity: float = 0.5
    loyalty: float = 0.5

@dataclass
class Memory:
    short_term: List[Dict] = field(default_factory=list)
    long_term: Dict = field(default_factory=dict)
    agent_relationships: Dict[str, float] = field(default_factory=dict)
    location_memory: Dict[Tuple[int, int], Dict] = field(default_factory=dict)

class Agent:
    def __init__(self, agent_id: str, name: str, role: Role, position: Tuple[int, int] = (0, 0)):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.state = AgentState(position=position)
        self.personality = Personality()
        self.memory = Memory()
        self.logger = logging.getLogger(f"Agent_{name}")
        
        # Additional attributes
        self.nearby_agents = []
        self.action_history = []
        self.last_action_time = 0
        
        # Initialize personality based on role
        self._initialize_personality()
    
    def _initialize_personality(self):
        """Initialize personality traits based on role"""
        if self.role == Role.WARRIOR:
            self.personality.aggression = random.uniform(0.7, 0.9)
            self.personality.loyalty = random.uniform(0.6, 0.8)
            self.personality.risk_tolerance = random.uniform(0.6, 0.8)
        elif self.role == Role.TRADER:
            self.personality.cooperation = random.uniform(0.7, 0.9)
            self.personality.greed = random.uniform(0.4, 0.7)
            self.personality.intelligence = random.uniform(0.6, 0.8)
        elif self.role == Role.EXPLORER:
            self.personality.curiosity = random.uniform(0.8, 1.0)
            self.personality.risk_tolerance = random.uniform(0.5, 0.8)
            self.personality.intelligence = random.uniform(0.5, 0.7)
        elif self.role == Role.DIPLOMAT:
            self.personality.empathy = random.uniform(0.8, 1.0)
            self.personality.cooperation = random.uniform(0.7, 0.9)
            self.personality.intelligence = random.uniform(0.7, 0.9)
        elif self.role == Role.THIEF:
            self.personality.greed = random.uniform(0.7, 0.9)
            self.personality.risk_tolerance = random.uniform(0.6, 0.9)
            self.personality.aggression = random.uniform(0.3, 0.6)
        elif self.role == Role.HEALER:
            self.personality.empathy = random.uniform(0.8, 1.0)
            self.personality.cooperation = random.uniform(0.6, 0.8)
            self.personality.loyalty = random.uniform(0.7, 0.9)
        elif self.role == Role.LEADER:
            self.personality.intelligence = random.uniform(0.7, 0.9)
            self.personality.loyalty = random.uniform(0.8, 1.0)
            self.personality.cooperation = random.uniform(0.6, 0.8)
    
    def update_state(self):
        """Update agent state (energy, health, etc.)"""
        # Natural energy recovery
        if self.state.energy < 100:
            self.state.energy = min(100, self.state.energy + 1)
        
        # Natural health recovery
        if self.state.health < 100:
            self.state.health = min(100, self.state.health + 0.5)
        
        # Check if agent is alive
        if self.state.health <= 0:
            self.state.is_alive = False
            self.state.emotion = Emotion.SAD
    
    def get_status(self) -> Dict:
        """Get current status of the agent"""
        return {
            'agent_id': self.agent_id,
            'name': self.name,
            'role': self.role.value,
            'position': self.state.position,
            'health': self.state.health,
            'energy': self.state.energy,
            'balance': self.state.balance,
            'emotion': self.state.emotion.value,
            'is_alive': self.state.is_alive,
            'current_action': self.state.current_action,
            'target_agent': self.state.target_agent,
            'thought': self.state.thought,
            'personality': {
                'aggression': self.personality.aggression,
                'cooperation': self.personality.cooperation,
                'intelligence': self.personality.intelligence,
                'risk_tolerance': self.personality.risk_tolerance,
                'empathy': self.personality.empathy,
                'greed': self.personality.greed,
                'curiosity': self.personality.curiosity,
                'loyalty': self.personality.loyalty
            },
            'memory': {
                'short_term_count': len(self.memory.short_term),
                'long_term_count': len(self.memory.long_term),
                'relationships_count': len(self.memory.agent_relationships),
                'locations_known': len(self.memory.location_memory)
            }
        }
    
    def get_behavior_alerts(self) -> List[str]:
        """Get behavioral alerts for this agent"""
        alerts = []
        
        if self.state.health < 20:
            alerts.append("Agent is critically injured")
        
        if self.state.energy < 10:
            alerts.append("Agent is exhausted")
        
        if self.state.balance < 5:
            alerts.append("Agent has no money")
        
        if self.state.emotion == Emotion.ANGRY and self.personality.aggression > 0.7:
            alerts.append("Agent is angry and aggressive")
        
        return alerts
    
    def _calculate_distance(self, pos1: Tuple[int, int], pos2: Tuple[int, int]) -> float:
        """Calculate distance between two positions"""
        return ((pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2) ** 0.5
    
    def _move_towards(self, target_pos: Tuple[int, int]) -> Tuple[int, int]:
        """Move one step towards target position"""
        x, y = self.state.position
        tx, ty = target_pos
        
        # Calculate direction
        dx = tx - x
        dy = ty - y
        distance = (dx ** 2 + dy ** 2) ** 0.5
        
        if distance <= 1:
            return target_pos
        
        # Move one step
        if distance > 0:
            step_x = int(dx / distance)
            step_y = int(dy / distance)
            new_x = max(0, min(49, x + step_x))
            new_y = max(0, min(49, y + step_y))
            return (new_x, new_y)
        
        return self.state.position
    
    def _choose_exploration_destination(self) -> Tuple[int, int]:
        """Choose a random exploration destination"""
        return (
            random.randint(0, 49),
            random.randint(0, 49)
        )
    
    def _find_agent_by_id(self, agent_id: str, agents: List) -> Optional['Agent']:
        """Find agent by ID in list"""
        for agent in agents:
            if agent.agent_id == agent_id:
                return agent
        return None
