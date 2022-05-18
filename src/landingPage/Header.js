import React, { useState, useEffect } from 'react'
import { Navbar, Container, Nav } from 'react-bootstrap';
import Lottie from 'react-lottie-player'
import connect from '../Assets/lotties/connect-lottie.json';
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from 'web3';
import { getProvider } from '../utils/ProviderHelper'
const appEnv = process.env.REACT_APP_ENV === 'live' ? 'bsc' : 'bscTestnet';

const chain = appEnv === 'live' ? 56 : 97;


export default function Header({ setUserId, userId, setNetworkId, setLoading, setMsg, setWalletNetwork, wallet, setWallet, walletNetwork }) {

    const [account, setAccount] = useState(null);
    // eslint-disable-next-line
    const [chainId, setChainId] = useState('');
    const [disconnect, setDisconnect] = useState(false);
    const [networkName, setNetworkName] = useState('');


    const networks = {
        bscTestnet: {
            chainId: `0x${Number(97).toString(16)}`,
            chainName: "Binance Smart Chain Testnet",
            nativeCurrency: {
                name: "Binance Chain Native Token",
                symbol: "BNB",
                decimals: 18
            },
            rpcUrls: [
                "https://data-seed-prebsc-1-s1.binance.org:8545",
                "https://data-seed-prebsc-2-s1.binance.org:8545",
                "https://data-seed-prebsc-1-s2.binance.org:8545",
                "https://data-seed-prebsc-2-s2.binance.org:8545",
                "https://data-seed-prebsc-1-s3.binance.org:8545",
                "https://data-seed-prebsc-2-s3.binance.org:8545"
            ],
            blockExplorerUrls: ["https://testnet.bscscan.com/"]
        },
        bsc: {
            chainId: `0x${Number(56).toString(16)}`,
            chainName: "Binance Smart Chain Mainnet",
            nativeCurrency: {
                name: "Binance Chain Native Token",
                symbol: "BNB",
                decimals: 18
            },
            rpcUrls: [
                "https://bsc-dataseed1.binance.org",
                "https://bsc-dataseed2.binance.org",
                "https://bsc-dataseed3.binance.org",
                "https://bsc-dataseed4.binance.org",
                "https://bsc-dataseed1.defibit.io",
                "https://bsc-dataseed2.defibit.io",
                "https://bsc-dataseed3.defibit.io",
                "https://bsc-dataseed4.defibit.io",
                "https://bsc-dataseed1.ninicoin.io",
                "https://bsc-dataseed2.ninicoin.io",
                "https://bsc-dataseed3.ninicoin.io",
                "https://bsc-dataseed4.ninicoin.io",
                "wss://bsc-ws-node.nariox.org"
            ],
            blockExplorerUrls: ["https://bscscan.com"]
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("chainChanged", networkChanged);

            return () => {
                window.ethereum.removeListener("chainChanged", networkChanged);
            };
        }
        // eslint-disable-next-line
    }, []);
    function isNumber(x) {
        return parseFloat(x) === x
      };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setUserId(accounts[0]);
                    localStorage.setItem("userAddress", accounts[0]);
                    setWallet(false);
                }
            });

            return () => {
                window.ethereum.removeListener("accountsChanged", (accounts) => {
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                        setUserId(accounts[0]);
                        localStorage.setItem("userAddress", accounts[0]);
                        setWallet(false);
                    }
                });
            };
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const mm = localStorage.getItem('userAddress');
        const wc = localStorage.getItem('walletconnect');
        if (wc) {
            setWalletNetwork(2);
        } else if (mm) {
            setWalletNetwork(1);
        }

        const walletConnected = async () => {
            if (mm) {
                setLoading(true);
                setMsg("Connecting with Metamask")
                const currentProvider = await getProvider(1)
                const web3 = new Web3(currentProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                // let tempId = parseInt(currentProvider.chainId, 16);
                let tempId = await web3.eth.getChainId();
                console.log("Metamask Chain ID on load: ", tempId);
                const userAccout = await web3.eth.getAccounts();
                if (mm !== userAccout[0]) {
                    localStorage.setItem('userAddress', userAccout[0]);
                }
                setAccount(userAccout[0]);
                setUserId(userAccout[0]);
                setWallet(false);
                networkChanged(tempId);
                setNetworkId(tempId);
                // if (tempId !== chain) {
                //     alert("Connected to wrong network!");
                //     handleNetworkSwitch(appEnv);
                // }
                setLoading(false);
                setMsg("");
            } else if (wc) {
                setLoading(true);
                setMsg("Connecting with Wallet Connect Provider")
                const currentProvider = await getProvider(2)
                const web3 = new Web3(currentProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                let tempId = await web3.eth.getChainId()
                setChainId(tempId);
                console.log("WalletConnect Chain ID: ", tempId);
                const userAccout = await web3.eth.getAccounts();
                if (wc.accounts[0] !== userAccout[0]) {
                    localStorage.setItem('userAddress', userAccout[0]);
                }
                setAccount(userAccout[0]);
                setUserId(userAccout[0]);
                setWallet(false);
                networkChanged(tempId);
                setNetworkId(tempId);
                // if (tempId !== chain) {
                //     alert("Connected to wrong network!");
                //     handleNetworkSwitch(appEnv);
                // }
                setLoading(false);
                setMsg("");
            }

        }
        if (mm || wc) {
            walletConnected()
        }
        // eslint-disable-next-line
    }, []);

    const networkChanged = (chainId) => {
        let tempChainID;
        if(isNumber(chainId)){
            tempChainID = chainId;
        }else {
            tempChainID = parseInt(chainId,16);
        }
        if (tempChainID === 97) {
            setNetworkName("Bsc Testnet");
            setNetworkId(97)
        } else if (tempChainID === 56) {
            setNetworkName('Bsc Mainnet');
            setNetworkId(56)
        } else {
            setNetworkName("Wrong Network");
        }
    };

    const handleConnect = async (type) => {
        if (type === "mm") {
            try {
                if (!window.ethereum) {
                    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else if (window.ethereum) {
                    setLoading(true);
                    setMsg("Connecting with Metamask")
                    const currentProvider = window.ethereum;
                    setChainId(parseInt(currentProvider.chainId,16));
                    await currentProvider.request({ method: 'eth_requestAccounts' })
                    const web3 = new Web3(currentProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    const userAccout = await web3.eth.getAccounts();
                    setAccount(userAccout[0]);
                    setUserId(userAccout[0]);
                    localStorage.setItem("userAddress", userAccout[0]);
                    setWallet(false);
                    setWalletNetwork(1)
                    networkChanged(parseInt(currentProvider.chainId, 16));
                    setNetworkId(parseInt(currentProvider.chainId, 16));
                    // if (parseInt(currentProvider.chainId, 16) !== 97) {
                    //     // alert("Connected to wrong network!");
                    //     // handleNetworkSwitch(appEnv);
                    // } else if (window.web3) {
                        window.web3 = new Web3(window.web3.currentProvider)
                        window.loaded_web3 = true
                    // }
                    setLoading(false);
                    setMsg('');
                }
            } catch (e) {
                setLoading(false);
                setMsg('');
                console.log(e.message);
                setWallet(false);
            }
        } else if (type === "wc") {
            try {
                const currentProvider = new WalletConnectProvider({
                    rpc: {
                        97: "https://data-seed-prebsc-1-s1.binance.org:8545/",
                        56: "https://bsc-dataseed1.binance.org"
                    }
                });

                await currentProvider.enable();;
                const web3 = new Web3(currentProvider);
                // const accounts = await web3.eth.getAccounts();
                const userAccout = await web3.eth.getAccounts();
                let tempId = await web3.eth.getChainId();
                setAccount(userAccout[0]);
                setUserId(userAccout[0]);
                localStorage.setItem("userAddress", userAccout[0]);
                setWallet(false);
                setChainId(tempId);
                networkChanged(tempId);
                setNetworkId(tempId);
                setWalletNetwork(2);
                // if (tempId !== 97) {
                    // alert("Connected to wrong network!");
                    // handleNetworkSwitch(appEnv);
                // } else if (window.web3) {
                    window.web3 = new Web3(window.web3.currentProvider)
                    window.loaded_web3 = true
                // }
                setLoading(false);
                setMsg('');
            } catch (e) {
                setLoading(false);
                setMsg('');
                console.log(e.message);
                setWallet(false);
            }

        }

    }

    const connectWallet = () => {
        if (wallet && account && disconnect) {
            setDisconnect(false);
            setWallet(false);
        } else
            if (!wallet && !account) {
                setWallet(true);
            } else if (account) {
                setWallet(true);
                setDisconnect(true)
            } else if (wallet && !account) {
                setWallet(false);
            }

    }

    const handleDisconnect = () => {
        if (userId) {
            alert("Are you sure want to disconnect!");
            setAccount(null);
            setWallet(false);
            setChainId('');
            setNetworkName('');
            setUserId(null);
            localStorage.removeItem("userAddress");
            localStorage.removeItem("walletconnect")
        } else {
            setAccount(null);
            setWallet(false);
            setChainId('');
            setNetworkName('');
            setUserId(null);
        }
    }
    const handleNetworkSwitch = async (networkName) => {
        await changeNetwork({ networkName });
    };

    const changeNetwork = async ({ networkName }) => {
        try {
            setLoading(true);
            setMsg(`Switching Metamask to ${networkName}`);
            if (!window.ethereum) throw new Error("No crypto wallet found");
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                    {
                        ...networks[networkName]
                    }
                ]
            });
            setLoading(false);
            setMsg('');
        } catch (err) {
            setLoading(false);
            setMsg('');
            console.error("Error", err);
        }
    };


    return (
        <header>
            <Container className="custom-container">
                <div className="row">
                    <div className="col-lg-12">
                        <Navbar expand="lg" className='p-0'>
                            <Container className='p-0'>
                                <Navbar.Brand href="#home" className='p-0'>
                                    <strong>
                                        <a className="navbar-brand d-inline-block" href="/">
                                            <img className="img-fluid" src="./images/logo.png" alt="logo" />
                                        </a>
                                    </strong>
                                </Navbar.Brand>
                                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                                <Navbar.Collapse id="basic-navbar-nav">
                                    <Nav>
                                        <Nav.Link href="/">
                                            Home
                                            <div className="nav-img">
                                                <img className="img-fluid" src="./images/nav-link-img.png" alt="nav 1" />
                                            </div>
                                        </Nav.Link>
                                        <Nav.Link  href='/whitelist' >
                                            Whitelist
                                            <div className="nav-img">
                                                <img className="img-fluid" src="./images/nav-link-img.png" alt="nav 3" />
                                            </div>
                                        </Nav.Link>
                                        <Nav.Link href="https://aloragithub.gitbook.io/aloramoney" target="_blank">
                                            Whitepaper
                                            <div className="nav-img">
                                                <img className="img-fluid" src="./images/nav-link-img.png" alt="nav 3" />
                                            </div>
                                        </Nav.Link>
                                        <Nav.Link href="/">
                                            Chart
                                            <div className="nav-img">
                                                <img className="img-fluid" src="./images/nav-link-img.png" alt="nav 3" />
                                            </div>
                                        </Nav.Link>
                                        <Nav.Link href="/">
                                            Buy
                                            <div className="nav-img">
                                                <img className="img-fluid" src="./images/nav-link-img.png" alt="nav 4" />
                                            </div>
                                        </Nav.Link>
                                        <Nav.Link className='connect p-0'>
                                            <button className="btn" onClick={() => connectWallet()} >
                                                <Lottie
                                                    loop
                                                    animationData={connect}
                                                    play
                                                />
                                                {!account ? 'Connect' : 'Connected'}
                                                <br />
                                                {account ? networkName : ''}
                                            </button>
                                            {wallet && !account && <div className='connect-to-alora'>
                                                <h5>Connect to Alora App</h5>
                                                <p>Please select a wallet to authenticate with $Alora.</p>
                                                <button className='metamask-btn' onClick={() => handleConnect('mm')}>
                                                    <img src='./images/metamask-logo.png' alt="metamask" />
                                                    Metamask
                                                </button>
                                                <button className='metamask-btn' onClick={() => handleConnect('wc')}>
                                                    <img src='./images/wallet-connect.svg' alt="WallectConnect" />
                                                    WallectConnect
                                                </button>
                                                <button className='metamask-btn' onClick={() => connectWallet()}>
                                                    Close
                                                </button>
                                                <p className='mb-0'><a className='yellow' href='/'>What is a wallet?</a></p>
                                            </div>}
                                            {wallet && account && disconnect &&
                                                <div className='connect-to-alora'>
                                                    <h5>Disconnect</h5>
                                                    <p>{account.replace(account.substring(10, 32), ".................")}</p>
                                                    <button className='metamask-btn' onClick={() => handleDisconnect()}>
                                                        <img src={`./images/${walletNetwork !== 2 ? 'metamask-logo.png' : 'wallet-connect.svg'}`} alt="metamask" />
                                                        Disconnect Wallet
                                                    </button>
                                                    <button className='metamask-btn' onClick={() => connectWallet()}>
                                                        Close
                                                    </button>
                                                    {/*  <p className='mb-0'><a className='yellow' href='/'>What is a wallet?</a></p>
                                            */}
                                                </div>}

                                        </Nav.Link>
                                    </Nav>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>

                    </div>
                </div>
            </Container>
        </header>
    )
}
