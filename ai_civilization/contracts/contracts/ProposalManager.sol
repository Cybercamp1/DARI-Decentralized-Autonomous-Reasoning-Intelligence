// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProposalManager {
    struct Proposal {
        uint256 id;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        uint256 endTime;
        address creator;
    }

    uint256 public nextProposalId;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 id, string description, address creator);
    event VoteCast(uint256 id, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 id);

    function createProposal(string memory description) external {
        uint256 id = nextProposalId++;
        proposals[id] = Proposal({
            id: id,
            description: description,
            yesVotes: 0,
            noVotes: 0,
            executed: false,
            endTime: block.timestamp + 3 days,
            creator: msg.sender
        });
        emit ProposalCreated(id, description, msg.sender);
    }

    function vote(uint256 id, bool support) external {
        Proposal storage p = proposals[id];
        require(block.timestamp < p.endTime, "Voting ended");
        require(!hasVoted[id][msg.sender], "Already voted");

        hasVoted[id][msg.sender] = true;
        uint256 weight = 100; // Simulated weight

        if (support) {
            p.yesVotes += weight;
        } else {
            p.noVotes += weight;
        }

        emit VoteCast(id, msg.sender, support, weight);
    }

    function executeProposal(uint256 id) external {
        Proposal storage p = proposals[id];
        require(block.timestamp >= p.endTime || p.yesVotes > 500, "Cannot execute yet");
        require(!p.executed, "Already executed");

        p.executed = true;
        emit ProposalExecuted(id);
    }
}
