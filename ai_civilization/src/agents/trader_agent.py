import requests
import json
import time
import logging
import random
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import numpy as np

@dataclass
class MarketSignal:
    symbol: str
    action: str  # BUY, SELL, HOLD
    confidence: float
    price: float
    reason: str
    timestamp: datetime

@dataclass
class TradePosition:
    symbol: str
    entry_price: float
    current_price: float
    quantity: int
    pnl: float
    status: str  # OPEN, CLOSED

class RealTimeTraderAgent:
    """Real-time trading agent with market prediction"""
    
    def __init__(self, agent_id: str, name: str):
        self.agent_id = agent_id
        self.name = name
        self.balance = 10000.0
        self.positions = {}
        self.signals = []
        self.logger = logging.getLogger(f"Trader_{name}")
        
        # Trading parameters
        self.risk_tolerance = 0.02  # 2% risk per trade
        self.max_positions = 5
        self.update_interval = 60  # seconds
        
        # Market data sources (simulated for demo)
        self.market_data = {}
        self.indicators = {}
        
    def analyze_market(self, symbol: str) -> MarketSignal:
        """Analyze market and generate trading signal"""
        try:
            # Simulate market data fetching
            market_data = self._fetch_market_data(symbol)
            
            # Technical analysis
            rsi = self._calculate_rsi(market_data)
            macd = self._calculate_macd(market_data)
            trend = self._identify_trend(market_data)
            
            # Generate signal
            signal = self._generate_signal(symbol, rsi, macd, trend, market_data['price'], market_data)
            
            self.logger.info(f"Generated signal for {symbol}: {signal.action} (Confidence: {signal.confidence:.2f})")
            return signal
            
        except Exception as e:
            self.logger.error(f"Error analyzing {symbol}: {e}")
            return MarketSignal(symbol, "HOLD", 0.0, 0.0, "Analysis failed", datetime.now())
    
    def _fetch_market_data(self, symbol: str) -> Dict:
        """Fetch real-time market data"""
        # Simulated market data - in production, use real APIs
        import random
        
        if symbol not in self.market_data:
            self.market_data[symbol] = {
                'price': random.uniform(100, 1000),
                'volume': random.uniform(1000000, 10000000),
                'history': [random.uniform(100, 1000) for _ in range(100)]
            }
        
        # Update with new price
        current_price = self.market_data[symbol]['price']
        change = random.uniform(-0.05, 0.05)  # ±5% change
        new_price = current_price * (1 + change)
        
        self.market_data[symbol]['price'] = new_price
        self.market_data[symbol]['history'].append(new_price)
        self.market_data[symbol]['history'] = self.market_data[symbol]['history'][-100:]
        
        return self.market_data[symbol]
    
    def _calculate_rsi(self, market_data: Dict, period: int = 14) -> float:
        """Calculate RSI indicator"""
        prices = market_data['history'][-period:]
        if len(prices) < period:
            return 50.0
        
        gains = []
        losses = []
        
        for i in range(1, len(prices)):
            change = prices[i] - prices[i-1]
            if change > 0:
                gains.append(change)
                losses.append(0)
            else:
                gains.append(0)
                losses.append(abs(change))
        
        avg_gain = np.mean(gains) if gains else 0
        avg_loss = np.mean(losses) if losses else 0
        
        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def _calculate_macd(self, market_data: Dict) -> Dict:
        """Calculate MACD indicator"""
        prices = market_data['history']
        if len(prices) < 26:
            return {'macd': 0, 'signal': 0, 'histogram': 0}
        
        # Simplified MACD calculation
        ema12 = np.mean(prices[-12:])
        ema26 = np.mean(prices[-26:])
        macd = ema12 - ema26
        signal = macd * 0.9  # Simplified signal line
        histogram = macd - signal
        
        return {'macd': macd, 'signal': signal, 'histogram': histogram}
    
    def _identify_trend(self, market_data: Dict) -> str:
        """Identify market trend"""
        prices = market_data['history'][-20:]
        if len(prices) < 20:
            return "NEUTRAL"
        
        # Simple trend analysis
        recent_avg = np.mean(prices[-5:])
        older_avg = np.mean(prices[-20:-5])
        
        if recent_avg > older_avg * 1.02:
            return "UPTREND"
        elif recent_avg < older_avg * 0.98:
            return "DOWNTREND"
        else:
            return "NEUTRAL"
    
    def _generate_signal(self, symbol: str, rsi: float, macd: Dict, trend: str, price: float, market_data: Dict) -> MarketSignal:
        """Generate trading signal based on indicators"""
        confidence = 0.0
        action = "HOLD"
        reason = ""
        
        # RSI signals
        if rsi < 30:
            confidence += 0.3
            action = "BUY"
            reason = "RSI oversold"
        elif rsi > 70:
            confidence += 0.3
            action = "SELL"
            reason = "RSI overbought"
        
        # MACD signals
        if macd['histogram'] > 0 and macd['macd'] > macd['signal']:
            confidence += 0.2
            if action == "HOLD":
                action = "BUY"
            reason += " MACD bullish"
        elif macd['histogram'] < 0 and macd['macd'] < macd['signal']:
            confidence += 0.2
            if action == "HOLD":
                action = "SELL"
            reason += " MACD bearish"
        
        # Trend signals
        if trend == "UPTREND" and action != "SELL":
            confidence += 0.2
            if action == "HOLD":
                action = "BUY"
            reason += " Uptrend support"
        elif trend == "DOWNTREND" and action != "BUY":
            confidence += 0.2
            if action == "HOLD":
                action = "SELL"
            reason += " Downtrend resistance"
        
        # Volume confirmation (simplified)
        if market_data.get('volume', 0) > 5000000:
            confidence += 0.1
        
        # Cap confidence at 95%
        confidence = min(confidence, 0.95)
        
        if confidence < 0.4:
            action = "HOLD"
            reason = "Insufficient signal strength"
        
        return MarketSignal(
            symbol=symbol,
            action=action,
            confidence=confidence,
            price=price,
            reason=reason.strip() or "Technical analysis",
            timestamp=datetime.now()
        )
    
    def execute_trade(self, signal: MarketSignal) -> Dict:
        """Execute trade based on signal"""
        if signal.action == "HOLD":
            return {"status": "no_action", "reason": "Hold signal"}
        
        if signal.action == "BUY":
            return self._execute_buy(signal)
        elif signal.action == "SELL":
            return self._execute_sell(signal)
    
    def _execute_buy(self, signal: MarketSignal) -> Dict:
        """Execute buy order"""
        if len(self.positions) >= self.max_positions:
            return {"status": "rejected", "reason": "Max positions reached"}
        
        # Calculate position size
        risk_amount = self.balance * self.risk_tolerance
        position_size = risk_amount / signal.price
        
        if position_size * signal.price > self.balance * 0.1:  # Max 10% per trade
            position_size = (self.balance * 0.1) / signal.price
        
        # Execute trade
        cost = position_size * signal.price
        self.balance -= cost
        
        self.positions[signal.symbol] = TradePosition(
            symbol=signal.symbol,
            entry_price=signal.price,
            current_price=signal.price,
            quantity=int(position_size),
            pnl=0.0,
            status="OPEN"
        )
        
        return {
            "status": "executed",
            "action": "BUY",
            "symbol": signal.symbol,
            "quantity": int(position_size),
            "price": signal.price,
            "cost": cost
        }
    
    def _execute_sell(self, signal: MarketSignal) -> Dict:
        """Execute sell order"""
        if signal.symbol not in self.positions:
            return {"status": "rejected", "reason": "No position to sell"}
        
        position = self.positions[signal.symbol]
        
        # Close position
        proceeds = position.quantity * signal.price
        self.balance += proceeds
        
        # Calculate P&L
        pnl = (signal.price - position.entry_price) * position.quantity
        position.pnl = pnl
        position.status = "CLOSED"
        
        # Remove from open positions
        del self.positions[signal.symbol]
        
        return {
            "status": "executed",
            "action": "SELL",
            "symbol": signal.symbol,
            "quantity": position.quantity,
            "price": signal.price,
            "proceeds": proceeds,
            "pnl": pnl
        }
    
    def get_portfolio_status(self) -> Dict:
        """Get current portfolio status"""
        total_value = self.balance
        open_positions = []
        
        for symbol, position in self.positions.items():
            # Update current price
            current_data = self._fetch_market_data(symbol)
            position.current_price = current_data['price']
            position.pnl = (position.current_price - position.entry_price) * position.quantity
            
            total_value += position.quantity * position.current_price
            open_positions.append({
                'symbol': position.symbol,
                'quantity': position.quantity,
                'entry_price': position.entry_price,
                'current_price': position.current_price,
                'pnl': position.pnl,
                'pnl_percent': (position.current_price - position.entry_price) / position.entry_price * 100
            })
        
        return {
            'balance': self.balance,
            'total_value': total_value,
            'open_positions': open_positions,
            'total_pnl': total_value - 10000,  # Initial balance was 10000
            'return_percent': ((total_value - 10000) / 10000) * 100
        }
    
    def get_recent_signals(self, limit: int = 10) -> List[Dict]:
        """Get recent trading signals"""
        return [
            {
                'symbol': signal.symbol,
                'action': signal.action,
                'confidence': signal.confidence,
                'price': signal.price,
                'reason': signal.reason,
                'timestamp': signal.timestamp.isoformat()
            }
            for signal in self.signals[-limit:]
        ]
