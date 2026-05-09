require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    securechain: {
      url: "https://mainnet-rpc.scai.network",
      chainId: 34,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
    },
    securechain_backup: {
      url: "https://34.rpc.thirdweb.com",
      chainId: 34,
      accounts: [PRIVATE_KEY],
      gasPrice: "auto",
    },
    hardhat: {
      chainId: 1337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
