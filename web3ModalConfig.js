import WalletConnectProvider from "@walletconnect/web3-provider";

export const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        1: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
        5: "https://goerli.infura.io/v3/YOUR_INFURA_KEY"
      }
    }
  },
  // Add other providers like Coinbase, Fortmatic, etc.
};