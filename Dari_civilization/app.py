from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import asyncio
import json
import logging
import threading
import time
from typing import Dict, List, Optional

from src.simulation.civilization_simulator import CivilizationSimulator
from src.agents.ai_agent import Role

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ai_civilization_secret'
socketio = SocketIO(app, cors_allowed_origins="*")

# Global variables
simulator = CivilizationSimulator()
simulation_thread: Optional[threading.Thread] = None
simulation_running = False

# Routes
@app.route('/')
def index():
    """Main simulation view page"""
    return render_template('simulation.html')

@app.route('/control')
def control():
    """Control dashboard page"""
    return render_template('control.html')

@app.route('/api/status')
def get_status():
    """Get civilization status"""
    return jsonify(simulator.get_civilization_status())

@app.route('/api/agents')
def get_agents():
    """Get all agents status"""
    return jsonify({"agents": simulator.get_all_agents_status()})

@app.route('/api/agent/<agent_id>')
def get_agent(agent_id):
    """Get specific agent status"""
    agent_status = simulator.get_agent_status(agent_id)
    if agent_status:
        return jsonify(agent_status)
    return jsonify({"error": "Agent not found"}), 404

@app.route('/api/environment')
def get_environment():
    """Get environment data"""
    return jsonify(simulator.get_environment_data())

@app.route('/api/positions')
def get_positions():
    """Get all agent positions"""
    return jsonify(simulator.get_agent_positions())

@app.route('/api/events')
def get_events():
    """Get recent events"""
    return jsonify({"events": simulator.event_log[-20:]})

@app.route('/api/control_agent', methods=['POST'])
def control_agent():
    """Control an agent manually"""
    data = request.get_json()
    agent_id = data.get('agent_id')
    command = data.get('command')
    parameters = data.get('parameters', {})
    
    result = simulator.control_agent(agent_id, command, parameters)
    return jsonify(result)

@app.route('/api/create_agent', methods=['POST'])
def create_agent():
    """Create a new agent"""
    data = request.get_json()
    name = data.get('name', f'Agent_{len(simulator.agents)+1}')
    role_str = data.get('role', 'explorer')
    
    try:
        agent_id = simulator.create_agent(name, role_str)
        return jsonify({"success": True, "agent_id": agent_id})
    except ValueError:
        return jsonify({"success": False, "error": "Invalid role"}), 400

@app.route('/api/start_simulation', methods=['POST'])
def start_simulation():
    """Start simulation"""
    global simulation_running, simulation_thread
    
    if not simulation_running:
        # Create initial civilization if empty
        if len(simulator.agents) == 0:
            simulator.create_initial_civilization(15)
        
        simulator.start_simulation()
        simulation_running = True
        simulation_thread = threading.Thread(target=run_simulation_loop)
        simulation_thread.daemon = True
        simulation_thread.start()
        
        return jsonify({"success": True, "message": "Simulation started"})
    
    return jsonify({"success": False, "message": "Simulation already running"})

@app.route('/api/stop_simulation', methods=['POST'])
def stop_simulation():
    """Stop simulation"""
    global simulation_running
    
    if simulation_running:
        simulator.stop_simulation()
        simulation_running = False
        
        return jsonify({"success": True, "message": "Simulation stopped"})
    
    return jsonify({"success": False, "message": "Simulation not running"})

@app.route('/api/reset_simulation', methods=['POST'])
def reset_simulation():
    """Reset simulation"""
    global simulation_running
    
    simulator.reset_simulation()
    simulation_running = False
    
    return jsonify({"success": True, "message": "Simulation reset"})

# SocketIO events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info("Client connected to simulation")
    emit('connected', {'message': 'Connected to AI Civilization'})
    
    # Send initial data
    emit('civilization_update', simulator.get_civilization_status())
    emit('agents_update', {'agents': simulator.get_all_agents_status()})
    emit('environment_update', simulator.get_environment_data())

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info("Client disconnected from simulation")

@socketio.on('request_update')
def handle_request_update():
    """Handle update request"""
    emit('civilization_update', simulator.get_civilization_status())
    emit('agents_update', {'agents': simulator.get_all_agents_status()})
    emit('environment_update', simulator.get_environment_data())

# Simulation loop
def run_simulation_loop():
    """Run main simulation loop"""
    global simulation_running
    
    while simulation_running:
        try:
            if simulator.is_running:
                # Simulate one step
                simulator.simulate_step()
                
                # Broadcast updates to all clients
                socketio.emit('civilization_update', simulator.get_civilization_status())
                socketio.emit('agents_update', {'agents': simulator.get_all_agents_status()})
                socketio.emit('positions_update', simulator.get_agent_positions())
                
                # Broadcast individual agent actions
                for event in simulator.event_log[-5:]:  # Last 5 events
                    if event['type'] in ['agent_combat', 'agent_theft', 'agent_healing']:
                        socketio.emit('agent_action', event['data'])
                    elif event['type'] == 'behavior_alert':
                        socketio.emit('behavior_alert', event['data'])
                
                # Clear recent events to avoid duplicate broadcasts
                if len(simulator.event_log) > 10:
                    simulator.event_log = simulator.event_log[-5:]
            
            time.sleep(1)  # 1 second per simulation step
            
        except Exception as e:
            logger.error(f"Error in simulation loop: {e}")
            time.sleep(1)

if __name__ == '__main__':
    logger.info("Starting AI Civilization Server...")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
