import requests
import json
import time
import logging
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import uuid

@dataclass
class Product:
    id: str
    name: str
    description: str
    supplier_id: str
    cost_price: float
    selling_price: float
    stock_quantity: int
    category: str
    images: List[str]

@dataclass
class Supplier:
    id: str
    name: str
    email: str
    phone: str
    products: List[str]
    rating: float
    shipping_time: int  # days
    reliability: float

@dataclass
class CustomerOrder:
    id: str
    customer_id: str
    product_id: str
    quantity: int
    total_price: float
    shipping_address: str
    status: str  # PENDING, CONFIRMED, SHIPPED, DELIVERED
    order_date: datetime
    tracking_number: Optional[str] = None

@dataclass
class Shipment:
    id: str
    order_id: str
    supplier_id: str
    tracking_number: str
    status: str  # PREPARING, SHIPPED, IN_TRANSIT, DELIVERED
    estimated_delivery: datetime

class DropshippingAgent:
    """Autonomous dropshipping business agent"""
    
    def __init__(self, agent_id: str, name: str):
        self.agent_id = agent_id
        self.name = name
        self.balance = 5000.0
        self.products = {}
        self.suppliers = {}
        self.orders = {}
        self.shipments = {}
        self.logger = logging.getLogger(f"Dropship_{name}")
        
        # Business metrics
        self.total_revenue = 0.0
        self.total_costs = 0.0
        self.customers_served = 0
        self.supplier_relationships = {}
        
    def add_supplier(self, supplier_data: Dict) -> Dict:
        """Add new supplier to network"""
        try:
            supplier = Supplier(
                id=str(uuid.uuid4()),
                name=supplier_data['name'],
                email=supplier_data['email'],
                phone=supplier_data['phone'],
                products=supplier_data.get('products', []),
                rating=supplier_data.get('rating', 4.0),
                shipping_time=supplier_data.get('shipping_time', 7),
                reliability=supplier_data.get('reliability', 0.9)
            )
            
            self.suppliers[supplier.id] = supplier
            self.supplier_relationships[supplier.id] = {
                'contact_count': 0,
                'last_contact': None,
                'orders_placed': 0,
                'relationship_score': 0.5
            }
            
            self.logger.info(f"Added supplier: {supplier.name}")
            return {"status": "success", "supplier_id": supplier.id}
            
        except Exception as e:
            self.logger.error(f"Error adding supplier: {e}")
            return {"status": "error", "message": str(e)}
    
    def contact_supplier(self, supplier_id: str, message: str) -> Dict:
        """Contact supplier for negotiation or inquiry"""
        if supplier_id not in self.suppliers:
            return {"status": "error", "message": "Supplier not found"}
        
        supplier = self.suppliers[supplier_id]
        relationship = self.supplier_relationships[supplier_id]
        
        # Simulate supplier communication
        response = self._simulate_supplier_response(supplier, message)
        
        # Update relationship
        relationship['contact_count'] += 1
        relationship['last_contact'] = datetime.now()
        relationship['relationship_score'] = min(1.0, relationship['relationship_score'] + 0.05)
        
        self.logger.info(f"Contacted supplier {supplier.name}: {message}")
        
        return {
            "status": "success",
            "supplier": supplier.name,
            "message": message,
            "response": response,
            "relationship_score": relationship['relationship_score']
        }
    
    def _simulate_supplier_response(self, supplier: Supplier, message: str) -> str:
        """Simulate supplier response to inquiry"""
        responses = [
            f"Thank you for your interest! We can offer bulk pricing for orders over 50 units.",
            f"Our current lead time is {supplier.shipping_time} business days.",
            f"We offer {supplier.rating}/5 star quality guarantee on all products.",
            "Yes, we can customize packaging for your brand.",
            "We accept payment via wire transfer and major credit cards."
        ]
        
        import random
        return random.choice(responses)
    
    def add_product(self, product_data: Dict) -> Dict:
        """Add product to catalog"""
        try:
            product = Product(
                id=str(uuid.uuid4()),
                name=product_data['name'],
                description=product_data['description'],
                supplier_id=product_data['supplier_id'],
                cost_price=product_data['cost_price'],
                selling_price=product_data['selling_price'],
                stock_quantity=product_data.get('stock_quantity', 100),
                category=product_data.get('category', 'general'),
                images=product_data.get('images', [])
            )
            
            self.products[product.id] = product
            self.logger.info(f"Added product: {product.name}")
            
            return {"status": "success", "product_id": product.id}
            
        except Exception as e:
            self.logger.error(f"Error adding product: {e}")
            return {"status": "error", "message": str(e)}
    
    def process_customer_order(self, order_data: Dict) -> Dict:
        """Process incoming customer order"""
        try:
            order = CustomerOrder(
                id=str(uuid.uuid4()),
                customer_id=order_data['customer_id'],
                product_id=order_data['product_id'],
                quantity=order_data['quantity'],
                total_price=order_data['total_price'],
                shipping_address=order_data['shipping_address'],
                status="PENDING",
                order_date=datetime.now()
            )
            
            # Check product availability
            if order.product_id not in self.products:
                return {"status": "error", "message": "Product not found"}
            
            product = self.products[order.product_id]
            if product.stock_quantity < order.quantity:
                return {"status": "error", "message": "Insufficient stock"}
            
            # Process payment (simulated)
            if order.total_price > self.balance:
                return {"status": "error", "message": "Insufficient funds for supplier payment"}
            
            # Confirm order
            order.status = "CONFIRMED"
            self.orders[order.id] = order
            
            # Update stock
            product.stock_quantity -= order.quantity
            
            # Place order with supplier
            shipment_result = self._place_supplier_order(order, product)
            
            if shipment_result["status"] == "success":
                order.status = "SHIPPED"
                self.total_revenue += order.total_price
                self.total_costs += product.cost_price * order.quantity
                self.customers_served += 1
                
                # Update supplier relationship
                supplier_rel = self.supplier_relationships[product.supplier_id]
                supplier_rel['orders_placed'] += 1
                supplier_rel['relationship_score'] = min(1.0, supplier_rel['relationship_score'] + 0.1)
            
            self.logger.info(f"Processed order {order.id} for product {product.name}")
            
            return {
                "status": "success",
                "order_id": order.id,
                "shipment": shipment_result
            }
            
        except Exception as e:
            self.logger.error(f"Error processing order: {e}")
            return {"status": "error", "message": str(e)}
    
    def _place_supplier_order(self, order: CustomerOrder, product: Product) -> Dict:
        """Place order with supplier"""
        try:
            supplier = self.suppliers[product.supplier_id]
            
            # Create shipment
            shipment = Shipment(
                id=str(uuid.uuid4()),
                order_id=order.id,
                supplier_id=product.supplier_id,
                tracking_number=self._generate_tracking_number(),
                status="PREPARING",
                estimated_delivery=datetime.now().timestamp() + (supplier.shipping_time * 24 * 3600)
            )
            
            self.shipments[shipment.id] = shipment
            
            # Simulate supplier confirmation
            self.logger.info(f"Placed order with supplier {supplier.name} for {order.quantity} units")
            
            return {
                "status": "success",
                "shipment_id": shipment.id,
                "tracking_number": shipment.tracking_number,
                "estimated_delivery": shipment.estimated_delivery
            }
            
        except Exception as e:
            self.logger.error(f"Error placing supplier order: {e}")
            return {"status": "error", "message": str(e)}
    
    def _generate_tracking_number(self) -> str:
        """Generate tracking number"""
        import random
        return f"TRK{random.randint(1000000000, 9999999999)}"
    
    def update_shipment_status(self, shipment_id: str, new_status: str) -> Dict:
        """Update shipment status"""
        if shipment_id not in self.shipments:
            return {"status": "error", "message": "Shipment not found"}
        
        shipment = self.shipments[shipment_id]
        old_status = shipment.status
        shipment.status = new_status
        
        # Update order status if needed
        if shipment.order_id in self.orders:
            order = self.orders[shipment.order_id]
            if new_status == "DELIVERED":
                order.status = "DELIVERED"
        
        self.logger.info(f"Updated shipment {shipment_id}: {old_status} -> {new_status}")
        
        return {
            "status": "success",
            "shipment_id": shipment_id,
            "old_status": old_status,
            "new_status": new_status
        }
    
    def analyze_business_performance(self) -> Dict:
        """Analyze business performance metrics"""
        total_orders = len(self.orders)
        completed_orders = len([o for o in self.orders.values() if o.status == "DELIVERED"])
        pending_orders = len([o for o in self.orders.values() if o.status in ["PENDING", "CONFIRMED", "SHIPPED"]])
        
        profit_margin = 0.0
        if self.total_revenue > 0:
            profit_margin = ((self.total_revenue - self.total_costs) / self.total_revenue) * 100
        
        # Top performing products
        product_sales = {}
        for order in self.orders.values():
            if order.product_id in product_sales:
                product_sales[order.product_id] += order.quantity
            else:
                product_sales[order.product_id] = order.quantity
        
        top_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Supplier performance
        supplier_performance = {}
        for supplier_id, relationship in self.supplier_relationships.items():
            supplier = self.suppliers[supplier_id]
            supplier_performance[supplier.name] = {
                'orders_placed': relationship['orders_placed'],
                'relationship_score': relationship['relationship_score'],
                'rating': supplier.rating,
                'reliability': supplier.reliability
            }
        
        return {
            'total_orders': total_orders,
            'completed_orders': completed_orders,
            'pending_orders': pending_orders,
            'completion_rate': (completed_orders / total_orders * 100) if total_orders > 0 else 0,
            'total_revenue': self.total_revenue,
            'total_costs': self.total_costs,
            'net_profit': self.total_revenue - self.total_costs,
            'profit_margin': profit_margin,
            'customers_served': self.customers_served,
            'current_balance': self.balance,
            'top_products': top_products,
            'supplier_performance': supplier_performance,
            'active_suppliers': len(self.suppliers),
            'total_products': len(self.products)
        }
    
    def get_pending_tasks(self) -> List[Dict]:
        """Get pending tasks that need attention"""
        tasks = []
        
        # Check low stock products
        for product_id, product in self.products.items():
            if product.stock_quantity < 10:
                tasks.append({
                    'type': 'low_stock',
                    'priority': 'high',
                    'description': f"Low stock for {product.name}: {product.stock_quantity} units remaining",
                    'product_id': product_id
                })
        
        # Check delayed shipments
        current_time = datetime.now().timestamp()
        for shipment_id, shipment in self.shipments.items():
            if shipment.status in ["PREPARING", "SHIPPED"] and current_time > shipment.estimated_delivery:
                tasks.append({
                    'type': 'delayed_shipment',
                    'priority': 'medium',
                    'description': f"Shipment {shipment.tracking_number} is delayed",
                    'shipment_id': shipment_id
                })
        
        # Check supplier relationships
        for supplier_id, relationship in self.supplier_relationships.items():
            if relationship['relationship_score'] < 0.3:
                tasks.append({
                    'type': 'supplier_relation',
                    'priority': 'medium',
                    'description': f"Low relationship score with supplier {self.suppliers[supplier_id].name}",
                    'supplier_id': supplier_id
                })
        
        return tasks
    
    def request_help(self, task_type: str, description: str) -> Dict:
        """Request help from other agents"""
        help_request = {
            'agent_id': self.agent_id,
            'agent_name': self.name,
            'task_type': task_type,
            'description': description,
            'timestamp': datetime.now().isoformat(),
            'urgency': 'medium'
        }
        
        self.logger.warning(f"Requesting help: {description}")
        
        return {
            "status": "help_requested",
            "request": help_request,
            "message": f"Help requested from other agents for: {description}"
        }
