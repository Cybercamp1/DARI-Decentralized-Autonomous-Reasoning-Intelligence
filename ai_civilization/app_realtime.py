from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
import logging
import threading
import time
from datetime import datetime

from src.realtime.business_manager import RealTimeBusinessManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ai_civilization_realtime_secret'
socketio = SocketIO(app, cors_allowed_origins="*")

# Global variables
business_manager = None

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
    if business_manager:
        return jsonify(business_manager.get_system_status())
    return jsonify({"error": "Business manager not initialized"})

@app.route('/api/realtime/status')
def get_realtime_status():
    """Get real-time business status"""
    if business_manager:
        return jsonify(business_manager.get_system_status())
    return jsonify({"error": "Business manager not initialized"})

# SocketIO event handlers
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info("Client connected to real-time dashboard")
    emit('connected', {'message': 'Connected to AI Business Network'})
    
    # Send initial data
    if business_manager:
        status = business_manager.get_system_status()
        emit('system_status', status)

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info("Client disconnected from real-time dashboard")

@socketio.on('get_system_status')
def handle_get_status():
    """Handle system status request"""
    if business_manager:
        status = business_manager.get_system_status()
        emit('system_status', status)

@socketio.on('user_message')
def handle_user_message(data):
    """Handle user messages"""
    if business_manager:
        business_manager.handle_user_message(data)

@socketio.on('request_trading_update')
def handle_trading_update():
    """Handle trading update request"""
    if business_manager:
        trader = business_manager.agents.get("trader_001")
        if trader:
            # Generate fresh signals
            symbols = ["BTC", "ETH", "AAPL", "GOOGL", "TSLA"]
            for symbol in symbols:
                signal = trader.analyze_market(symbol)
                if signal.confidence > 0.5:
                    emit('trading_signal', {
                        'agent_id': 'trader_001',
                        'agent_name': 'Alpha Trader',
                        'symbol': signal.symbol,
                        'action': signal.action,
                        'price': signal.price,
                        'confidence': signal.confidence,
                        'reason': signal.reason,
                        'timestamp': signal.timestamp.isoformat()
                    })

@socketio.on('request_dropshipping_update')
def handle_dropshipping_update():
    """Handle dropshipping update request"""
    if business_manager:
        dropshipper = business_manager.agents.get("dropship_001")
        if dropshipper:
            performance = dropshipper.analyze_business_performance()
            
            # Get recent orders
            recent_orders = []
            for order_id, order in list(dropshipper.orders.items())[-5:]:
                product = dropshipper.products.get(order.product_id)
                recent_orders.append({
                    'id': order_id,
                    'product_name': product.name if product else 'Unknown',
                    'total_price': order.total_price,
                    'status': order.status,
                    'order_date': order.order_date.isoformat()
                })
            
            emit('dropshipping_update', {
                'agent_id': 'dropship_001',
                'agent_name': 'Logistics Master',
                'performance': performance,
                'orders': recent_orders
            })

@socketio.on('assign_task')
def handle_task_assignment(data):
    """Handle task assignment"""
    if business_manager:
        agent_id = data.get('agent_id')
        task_description = data.get('task_description')
        
        if agent_id in business_manager.agents:
            # Create task
            task_id = business_manager.chat_system.send_message(
                sender="user",
                recipient=agent_id,
                message_type="task_assignment",
                content=task_description,
                priority="medium"
            )
            
            emit('task_assigned', {
                'task_id': task_id,
                'agent_id': agent_id,
                'description': task_description
            })

def initialize_business_manager():
    """Initialize the business manager"""
    global business_manager
    try:
        business_manager = RealTimeBusinessManager(socketio)
        logger.info("Business manager initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize business manager: {e}")
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
    
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
