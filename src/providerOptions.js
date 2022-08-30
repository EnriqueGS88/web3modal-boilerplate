import WalletConnect from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import EthereumProvider from "ethereum-provider";
// require('dotenv').config();

export const providerOptions = {
    walletlink: {
        package: CoinbaseWalletSDK, // required
        options: {
            appName: "Web 3 Modal Example", // required
            infuraId: process.env.REACT_APP_INFURA_ID
        }
    },
    walletconnect: {
        package: WalletConnect, // required
        options: {
            infuraId: process.env.REACT_APP_INFURA_ID
        }
    },
    frame: {
        package: EthereumProvider // required
      }
}
