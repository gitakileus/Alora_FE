import WalletConnectProvider from "@walletconnect/web3-provider";


const provider = new WalletConnectProvider({
    rpc: {
        97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
        56: "https://bsc-dataseed1.binance.org"
    }
});


export const getProvider = async (networkNo) => {
    if (networkNo === 1) {
        const curretProvider = await window.ethereum;
        return curretProvider;
    } else if (networkNo === 2) {
         await provider.enable()
        return provider
    }
}