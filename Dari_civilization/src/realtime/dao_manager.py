import threading
import time
import random
import uuid
import datetime

def generate_tx_hash():
    return "0x" + "".join(random.choices("0123456789abcdef", k=40))

class DaoManager:
    def __init__(self, socketio):
        self.socketio = socketio
        self.treasury = 2500000
        self.risk_score = 12
        self.active_proposals = 3
        self.last_action = "System Initialized"
        
        self.proofs = []
        
        self.agents = {
            'evaluator': {'name': 'Proposal Analysis', 'status': 'IDLE', 'task': 'Awaiting proposals...'},
            'researcher': {'name': 'Security Intel', 'status': 'MONITORING', 'task': 'Scanning mempool...'},
            'verifier': {'name': 'Governance Val.', 'status': 'IDLE', 'task': 'Standing by...'},
            'strategist': {'name': 'DAO Strategy', 'status': 'MONITORING', 'task': 'Monitoring quorum...'},
            'trader_001': {'name': 'Market Intel', 'status': 'MONITORING', 'task': 'Analyzing volatility...'},
            'dropship_001': {'name': 'Treasury Ops', 'status': 'MONITORING', 'task': 'Tracking runway...'}
        }
        
        self._start_agent_threads()
        self._start_system_events()
        
    def _start_agent_threads(self):
        threading.Thread(target=self.run_security_agent, daemon=True).start()
        threading.Thread(target=self.run_treasury_agent, daemon=True).start()
        threading.Thread(target=self.run_market_agent, daemon=True).start()
        threading.Thread(target=self.run_strategy_agent, daemon=True).start()
        threading.Thread(target=self.run_proposal_agent, daemon=True).start()
        
    def update_metrics(self):
        self.socketio.emit('dao_metrics', {
            'treasury': self.treasury,
            'risk': self.risk_score,
            'proposals': self.active_proposals,
            'last_action': self.last_action
        })
        
    def emit_log(self, sender, text):
        self.socketio.emit('system_log', {'sender': sender, 'text': text})
        
    def update_agent(self, agent_id, task, status):
        self.agents[agent_id]['task'] = task
        self.agents[agent_id]['status'] = status
        self.socketio.emit('agent_update', {
            'agent_id': agent_id,
            'task': task,
            'status': status
        })

    def add_proof(self, agent_name, task_name, status="COMPLETED"):
        tx_hash = generate_tx_hash()
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        proof = {
            "id": str(uuid.uuid4()),
            "time": timestamp,
            "agent": agent_name,
            "task": task_name,
            "status": status,
            "tx_hash": tx_hash[:10] + "..."
        }
        self.proofs.insert(0, proof)
        if len(self.proofs) > 10:
            self.proofs.pop()
        self.socketio.emit('ai_proofs', self.proofs)
        return tx_hash

    # Autonomous Agent Loops
    def run_security_agent(self):
        while True:
            self.update_agent('researcher', 'Monitoring blockchain events...', 'MONITORING')
            time.sleep(random.uniform(5, 10))
            
            self.update_agent('researcher', 'Analyzing smart contract calldata...', 'ANALYZING')
            time.sleep(random.uniform(2, 4))
            
            self.update_agent('researcher', 'Verifying execution permissions...', 'EXECUTING')
            time.sleep(random.uniform(2, 4))
            
            if random.random() > 0.7:
                risk_change = random.randint(-2, 2)
                self.risk_score = max(0, min(100, self.risk_score + risk_change))
                tx = self.add_proof("Security Intel", "Contract Scan Verification")
                self.emit_log('Security Intel', f"Security scan completed. Tx Ref: {tx}")
                self.update_metrics()
            
            self.update_agent('researcher', 'Cross-referencing threat databases...', 'COMMUNICATING')
            time.sleep(random.uniform(2, 5))

    def run_treasury_agent(self):
        while True:
            self.update_agent('dropship_001', 'Tracking DAO reserves...', 'MONITORING')
            time.sleep(random.uniform(6, 12))
            
            self.update_agent('dropship_001', 'Recalculating treasury exposure...', 'ANALYZING')
            time.sleep(random.uniform(3, 5))
            
            self.update_agent('dropship_001', 'Updating allocation distribution...', 'EXECUTING')
            time.sleep(random.uniform(2, 4))
            
            if random.random() > 0.6:
                yield_amount = random.uniform(100, 500)
                self.treasury += yield_amount
                tx = self.add_proof("Treasury Ops", "Treasury Rebalance Execution")
                self.emit_log('Treasury Ops', f"Yield harvested. Treasury updated. Hash: {tx}")
                self.update_metrics()
            
            self.update_agent('dropship_001', 'Syncing with Oracle data...', 'COMMUNICATING')
            time.sleep(random.uniform(2, 4))

    def run_market_agent(self):
        while True:
            self.update_agent('trader_001', 'Tracking ETH volatility...', 'MONITORING')
            time.sleep(random.uniform(4, 8))
            
            self.update_agent('trader_001', 'Analyzing whale governance wallets...', 'ANALYZING')
            time.sleep(random.uniform(3, 6))
            
            if random.random() > 0.8:
                self.update_agent('trader_001', 'Broadcasting market sentiment...', 'COMMUNICATING')
                self.emit_log('Market Intel', "Whale wallet accumulated governance tokens.")
                self.add_proof("Market Intel", "Whale Wallet Analysis")
                time.sleep(3)

    def run_strategy_agent(self):
        while True:
            self.update_agent('strategist', 'Predicting voting outcomes...', 'ANALYZING')
            time.sleep(random.uniform(6, 10))
            
            self.update_agent('strategist', 'Calculating quorum probability...', 'EXECUTING')
            time.sleep(random.uniform(4, 7))
            
            self.update_agent('strategist', 'Generating recommendation...', 'COMMUNICATING')
            if random.random() > 0.7:
                self.add_proof("DAO Strategy", "Quorum Prediction Metric")
            time.sleep(random.uniform(3, 6))

    def run_proposal_agent(self):
        while True:
            time.sleep(random.uniform(20, 40))
            self.active_proposals += 1
            self.update_metrics()
            self.emit_log('SYSTEM', "ProposalCreated event emitted on-chain.")
            
            self.update_agent('evaluator', 'Analyzing new proposal...', 'ANALYZING')
            time.sleep(3)
            self.emit_log('Proposal Analysis', "Proposal parameters extracted and simulated.")
            self.add_proof("Proposal Analysis", "Simulation Validation")
            
            self.update_agent('verifier', 'Verifying execution payload...', 'EXECUTING')
            time.sleep(3)
            tx = self.add_proof("Governance Val.", "Payload Integrity Check")
            self.emit_log('Governance Val.', f"Execution simulated safely. Ref: {tx}")
            
            self.update_agent('strategist', 'Reviewing impact...', 'COMMUNICATING')
            time.sleep(2)
            self.emit_log('DAO Strategy', "Consensus Reached: Recommendation is APPROVAL.")
            
            self.active_proposals -= 1
            self.last_action = "Proposal Queued for Voting"
            self.update_metrics()
            
            self.update_agent('evaluator', 'Awaiting proposals...', 'IDLE')
            self.update_agent('verifier', 'Standing by...', 'IDLE')

    def _start_system_events(self):
        def system_loop():
            while True:
                time.sleep(60)
                self.socketio.emit('ai_proofs', self.proofs)
        threading.Thread(target=system_loop, daemon=True).start()

    def handle_user_command(self, data):
        command = data.get('command', '')
        self.emit_log('USER', f"{command}")
        
        cmd_lower = command.lower()
        if "/create proposal" in cmd_lower:
            self.active_proposals += 1
            self.update_metrics()
            self.emit_log('SYSTEM', "Manual proposal creation initiated. Broadcasting event.")
            self.update_agent('evaluator', 'Ingesting manual proposal...', 'ANALYZING')
        elif "/vote" in cmd_lower:
            self.update_agent('verifier', 'Validating vote signature...', 'EXECUTING')
            tx = self.add_proof("Governance Val.", "Vote Signature Verification")
            self.emit_log('Governance Val.', f"Vote cast successfully. Ref: {tx}")
        elif "/scan" in cmd_lower or "/monitor security" in cmd_lower:
            self.update_agent('researcher', 'Executing targeted security scan...', 'ALERT')
            self.emit_log('Security Intel', "Targeted network scan initiated.")
        elif "/check treasury" in cmd_lower:
            self.update_agent('dropship_001', 'Generating treasury report...', 'ANALYZING')
            self.add_proof("Treasury Ops", "Manual Treasury Audit")
        elif "/analyze whale" in cmd_lower:
            self.update_agent('trader_001', 'Scanning top token holders...', 'ANALYZING')
            self.emit_log('Market Intel', "Compiling whale activity report...")
        elif "/execute proposal" in cmd_lower:
            self.update_agent('verifier', 'Broadcasting execute transaction...', 'EXECUTING')
            tx = self.add_proof("Governance Val.", "Proposal Execution", "SUCCESS")
            self.last_action = "Manual Proposal Executed"
            self.update_metrics()
            self.emit_log('SYSTEM', f"Proposal executed on-chain. Hash: {tx}")
        else:
            self.update_agent('strategist', 'Processing unknown directive...', 'COMMUNICATING')
            self.emit_log('SYSTEM', "Command parsed. AI Network adapting...")
