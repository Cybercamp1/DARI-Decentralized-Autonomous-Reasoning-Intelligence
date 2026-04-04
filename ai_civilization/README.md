# 💀 AI Civilization with Control Panel

A sophisticated dual-interface system where AI agents act autonomously in a simulated civilization while humans can monitor, guide, and override their behavior through a comprehensive control panel.

## 🎯 Overview

The system creates a living AI civilization where agents with unique personalities, emotions, and roles interact in real-time. Humans can observe the simulation through a game-like view and intervene through an advanced control dashboard.

## 🏗️ System Architecture

### **Dual Interface Design**
- **Simulation View**: Real-time pixel-art visualization of the civilization
- **Control Panel**: Advanced monitoring and intervention dashboard

### **Core Components**
- **AI Agent System**: Autonomous decision-making with traits and emotions
- **Simulation Engine**: Real-time world simulation with environment
- **WebSocket Communication**: Instant sync between interfaces
- **Behavior Analytics**: Pattern detection and alert system

## 🤖 AI Agent System

### **Agent Roles**
- **Warrior**: High aggression, defends territory and allies
- **Trader**: Cooperative, seeks profitable exchanges
- **Explorer**: Curious, discovers new areas and resources
- **Diplomat**: High empathy, resolves conflicts
- **Thief**: High greed, steals from wealthy targets
- **Healer**: High empathy, helps injured agents
- **Leader**: Balanced traits, coordinates civilization

### **Personality Traits**
Each agent has 8 core traits (0-1 scale):
- **Aggression**: Tendency to attack/steal
- **Cooperation**: Willingness to work with others
- **Intelligence**: Decision-making quality
- **Risk Tolerance**: Comfort with dangerous actions
- **Empathy**: Concern for others' wellbeing
- **Greed**: Desire for wealth accumulation
- **Curiosity**: Drive to explore
- **Loyalty**: Commitment to allies

### **Emotional System**
Agents experience 6 emotions based on events:
- **Happy**: Successful cooperation/trade
- **Angry**: Failed attacks, being stolen from
- **Neutral**: Default state
- **Fearful**: Low health, being attacked
- **Excited**: Successful exploration, victories
- **Sad**: Low resources, continuous failures

### **Decision Making**
Agents make autonomous decisions based on:
- **Role-specific behavior patterns**
- **Current emotional state**
- **Personality traits**
- **Memory of past interactions**
- **Environmental context**
- **Nearby agents and resources**

## 🎮 Simulation Features

### **Environment**
- **50x50 grid world** with different zones
- **Resource nodes** that spawn randomly
- **Special zones**: Trade, Battle, Healing areas
- **Dynamic resource generation**

### **Agent Actions**
- **Trade**: Exchange resources with other agents
- **Attack**: Damage other agents (costs energy)
- **Steal**: Attempt to take resources (40% success)
- **Cooperate**: Work together for mutual benefit
- **Defend**: Protect allies from attacks
- **Explore**: Move to new areas
- **Rest**: Recover health and energy
- **Help**: Heal injured agents
- **Negotiate**: Improve relationships
- **Flee**: Escape from dangerous situations

### **Real-time Visualization**
- **Pixel-style agents** with role-based colors
- **Floating action text** showing current behaviors
- **Emotion indicators** above agents
- **Resource nodes** and special zones
- **Smooth movement animations**

## 🎛️ Control Panel Features

### **Agent Monitoring**
- **Live agent cards** with complete status
- **Real-time statistics** (balance, health, energy)
- **Personality trait visualization**
- **Current action and AI reasoning**
- **Emotional state tracking**

### **Manual Controls**
- **Stop Agent**: Halt current action immediately
- **Assign Task**: Give specific goals (maximize profit, avoid conflict, target agent)
- **Override Action**: Force specific behavior
- **Toggle Mode**: Switch between autonomous and manual control
- **Heal Agent**: Restore full health and energy
- **Give Resources**: Provide additional balance

### **Behavior Analytics**
- **Pattern detection** for abnormal behavior
- **Alert system** for concerning patterns:
  - Continuous failure rates
  - Excessive aggression
  - Social isolation
  - Critical resource levels
  - Unusual emotional states

### **Statistics Dashboard**
- **Role distribution** charts
- **Emotion distribution** analysis
- **Civilization metrics** (total wealth, average health)
- **Real-time event logs**
- **Performance tracking**

## 🔄 Real-time Synchronization

### **WebSocket Communication**
- **Instant updates** across all connected clients
- **Live agent actions** broadcast in real-time
- **Behavior alerts** pushed immediately
- **Synchronized simulation state**

### **Multi-client Support**
- **Multiple observers** can watch simultaneously
- **Shared control** permissions
- **Consistent state** across all interfaces

## 🚀 Getting Started

### **Installation**
```bash
cd ai_civilization
pip install -r requirements.txt
```

### **Running the Application**
```bash
python app.py
```

### **Access Points**
- **Simulation View**: http://localhost:5000/
- **Control Panel**: http://localhost:5000/control

### **Quick Start**
1. Open both interfaces in separate tabs
2. Click "Start Simulation" in either interface
3. Watch agents autonomously interact in the simulation view
4. Monitor their behavior in the control panel
5. Intervene manually when desired

## 🎯 Usage Examples

### **Observing Autonomous Behavior**
1. Start simulation with 15 agents
2. Watch warriors defend territories
3. Observe traders establishing commerce
4. See diplomats resolving conflicts
5. Monitor explorers discovering resources

### **Manual Intervention**
1. Select an agent in the control panel
2. Switch to manual mode
3. Assign specific task: "maximize profit"
4. Watch agent follow directive
5. Return to autonomous mode

### **Behavior Analysis**
1. Monitor alerts for aggressive agents
2. Identify isolated agents needing help
3. Track economic trends across roles
4. Analyze emotional patterns
5. Optimize civilization performance

## 🔧 Advanced Features

### **Memory System**
Agents remember:
- **Past interactions** with other agents
- **Successful/failed actions**
- **Locations visited**
- **Agents met**
- **Interaction patterns**

### **Relationship System**
- **Alliance detection** based on positive interactions
- **Enemy identification** from aggressive behavior
- **Trust scoring** for cooperation decisions
- **Reputation tracking** across civilization

### **Dynamic Difficulty**
- **Adaptive agent behavior** based on civilization state
- **Resource scarcity** affecting decision-making
- **Population dynamics** influencing interactions
- **Environmental events** creating challenges

## 📊 Technical Architecture

### **Backend (Python)**
- **Flask** web framework
- **Socket.IO** for real-time communication
- **Async simulation** loop
- **Modular agent system**

### **Frontend (HTML/JavaScript)**
- **Tailwind CSS** for styling
- **Chart.js** for analytics
- **Socket.IO client** for real-time updates
- **Responsive design** patterns

### **Data Flow**
1. Simulation engine updates agents
2. Changes broadcast via WebSocket
3. Both interfaces receive updates
4. Control panel can send commands back
5. Simulation executes manual controls

## 🎮 Game Mechanics

### **Resource Management**
- **Starting balance**: 100 units per agent
- **Energy system**: Actions cost energy
- **Health system**: Combat reduces health
- **Resource nodes**: Spawn randomly for collection

### **Combat System**
- **Attack damage**: 10-30 points
- **Success factors**: Agent traits and energy
- **Defensive actions**: Protect from damage
- **Healing mechanics**: Restore health over time

### **Economic System**
- **Trade mechanics**: Mutual benefit exchanges
- **Stealing system**: Risk vs reward
- **Resource generation**: Environmental spawning
- **Wealth distribution**: Dynamic across roles

## 🔮 Future Enhancements

### **Advanced AI**
- **Machine learning** for behavior optimization
- **Neural networks** for decision making
- **Evolutionary algorithms** for trait adaptation
- **Natural language** for agent communication

### **Expanded World**
- **Multiple civilizations** competing
- **Territory control** mechanics
- **Technology trees** and upgrades
- **Environmental disasters** and events

### **Enhanced Controls**
- **AI training** interfaces
- **Scenario editor** for custom situations
- **Performance metrics** and leaderboards
- **Automated intervention** rules

## 🐛 Troubleshooting

### **Common Issues**
- **Agents not moving**: Check if simulation is running
- **No updates**: Verify WebSocket connection
- **Control not working**: Ensure agent is selected
- **Performance issues**: Reduce agent count

### **Debug Mode**
- **Console logs** for action tracking
- **Event history** for behavior analysis
- **Performance metrics** for optimization
- **Error handling** for system stability

## 📄 License

MIT License - feel free to modify and distribute

## 🤝 Contributing

Contributions welcome! Please fork and submit pull requests for:
- **New agent roles** and behaviors
- **Enhanced UI components**
- **Performance optimizations**
- **Bug fixes and improvements**

---

**Built with ❤️ for creating living AI civilizations**

*Experience the future of AI agent interaction and control!*
