// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Treasury {
    uint256 public balance;
    address public owner;

    event TreasuryFunded(uint256 amount);
    event TreasuryWithdrawn(uint256 amount, address to);

    constructor() payable {
        owner = msg.sender;
        balance = msg.value;
    }

    receive() external payable {
        balance += msg.value;
        emit TreasuryFunded(msg.value);
    }

    function withdraw(uint256 amount, address to) external {
        require(msg.sender == owner, "Only owner can withdraw");
        require(balance >= amount, "Insufficient balance");
        balance -= amount;
        payable(to).transfer(amount);
        emit TreasuryWithdrawn(amount, to);
    }
}
