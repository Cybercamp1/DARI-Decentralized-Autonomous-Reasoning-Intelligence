// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DariTreasury
 * @dev Secure treasury for DariDAO autonomous operations.
 */
contract DariTreasury is Ownable {
    event FundsDeposited(address indexed from, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {}

    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        to.transfer(amount);
        emit FundsWithdrawn(to, amount);
    }

    function withdrawERC20(address token, address to, uint256 amount) external onlyOwner {
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient ERC20 balance");
        IERC20(token).transfer(to, amount);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
