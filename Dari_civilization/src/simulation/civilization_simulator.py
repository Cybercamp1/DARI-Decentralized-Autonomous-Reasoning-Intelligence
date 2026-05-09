import random
import time
import logging
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from datetime import datetime
import json

from ..agents.ai_agent import Agent, Role, Emotion

class CivilizationSimulator:
    """Main simulator for AI civilization"""
    
    def __init__(self):
        self.agents = {}
        self.simulation_time = 0
        self.is_running = False
        self.event_log = []
        self.statistics = {}
        self.logger = logging.getLogger("CivilizationSimulator")
        
        # Environment setup
        self.environment = {
            'width': 50,
            'height': 50,
            'resources': [],
            'zones': {},
            'environmental_conditions': {
                'time_of_day': 'day',
                'weather': 'clear',
                'visibility': 1.0
            }
        }
        
        # Initialize environment
        self._initialize_environment()
    
    def _initialize_environment(self):
        """Initialize environment with resources and zones"""
        # Generate resources
        for _ in range(20):
            pos = (random.randint(0, 49), random.randint(0, 49))
            amount = random.randint(5, 20)
            self.environment['resources'].append([pos, amount])
        
        # Generate zones
        self.environment['zones'] = {
            'trade': [],
            'battle': [],
            'healing': [],
            'exploration': []
        }
        
        for zone_type in self.environment['zones']:
            for _ in range(3):
                zone_positions = []
                center_x = random.randint(5, 45)
                center_y = random.randint(5, 45)
                for dx in range(-2, 3):
                    for dy in range(-2, 3):
                        zone_positions.append((center_x + dx, center_y + dy))
                self.environment['zones'][zone_type].extend(zone_positions)
    
    def create_agent(self, name: str, role: str, position: Optional[Tuple[int, int]] = None) -> str:
        """Create a new agent"""
        if position is None:
            position = (
                random.randint(0, self.environment['width'] - 1),
                random.randint(0, self.environment['height'] - 1)
            )
        
        agent_id = f"agent_{len(self.agents)}_{int(time.time())}"
        
        # Convert role string to enum
        role_map = {
            'warrior': Role.WARRIOR,
            'trader': Role.TRADER,
            'explorer': Role.EXPLORER,
            'diplomat': Role.DIPLOMAT,
            'thief': Role.THIEF,
            'healer': Role.HEALER,
            'leader': Role.LEADER
        }
        
        agent_role = role_map.get(role.lower(), Role.EXPLORER)
        
        agent = Agent(agent_id, name, agent_role, position)
        self.agents[agent_id] = agent
        
        self.logger.info(f"Created agent {name} ({role}) at position {position}")
        self._log_event("agent_created", {
            "agent_id": agent_id, 
            "name": name, 
            "role": role,
            "personality": agent.personality
        })
        
        return agent_id
    
    def create_initial_civilization(self, num_agents: int = 15):
        """Create initial civilization with diverse agents"""
        roles = ['warrior', 'trader', 'explorer', 'diplomat', 'thief', 'healer', 'leader']
        role_weights = [0.15, 0.2, 0.15, 0.15, 0.1, 0.15, 0.1]
        
        for i in range(num_agents):
            role = random.choices(roles, weights=role_weights)[0]
            name = f"{role.title()}_{i+1}"
            self.create_agent(name, role)
        
        self.logger.info(f"Created initial civilization with {num_agents} agents")
    
    def simulate_step(self):
        """Simulate one step of the civilization"""
        self.simulation_time += 1
        
        # Update environment
        self._update_environment()
        
        # Update all agents
        for agent in list(self.agents.values()):
            if not agent.state.is_alive:
                continue
            
            # Update agent state
            agent.update_state()
            
            # Make decision if not currently acting
            if not agent.state.current_action:
                nearby_agents = self.get_nearby_agents(agent)
                self._make_agent_decision(agent, nearby_agents)
            
            # Update action duration
            if agent.state.action_duration > 0:
                agent.state.action_duration -= 1
                if agent.state.action_duration == 0:
                    agent.state.current_action = None
                    agent.state.target_agent = None
        
        # Update statistics
        self._update_statistics()
        
        # Check for behavior alerts
        self._check_behavior_alerts()
    
    def _update_environment(self):
        """Update environmental conditions"""
        # Random weather changes
        if random.random() < 0.05:  # 5% chance of weather change
            weather_options = ['clear', 'cloudy', 'rainy', 'stormy']
            self.environment['environmental_conditions']['weather'] = random.choice(weather_options)
        
        # Random resource spawning
        if random.random() < 0.1:  # 10% chance of new resource
            pos = (random.randint(0, 49), random.randint(0, 49))
            amount = random.randint(5, 15)
            self.environment['resources'].append([pos, amount])
            
            # Limit resources
            if len(self.environment['resources']) > 30:
                self.environment['resources'] = self.environment['resources'][-25:]
    
    def _make_agent_decision(self, agent: Agent, nearby_agents: List[Agent]):
        """Make decision for an agent"""
        # Simple decision logic based on role and personality
        if agent.role == Role.WARRIOR:
            if agent.personality.aggression > 0.7 and nearby_agents:
                # Attack nearby agents
                target = random.choice(nearby_agents)
                if self._calculate_distance(agent.state.position, target.state.position) <=3:
                    self._execute_attack(agent, target)
                    return
            else:
                # Patrol or explore
                agent.state.current_action = "patrol"
                agent.state.action_duration = random.randint(3, 6)
                agent.state.thought = "Looking for enemies to attack"
        
        elif agent.role == Role.TRADER:
            if agent.state.balance > 20:
                # Look for trading opportunities
                agent.state.current_action = "trade"
                agent.state.action_duration = random.randint(2, 4)
                agent.state.thought = "Searching for profitable trades"
            else:
                # Explore for resources
                agent.state.current_action = "explore"
                agent.state.action_duration = random.randint(3, 5)
                agent.state.thought = "Need to find resources to trade"
        
        elif agent.role == Role.EXPLORER:
            # Always explore
            agent.state.current_action = "explore"
            agent.state.action_duration = random.randint(2, 4)
            agent.state.thought = "Discovering new territories"
        
        elif agent.role == Role.DIPLOMAT:
            if nearby_agents:
                # Try to interact peacefully
                agent.state.current_action = "diplomacy"
                agent.state.action_duration = random.randint(2, 4)
                agent.state.thought = "Negotiating with other agents"
            else:
                # Explore to find others
                agent.state.current_action = "explore"
                agent.state.action_duration = random.randint(2, 4)
                agent.state.thought = "Searching for allies"
        
        elif agent.role == Role.THIEF:
            if nearby_agents and agent.personality.greed > 0.6:
                # Try to steal from nearby agents
                target = random.choice(nearby_agents)
                if self._calculate_distance(agent.state.position, target.state.position) <= 2:
                    self._execute_steal(agent, target)
                    return
            else:
                # Sneak around
                agent.state.current_action = "sneak"
                agent.state.action_duration = random.randint(2, 4)
                agent.state.thought = "Looking for valuable targets"
        
        elif agent.role == Role.HEALER:
            if nearby_agents:
                # Look for injured agents to heal
                injured = [a for a in nearby_agents if a.state.health < 50]
                if injured:
                    target = random.choice(injured)
                    self._execute_heal(agent, target)
                    return
            else:
                # Explore to find injured
                agent.state.current_action = "patrol"
                agent.state.action_duration = random.randint(2, 4)
                agent.state.thought = "Searching for wounded agents"
        
        elif agent.role == Role.LEADER:
            # Coordinate others or explore
            if random.random() < 0.3:
                agent.state.current_action = "coordinate"
                agent.state.action_duration = random.randint(3, 5)
                agent.state.thought = "Coordinating team strategy"
            else:
                agent.state.current_action = "explore"
                agent.state.action_duration = random.randint(2, 4)
                agent.state.thought = "Leading expedition"
        
        # Move agent
        if agent.state.current_action in ["explore", "patrol", "sneak"]:
            new_pos = agent._choose_exploration_destination()
            agent.state.position = new_pos
            agent.state.energy = max(0, agent.state.energy - 2)
            if not hasattr(agent.state, 'thought'):
                agent.state.thought = f"Moving to new location"
    
    def _execute_attack(self, attacker: Agent, target: Agent):
        """Execute attack action"""
        damage = random.randint(10, 25)
        target.state.health = max(0, target.state.health - damage)
        attacker.state.energy = max(0, attacker.state.energy - 5)
        
        attacker.state.current_action = "attack"
        attacker.state.target_agent = target.agent_id
        attacker.state.action_duration = 2
        attacker.state.thought = f"Attacking {target.name}!"
        
        target.state.emotion = Emotion.ANGRY
        
        # Update relationship
        current_rel = attacker.memory.agent_relationships.get(target.agent_id, 0.5)
        attacker.memory.agent_relationships[target.agent_id] = max(0, current_rel - 0.3)
        
        self._log_event("agent_combat", {
            "attacker": attacker.agent_id,
            "target": target.agent_id,
            "damage": damage,
            "target_health": target.state.health
        })
    
    def _execute_steal(self, thief: Agent, target: Agent):
        """Execute steal action"""
        if target.state.balance > 0:
            stolen = min(target.state.balance, random.randint(5, 15))
            target.state.balance -= stolen
            thief.state.balance += stolen
            
            thief.state.current_action = "steal"
            thief.state.target_agent = target.agent_id
            thief.state.action_duration = 2
            thief.state.thought = f"Stealing from {target.name}!"
            
            # Update relationship
            current_rel = thief.memory.agent_relationships.get(target.agent_id, 0.5)
            thief.memory.agent_relationships[target.agent_id] = max(0, current_rel - 0.4)
            
            self._log_event("agent_theft", {
                "thief": thief.agent_id,
                "target": target.agent_id,
                "amount": stolen
            })
    
    def _execute_heal(self, healer: Agent, target: Agent):
        """Execute heal action"""
        heal_amount = random.randint(15, 30)
        target.state.health = min(100, target.state.health + heal_amount)
        healer.state.energy = max(0, healer.state.energy - 3)
        
        healer.state.current_action = "heal"
        healer.state.target_agent = target.agent_id
        healer.state.action_duration = 2
        healer.state.thought = f"Healing {target.name}!"
        
        # Update relationship
        current_rel = healer.memory.agent_relationships.get(target.agent_id, 0.5)
        healer.memory.agent_relationships[target.agent_id] = min(1.0, current_rel + 0.2)
        
        self._log_event("agent_healing", {
            "healer": healer.agent_id,
            "target": target.agent_id,
            "heal_amount": heal_amount
        })
    
    def get_nearby_agents(self, agent: Agent, radius: int = 5) -> List[Agent]:
        """Get agents within radius of given agent"""
        nearby = []
        agent_x, agent_y = agent.state.position
        
        for other_agent in self.agents.values():
            if other_agent.agent_id == agent.agent_id:
                continue
            
            other_x, other_y = other_agent.state.position
            distance = ((agent_x - other_x) ** 2 + (agent_y - other_y) ** 2) ** 0.5
            
            if distance <= radius:
                nearby.append(other_agent)
        
        return nearby
    
    def get_agent_positions(self) -> Dict[str, Tuple[int, int]]:
        """Get all agent positions"""
        return {
            agent_id: agent.state.position 
            for agent_id, agent in self.agents.items()
            if agent.state.is_alive
        }
    
    def get_all_agents_status(self) -> List[Dict]:
        """Get status of all agents"""
        return [agent.get_status() for agent in self.agents.values()]
    
    def get_agent_status(self, agent_id: str) -> Optional[Dict]:
        """Get status of specific agent"""
        if agent_id in self.agents:
            return self.agents[agent_id].get_status()
        return None
    
    def get_environment_data(self) -> Dict:
        """Get current environment data"""
        return {
            "width": self.environment['width'],
            "height": self.environment['height'],
            "resources": self.environment['resources'],
            "zones": self.environment['zones'],
            "environmental_conditions": self.environment['environmental_conditions'],
            "resource_count": len(self.environment['resources'])
        }
    
    def get_civilization_status(self) -> Dict:
        """Get overall civilization status"""
        alive_agents = [a for a in self.agents.values() if a.state.is_alive]
        
        if not alive_agents:
            return {
                "simulation_time": self.simulation_time,
                "is_running": self.is_running,
                "total_agents": 0,
                "total_balance": 0,
                "avg_health": 0,
                "avg_energy": 0,
                "dead_agents": len(self.agents),
                "environment": self.environment['environmental_conditions']
            }
        
        total_balance = sum(a.state.balance for a in alive_agents)
        avg_health = sum(a.state.health for a in alive_agents) / len(alive_agents)
        avg_energy = sum(a.state.energy for a in alive_agents) / len(alive_agents)
        
        return {
            "simulation_time": self.simulation_time,
            "is_running": self.is_running,
            "total_agents": len(alive_agents),
            "total_balance": total_balance,
            "avg_health": avg_health,
            "avg_energy": avg_energy,
            "dead_agents": len(self.agents) - len(alive_agents),
            "environment": self.environment['environmental_conditions']
        }
    
    def start_simulation(self):
        """Start the simulation"""
        self.is_running = True
        self.logger.info("Simulation started")
    
    def stop_simulation(self):
        """Stop the simulation"""
        self.is_running = False
        self.logger.info("Simulation stopped")
    
    def reset_simulation(self):
        """Reset the simulation"""
        self.agents = {}
        self.simulation_time = 0
        self.is_running = False
        self.event_log = []
        self.statistics = {}
        self._initialize_environment()
        self.logger.info("Simulation reset")
    
    def control_agent(self, agent_id: str, command: str, parameters: Dict) -> Dict:
        """Control an agent manually"""
        if agent_id not in self.agents:
            return {"success": False, "message": "Agent not found"}
        
        agent = self.agents[agent_id]
        
        if command == "heal":
            agent.state.health = min(100, agent.state.health + parameters.get("amount", 30))
            return {"success": True, "message": f"Agent {agent.name} healed"}
        
        elif command == "give_energy":
            agent.state.energy = min(100, agent.state.energy + parameters.get("amount", 30))
            return {"success": True, "message": f"Agent {agent.name} energized"}
        
        elif command == "give_money":
            agent.state.balance += parameters.get("amount", 50)
            return {"success": True, "message": f"Agent {agent.name} received money"}
        
        elif command == "move":
            new_pos = parameters.get("position")
            if new_pos and len(new_pos) == 2:
                agent.state.position = tuple(new_pos)
                return {"success": True, "message": f"Agent {agent.name} moved"}
        
        return {"success": False, "message": "Unknown command"}
    
    def _update_statistics(self):
        """Update simulation statistics"""
        alive_agents = [a for a in self.agents.values() if a.state.is_alive]
        
        if not alive_agents:
            return
        
        # Role distribution
        role_counts = {}
        emotion_counts = {}
        
        for agent in alive_agents:
            role = agent.role.value
            emotion = agent.state.emotion.value
            
            role_counts[role] = role_counts.get(role, 0) + 1
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        self.statistics = {
            "role_distribution": role_counts,
            "emotion_distribution": emotion_counts,
            "total_balance": sum(a.state.balance for a in alive_agents),
            "avg_health": sum(a.state.health for a in alive_agents) / len(alive_agents),
            "avg_energy": sum(a.state.energy for a in alive_agents) / len(alive_agents),
            "simulation_time": self.simulation_time,
            "dead_agents": len(self.agents) - len(alive_agents)
        }
    
    def _check_behavior_alerts(self):
        """Check for behavior alerts"""
        for agent in self.agents.values():
            if not agent.state.is_alive:
                continue
            
            alerts = agent.get_behavior_alerts()
            
            if alerts:
                for alert in alerts:
                    self._log_event("behavior_alert", {
                        "agent_id": agent.agent_id,
                        "agent_name": agent.name,
                        "alert": alert
                    })
    
    def _log_event(self, event_type: str, data: Dict):
        """Log an event"""
        event = {
            "timestamp": time.time(),
            "type": event_type,
            "data": data
        }
        self.event_log.append(event)
        
        # Keep event log manageable
        if len(self.event_log) > 1000:
            self.event_log = self.event_log[-500:]
    
    def _calculate_distance(self, pos1: Tuple[int, int], pos2: Tuple[int, int]) -> float:
        """Calculate distance between two positions"""
        return ((pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2) ** 0.5
