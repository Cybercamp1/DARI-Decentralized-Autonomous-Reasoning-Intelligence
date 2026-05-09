from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import logging
import threading
import time
from datetime import datetime

from src.realtime.dao_manager import DaoManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ai_civilization_realtime_secret'
socketio = SocketIO(app, cors_allowed_origins="*")

# Global variables
dao_manager = None

# Routes
@app.route('/')
def index():
    """Original simulation view"""
    return render_template('simulation.html')

@app.route('/realtime')
def realtime_dashboard():
    """Real-time business dashboard"""
    return render_template('realtime_dashboard.html')

@app.route('/dashboard')
def compact_dashboard():
    """Compact dashboard matching design"""
    return render_template('compact_dashboard.html')

@app.route('/workspace')
def animated_workspace():
    """Animated agent workspace"""
    return render_template('animated_workspace.html')

@app.route('/office')
def isometric_workspace():
    """3D isometric office workspace"""
    return render_template('isometric_workspace.html')

@app.route('/grid')
def square_grid_workspace():
    """Square grid workspace with AI agents"""
    return render_template('square_grid_workspace.html')

@app.route('/control')
def control():
    """Control dashboard page"""
    return render_template('control.html')

@app.route('/api/status')
def get_status():
    """Get civilization status"""
    if dao_manager:
        return jsonify({
            'treasury': dao_manager.treasury,
            'risk': dao_manager.risk_score,
            'proposals': dao_manager.active_proposals
        })
    return jsonify({"error": "DAO manager not initialized"})

@app.route('/api/realtime/status')
def get_realtime_status():
    """Get real-time business status"""
    if dao_manager:
        return jsonify({
            'treasury': dao_manager.treasury,
            'risk': dao_manager.risk_score,
            'proposals': dao_manager.active_proposals
        })
    return jsonify({"error": "DAO manager not initialized"})

# SocketIO event handlers
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info("Client connected to real-time dashboard")
    emit('connected', {'message': 'Connected to AI Business Network'})
    
    # Send initial data
    if dao_manager:
        dao_manager.update_metrics()

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info("Client disconnected from real-time dashboard")

@socketio.on('user_command')
def handle_user_message(data):
    """Handle user messages"""
    if dao_manager:
        dao_manager.handle_user_command(data)

def initialize_business_manager():
    """Initialize the business manager"""
    global dao_manager
    try:
        dao_manager = DaoManager(socketio)
        logger.info("DAO manager initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize DAO manager: {e}")
        return False

def run_background_tasks():
    """Run background initialization"""
    time.sleep(2)  # Wait for app to start
    initialize_business_manager()

if __name__ == '__main__':
    logger.info("Starting AI Civilization Real-Time Server...")
    
    # Start background initialization
    bg_thread = threading.Thread(target=run_background_tasks, daemon=True)
    bg_thread.start()
    
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
