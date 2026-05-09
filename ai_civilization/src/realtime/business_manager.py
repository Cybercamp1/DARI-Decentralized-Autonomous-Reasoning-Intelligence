import asyncio
import json
import time
import logging
import random
from typing import Dict, List, Optional, Any
from datetime import datetime
import threading
from dataclasses import dataclass

from ..agents.trader_agent import RealTimeTraderAgent
from ..agents.dropshipping_agent import DropshippingAgent
from ..communication.chat_system import ChatSystem

@dataclass
class BusinessMetrics:
    total_revenue: float = 0.0
    trading_pnl: float = 0.0
    orders_completed: int = 0
    total_orders: int = 0
    success_rate: float = 0.0
    active_agents: int = 0
    system_uptime: float = 0.0

class RealTimeBusinessManager:
    """Manages real-time business operations and agent coordination"""
    
    def __init__(self, socketio_instance):
        self.socketio = socketio_instance
        self.chat_system = ChatSystem()
        self.agents = {}
        self.metrics = BusinessMetrics()
        self.logger = logging.getLogger("BusinessManager")
        
        # Start time
        self.start_time = time.time()
        
        # Initialize agents
        self._initialize_agents()
        
        # Start background tasks
        self.running = True
        self.background_thread = threading.Thread(target=self._background_loop, daemon=True)
        self.background_thread.start()
        
        self.logger.info("Real-time Business Manager initialized")
    
    def _initialize_agents(self):
        """Initialize business agents"""
        # Trader Agent
        trader = RealTimeTraderAgent("trader_001", "Alpha Trader")
        self.agents["trader_001"] = trader
        self.chat_system.register_agent("trader_001", "Alpha Trader", "Trader")
        
        # Dropshipping Agent
        dropshipper = DropshippingAgent("dropship_001", "Logistics Master")
        self.agents["dropship_001"] = dropshipper
        self.chat_system.register_agent("dropship_001", "Logistics Master", "Dropshipping")
        
        # Add sample suppliers and products
        self._setup_sample_data()
        
        self.logger.info(f"Initialized {len(self.agents)} business agents")
    
    def _setup_sample_data(self):
        """Setup sample business data"""
        dropshipper = self.agents["dropship_001"]
        
        # Add suppliers
        suppliers = [
            {
                "name": "TechWholesale Inc",
                "email": "sales@techwholesale.com",
                "phone": "+1-555-0123",
                "products": [],
                "rating": 4.5,
                "shipping_time": 5,
                "reliability": 0.95
            },
            {
                "name": "Global Electronics",
                "email": "orders@globalelec.com",
                "phone": "+1-555-0456",
                "products": [],
                "rating": 4.2,
                "shipping_time": 7,
                "reliability": 0.88
            }
        ]
        
        for supplier_data in suppliers:
            result = dropshipper.add_supplier(supplier_data)
            if result["status"] == "success":
                supplier_id = result["supplier_id"]
                
                # Add products for each supplier
                products = [
                    {
                        "name": f"Wireless Headphones Pro",
                        "description": "Premium noise-cancelling headphones",
                        "supplier_id": supplier_id,
                        "cost_price": 45.50,
                        "selling_price": 89.99,
                        "stock_quantity": 100,
                        "category": "Electronics"
                    },
                    {
                        "name": f"Smart Watch Ultra",
                        "description": "Advanced fitness and health tracking",
                        "supplier_id": supplier_id,
                        "cost_price": 125.00,
                        "selling_price": 249.99,
                        "stock_quantity": 50,
                        "category": "Electronics"
                    }
                ]
                
                for product_data in products:
                    dropshipper.add_product(product_data)
    
    def _background_loop(self):
        """Background processing loop"""
        while self.running:
            try:
                # Update trading signals
                self._update_trading_signals()
                
                # Process dropshipping operations
                self._process_dropshipping_operations()
                
                # Update metrics
                self._update_metrics()
                
                # Check for help requests
                self._check_help_requests()
                
                # Broadcast updates
                self._broadcast_updates()
                
                time.sleep(10)  # Update every 10 seconds
                
            except Exception as e:
                self.logger.error(f"Error in background loop: {e}")
                time.sleep(5)
    
    def _update_trading_signals(self):
        """Update trading signals"""
        trader = self.agents["trader_001"]
        
        # Analyze different symbols
        symbols = ["BTC", "ETH", "AAPL", "GOOGL", "TSLA"]
        
        for symbol in symbols:
            signal = trader.analyze_market(symbol)
            
            # Broadcast signal if confidence is high
            if signal.confidence > 0.6:
                self.socketio.emit('trading_signal', {
                    'agent_id': 'trader_001',
                    'agent_name': 'Alpha Trader',
                    'symbol': signal.symbol,
                    'action': signal.action,
                    'price': signal.price,
                    'confidence': signal.confidence,
                    'reason': signal.reason,
                    'timestamp': signal.timestamp.isoformat()
                })
                
                # Execute trade if signal is strong
                if signal.confidence > 0.8:
                    trade_result = trader.execute_trade(signal)
                    
                    # Send chat message about trade
                    self.chat_system.send_message(
                        sender="trader_001",
                        recipient="user",
                        message_type="agent_update",
                        content=f"Executed {signal.action} order for {signal.symbol} at ${signal.price} (Confidence: {signal.confidence:.2f})",
                        data=trade_result
                    )
    
    def _process_dropshipping_operations(self):
        """Process dropshipping operations"""
        dropshipper = self.agents["dropship_001"]
        
        # Simulate incoming orders
        import random
        if random.random() < 0.3:  # 30% chance of new order
            order_data = {
                "customer_id": f"cust_{random.randint(1000, 9999)}",
                "product_id": random.choice(list(dropshipper.products.keys())),
                "quantity": random.randint(1, 3),
                "total_price": random.uniform(50, 300),
                "shipping_address": f"{random.randint(100, 999)} Main St, City, State"
            }
            
            result = dropshipper.process_customer_order(order_data)
            
            if result["status"] == "success":
                product = dropshipper.products[order_data["product_id"]]
                
                # Send update
                self.socketio.emit('dropshipping_update', {
                    'agent_id': 'dropship_001',
                    'agent_name': 'Logistics Master',
                    'order_id': result["order_id"],
                    'product_name': product.name,
                    'total_price': order_data["total_price"],
                    'status': 'CONFIRMED',
                    'order_date': datetime.now().isoformat()
                })
                
                # Send chat message
                self.chat_system.send_message(
                    sender="dropship_001",
                    recipient="user",
                    message_type="agent_update",
                    content=f"New order processed: {product.name} (${order_data['total_price']:.2f})",
                    data=result
                )
        
        # Update shipment statuses
        for shipment_id, shipment in dropshipper.shipments.items():
            import random
            if random.random() < 0.1:  # 10% chance of status update
                if shipment.status == "PREPARING":
                    dropshipper.update_shipment_status(shipment_id, "SHIPPED")
                elif shipment.status == "SHIPPED":
                    dropshipper.update_shipment_status(shipment_id, "DELIVERED")
    
    def _update_metrics(self):
        """Update business metrics"""
        # Get trader performance
        trader = self.agents["trader_001"]
        trader_portfolio = trader.get_portfolio_status()
        
        # Get dropshipper performance
        dropshipper = self.agents["dropship_001"]
        dropshipper_performance = dropshipper.analyze_business_performance()
        
        # Update metrics
        self.metrics.total_revenue = dropshipper_performance['total_revenue']
        self.metrics.trading_pnl = trader_portfolio['total_pnl']
        self.metrics.orders_completed = dropshipper_performance['completed_orders']
        self.metrics.total_orders = dropshipper_performance['total_orders']
        self.metrics.success_rate = dropshipper_performance['completion_rate']
        self.metrics.active_agents = len(self.agents)
        self.metrics.system_uptime = time.time() - self.start_time
        
        # Broadcast metrics
        self.socketio.emit('performance_update', {
            'total_revenue': self.metrics.total_revenue,
            'trading_pnl': self.metrics.trading_pnl,
            'orders_completed': self.metrics.orders_completed,
            'success_rate': self.metrics.success_rate,
            'chart_data': [random.uniform(100, 1000) for _ in range(6)]  # Sample chart data
        })
    
    def _check_help_requests(self):
        """Check for agent help requests"""
        for agent_id, agent in self.agents.items():
            if isinstance(agent, DropshippingAgent):
                # Check for pending tasks
                tasks = agent.get_pending_tasks()
                
                for task in tasks:
                    if task['priority'] == 'high':
                        # Send help request
                        help_request = agent.request_help(task['type'], task['description'])
                        
                        self.socketio.emit('help_request', {
                            'agent_id': agent_id,
                            'agent_name': agent.name,
                            'task_type': task['type'],
                            'description': task['description'],
                            'urgency': task['priority'],
                            'timestamp': datetime.now().isoformat()
                        })
                        
                        # Send chat message
                        self.chat_system.send_message(
                            sender=agent_id,
                            recipient="user",
                            message_type="help_request",
                            content=f"HELP NEEDED: {task['description']}",
                            data=help_request
                        )
    
    def _broadcast_updates(self):
        """Broadcast system updates"""
        # Get system status
        system_status = self.chat_system.get_system_status()
        active_agents = self.chat_system.get_active_agents()
        
        # Update agent statuses
        for agent_id, agent_info in active_agents.items():
            self.socketio.emit('agent_status', {
                'agent_id': agent_id,
                'name': agent_info['name'],
                'type': agent_info['type'],
                'status': agent_info['status'],
                'unread_count': agent_info['unread_count'],
                'last_seen': agent_info['last_seen']
            })
    
    def handle_user_message(self, data):
        """Handle user messages"""
        content = data.get('content', '')
        
        # Parse commands
        if content.lower().startswith('trader '):
            # Forward to trader
            command = content[7:].strip()
            trader = self.agents["trader_001"]
            
            if command == "status":
                portfolio = trader.get_portfolio_status()
                response = f"Portfolio Status: Balance ${portfolio['balance']:.2f}, Total Value ${portfolio['total_value']:.2f}, P&L ${portfolio['total_pnl']:.2f}"
            elif command == "signals":
                signals = trader.get_recent_signals(5)
                response = f"Recent Signals: {len(signals)} signals generated"
            else:
                response = f"Trader command received: {command}"
            
            self.chat_system.send_message(
                sender="trader_001",
                recipient="user",
                message_type="chat",
                content=response
            )
            
        elif content.lower().startswith('dropship '):
            # Forward to dropshipper
            command = content[9:].strip()
            dropshipper = self.agents["dropship_001"]
            
            if command == "status":
                performance = dropshipper.analyze_business_performance()
                response = f"Business Status: {performance['total_orders']} orders, ${performance['total_revenue']:.2f} revenue"
            elif command == "suppliers":
                response = f"Active Suppliers: {len(dropshipper.suppliers)}"
            else:
                response = f"Dropshipper command received: {command}"
            
            self.chat_system.send_message(
                sender="dropship_001",
                recipient="user",
                message_type="chat",
                content=response
            )
        
        else:
            # General message
            self.chat_system.send_message(
                sender="user",
                recipient="all",
                message_type="chat",
                content=content
            )
    
    def get_system_status(self):
        """Get overall system status"""
        return {
            'metrics': {
                'total_revenue': self.metrics.total_revenue,
                'trading_pnl': self.metrics.trading_pnl,
                'orders_completed': self.metrics.orders_completed,
                'success_rate': self.metrics.success_rate,
                'active_agents': self.metrics.active_agents,
                'system_uptime': self.metrics.system_uptime
            },
            'agents': self.chat_system.get_active_agents(),
            'tasks': len([t for t in self.chat_system.tasks.values() if t.status in ['PENDING', 'IN_PROGRESS']]),
            'messages': len(self.chat_system.messages)
        }
    
    def shutdown(self):
        """Shutdown the business manager"""
        self.running = False
        if self.background_thread.is_alive():
            self.background_thread.join(timeout=5)
        self.logger.info("Business Manager shutdown")
