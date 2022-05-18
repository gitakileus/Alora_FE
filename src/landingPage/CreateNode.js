import React, { useState, useEffect } from 'react'
// import { Tab } from 'bootstrap'
import { Col, Row, Container, Table } from 'react-bootstrap'
import Web3 from 'web3';
import AloraNodeContract from '../contracts/AloraNode.json';
import { addressList } from '../utils/addresses';
import { toast } from 'react-toastify';
import config from '../utils/tiers.json';
import { getProvider } from '../utils/ProviderHelper'
import Multicall from '@dopex-io/web3-multicall';
import NodeManagerContract from '../contracts/NodeManager.json';
// const appEnv = process.env.REACT_APP_ENV === 'live'? 'bsc' : 'bscTestnet';
const id = process.env.REACT_APP_ENV === 'live' ? 56 : 97;

export default function CreateNode({ userId, setReload, networkId, nodesData, loading, setLoading, owner, setMsg, setTask, walletNetwork }) {

    const [active, setActive] = useState(false);
    const [tire, setTire] = useState(-1);
    const [userBalance, setUserBalance] = useState(null);
    const [noOfNodes, setNoOfNodes] = useState(null);
    const [userAllownce, setUserAllownce] = useState(null);
    const [activeTransfer, setActivetransfer] = useState(false);
    const [tiersData, setTiersData] = useState(null);
    const [transferNode, setTransferNode] = useState(false);
    const [transferNodeOwner, setTransferNodeOwner] = useState(false);
    const [getUserInfo, setGetUserInfo] = useState(false);
    const amount = '115792089237316195423570985008687907853269984665640564039457';
    const [transferAddress, setTransferAddress] = useState('');
    const [transferAddressByOwner, setTransferAddressByOwner] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [upgradeNoOfNodes, setUpgradeNoOfNodes] = useState(0);
    const [userNodes, setUserNodes] = useState(null);





    const boxSelected = (e) => {
        setActive(true);
        setTire(e);
    }

    useEffect(() => {
        const initTiers = async () => {
            try {
                if (walletNetwork === 0) {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else {
                    const curretProvider = await getProvider(walletNetwork);
                    const web3 = new Web3(process.env.REACT_APP_TESTNET_RPC_URL);
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const multicall = new Multicall({
                        multicallAddress: addressList.Multicall[networkId ? networkId : id],
                        provider: curretProvider,
                    });
                    let alltiers = [];
                    for (let i = 0; i < config.tiers.length; i++) {
                        alltiers.push(NodeManager.methods.tierInfo(config.tiers[i]));
                    }
                    const req = await multicall.aggregate(alltiers);
                    setTiersData(req);
                }
            } catch (e) {
                console.log(e.message);
            }
        }

        const init = async () => {
            try {
                if (walletNetwork === 0) {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else {
                    const curretProvider = await getProvider(walletNetwork);
                    const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    const userAccout = await web3.eth.getAccounts();
                    const AloraContract = new web3.eth.Contract(AloraNodeContract.abi, addressList.AloraNode[networkId ? networkId : id]);
                    const allownce = await AloraContract.methods.allowance(userAccout[0], addressList.feeManager[networkId ? networkId : id]).call();
                    const balance = await AloraContract.methods.balanceOf(userAccout[0]).call();
                    setUserAllownce(Web3.utils.fromWei(allownce, 'ether'));
                    setUserBalance(Web3.utils.fromWei(balance, 'ether'));
                }
            } catch (e) {
                console.log(e.message);
            }
        }

        if (userId !== null) {
            init();
            initTiers();
        }
        // eslint-disable-next-line   
    }, [userId]);

    useEffect(() => {
        const initTiers = async () => {
            try {
                if (walletNetwork === 0) {
                    setLoading(true);
                    setMsg("Loading tiers ...");
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
                    const curretProvider = process.env.REACT_APP_TESTNET_RPC_URL;
                    const web3 = new Web3(curretProvider);
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const multicall = new Multicall({
                        multicallAddress: addressList.Multicall[networkId ? networkId : id],
                        provider: curretProvider,
                    });
                    let alltiers = [];
                    for (let i = 0; i < config.tiers.length; i++) {
                        alltiers.push(NodeManager.methods.tierInfo(config.tiers[i]));
                    }
                    const req = await multicall.aggregate(alltiers);
                    setTiersData(req);
                    setLoading(false);
                    setMsg("");
                } else if (walletNetwork > 0) {
                    setLoading(true);
                    setMsg("Loading tiers ...");
                    const curretProvider = await getProvider(walletNetwork);
                    const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const multicall = new Multicall({
                        multicallAddress: addressList.Multicall[networkId ? networkId : id],
                        provider: curretProvider,
                    });
                    let alltiers = [];
                    for (let i = 0; i < config.tiers.length; i++) {
                        alltiers.push(NodeManager.methods.tierInfo(config.tiers[i]));
                    }
                    const req = await multicall.aggregate(alltiers);
                    setTiersData(req);
                    setLoading(false);
                    setMsg('');

                }
            } catch (e) {
                console.log(e.message);
                setLoading(false);
                setMsg('');
            }
        }
        initTiers();
        // eslint-disable-next-line
    }, []);

    const approveAlora = async () => {
        if (userId) {
            try {
                if (walletNetwork === 0) {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else {
                    const curretProvider = await getProvider(walletNetwork);
                    setLoading(true);
                    setTask("Approving Alora")
                    setMsg(walletNetwork === 2 ? `Wating form WalletConnect Provider to confirm!` : "Wating from Metamask to confirm!");
                    const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    const AloraContract = new web3.eth.Contract(AloraNodeContract.abi, addressList.AloraNode[networkId ? networkId : id]);
                    const req = await AloraContract.methods.approve(addressList.feeManager[networkId ? networkId : id], web3.utils.toWei(amount, 'ether')).estimateGas({ from: userId });
                    if (req) {
                        const tx = await AloraContract.methods.approve(addressList.feeManager[networkId ? networkId : id], web3.utils.toWei(amount, 'ether')).send({ from: userId });
                        if (tx) {
                            console.log(tx);
                            fetchUserBalance(AloraContract);
                            setUserAllownce(web3.utils.toWei(amount, 'ether'));
                            setLoading(false);
                        }
                    }
                    setLoading(false);
                    setMsg("");
                    setTask("");

                }
            } catch (err) {
                console.log(err);
                setLoading(false);
                setMsg("");
                setTask("")
                var errorCustom = JSON.parse(err.message.replace('Internal JSON-RPC error.', '').trim());
                errorCustom = errorCustom.message.replace('execution reverted:', '').trim();
                console.log(errorCustom);
                toast.error(errorCustom, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
    }

    const fetchUserBalance = async (aloraContract) => {
        const balance = await aloraContract.methods.balanceOf(userId).call();
        setUserBalance(Web3.utils.fromWei(balance, 'ether'));
    }

    const updateNoOfNodes = (e) => {
        e.preventDefault();
        setNoOfNodes(parseInt(e.target.value));
        if (parseInt(e.target.value) > 0) {
            setActivetransfer(true);
        } else {
            setActivetransfer(false);
        }
    }

    const triePrice = (tire_no) => {
        if (tiersData) {
            let selectedTier = tiersData[tire_no];
            let tierPrice = Web3.utils.fromWei(selectedTier[1], 'ether');
            return parseInt(tierPrice)
        }
    }
    const maxPurchase = (tire_no) => {
        if (tiersData) {
            let selectedTier = tiersData[tire_no];
            let max = selectedTier[5];;
            return max;
        }
    }

    const handelCreateNode = async () => {
        if (tire < 0) {
            toast.warn('Please select your tier first', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (noOfNodes < 1) {
            toast.warn('Please enter the number of Kingdoms', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (noOfNodes > maxPurchase(tire)) {
            toast.warn(`Not allowed to create nodes more than ${maxPurchase(tire)}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            const requiredToken = noOfNodes * triePrice(tire);
            if (userBalance < requiredToken) {
                toast.warn('Do not have enough $ALORA to create node!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                try {
                    if (walletNetwork === 0) {
                        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                    } else {
                        const curretProvider = await getProvider(walletNetwork);
                        setLoading(true);
                        setTask("Creating Tier")
                        setMsg(walletNetwork === 2 ? `Wating form WalletConnect Provider to confirm!` : "Wating from Metamask to confirm!");
                        const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                        const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                        const s_tier = tiersData[tire];
                        const req = await NodeManager.methods.create(s_tier[0], '', noOfNodes).estimateGas({ from: userId });
                        if (req) {
                            const tx = await NodeManager.methods.create(s_tier[0], '', noOfNodes).send({ from: userId });
                            console.log(tx);
                            setReload(true);
                        }
                        setLoading(false);
                        setMsg('');
                        setTask('')
                    }
                } catch (err) {
                    setLoading(false);
                    setMsg('');
                    setTask('')
                    var errorCustom = JSON.parse(err.message.replace('Internal JSON-RPC error.', '').trim());
                    errorCustom = errorCustom.message.replace('execution reverted:', '').trim();
                    console.log(errorCustom);
                    toast.error(errorCustom, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                }
            }
        }

    }

    const handelCompondNode = async () => {
        if (tire < 0) {
            toast.warn('Please select your tier first', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (noOfNodes < 1) {
            toast.warn('Please enter the number of Kingdoms', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (noOfNodes > getUserTierBalance(tire)) {
            toast.warn('Do not have enough number of Kingdoms to compound!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            try {
                if (walletNetwork === 0) {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else {
                    const curretProvider = await getProvider(walletNetwork);
                    setLoading(true);
                    setTask("Compounding Tiers")
                    setMsg(walletNetwork === 2 ? `Wating form WalletConnect Provider to confirm!` : "Wating from Metamask to confirm!");
                    const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const s_tier = tiersData[tire];
                    const req = await NodeManager.methods.compound(s_tier[0], '', noOfNodes).estimateGas({ from: userId });
                    if (req) {
                        const tx = await NodeManager.methods.compound(s_tier[0], '', noOfNodes).send({ from: userId });
                        console.log(tx);
                        setReload(true);
                    }
                    setLoading(false);
                    setMsg('');
                    setTask('')

                }
            } catch (err) {
                setLoading(false);
                setMsg('');
                setTask('')
                var errorCustom = JSON.parse(err.message.replace('Internal JSON-RPC error.', '').trim());
                errorCustom = errorCustom.message.replace('execution reverted:', '').trim();
                console.log(errorCustom);
                toast.error(errorCustom, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
    }

    const handleTransfer = async () => {
        if (tire < 0) {
            toast.warn('Please select your tier first', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (noOfNodes < 1) {
            toast.warn('Please enter the number of Kingdoms', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (transferAddress === '') {
            toast.warn('Please enter the recivers address', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        else {
            try {
                if (walletNetwork === 0) {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else {
                    const curretProvider = await getProvider(walletNetwork);
                    setLoading(true);
                    setTask("Transfering Nodes")
                    setMsg(walletNetwork === 2 ? `Wating form WalletConnect Provider to confirm!` : "Wating from Metamask to confirm!");
                    const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const s_tier = tiersData[tire];
                    const req = await NodeManager.methods.transfer(s_tier[0], noOfNodes, transferAddress).estimateGas({ from: userId });
                    if (req) {
                        const tx = await NodeManager.methods.transfer(s_tier[0], noOfNodes, transferAddress).send({ from: userId });
                        console.log(tx);
                        setReload(true);
                    }
                    setLoading(false);
                    setMsg('');
                    setTask('')
                }
            } catch (err) {
                setLoading(false);
                setMsg('');
                setTask('')
                var errorCustom = JSON.parse(err.message.replace('Internal JSON-RPC error.', '').trim());
                errorCustom = errorCustom.message.replace('execution reverted:', '').trim();
                console.log(errorCustom);
                toast.error(errorCustom, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
    }
    const capitalize = s => s && s[0].toUpperCase() + s.slice(1);

    const getUserTierBalance = (tierNo) => {
        if (nodesData) {
            if (tierNo === 0) {
                return nodesData[5];
            } else if (tierNo === 1) {
                return nodesData[6]
            } else if (tierNo === 2) {
                return nodesData[7]
            }
        }
    }

    const handleUpgradeNoOfNodes = (e) => {
        e.preventDefault();
        setUpgradeNoOfNodes(e.target.value);
    }

    const handelBronzeToSilver = async () => {
        if (getUserTierBalance(0) < upgradeNoOfNodes * 5) {
            toast.error('Not have enough no of Bronze Kingdom', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            try {
                if (walletNetwork === 0) {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else {
                    const curretProvider = await getProvider(walletNetwork);
                    setLoading(true);
                    setTask("Upgrading Bronze ⇒ Silver")
                    setMsg(walletNetwork === 2 ? `Wating form WalletConnect Provider to confirm!` : "Wating from Metamask to confirm!");
                    const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const req = await NodeManager.methods.upgrade('bronze', 'silver', upgradeNoOfNodes).estimateGas({ from: userId });
                    if (req) {
                        const tx = await NodeManager.methods.upgrade('bronze', 'silver', upgradeNoOfNodes).send({ from: userId });
                        console.log(tx);
                        setReload(true);
                    }
                    setLoading(false);
                    setMsg('');
                    setTask('')
                }
            } catch (err) {
                setLoading(false);
                setMsg('');
                setTask('')
                var errorCustom = JSON.parse(err.message.replace('Internal JSON-RPC error.', '').trim());
                errorCustom = errorCustom.message.replace('execution reverted:', '').trim();
                console.log(errorCustom);
                toast.error(errorCustom, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }

        }
    }

    const handelBronzeToGold = async () => {
        if (getUserTierBalance(0) < upgradeNoOfNodes * 10) {
            toast.error('Not have enough no of Bronze Kingdom', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            try {
                if (walletNetwork === 0) {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else {
                    const curretProvider = await getProvider(walletNetwork);
                    setLoading(true);
                    setTask("Upgrading Bronze ⇒ Gold")
                    setMsg(walletNetwork === 2 ? `Wating form WalletConnect Provider to confirm!` : "Wating from Metamask to confirm!");
                    const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const req = await NodeManager.methods.upgrade('bronze', 'gold', upgradeNoOfNodes).estimateGas({ from: userId });
                    if (req) {
                        const tx = await NodeManager.methods.upgrade('bronze', 'gold', upgradeNoOfNodes).send({ from: userId });
                        console.log(tx);
                        setReload(true);
                    }
                    setLoading(false);
                    setMsg('');
                    setTask('');

                }
            } catch (err) {
                setLoading(false);
                setMsg('');
                setTask('');
                var errorCustom = JSON.parse(err.message.replace('Internal JSON-RPC error.', '').trim());
                errorCustom = errorCustom.message.replace('execution reverted:', '').trim();
                console.log(errorCustom);
                toast.error(errorCustom, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
    }

    const handelSilverToGold = async () => {
        if (getUserTierBalance(1) < upgradeNoOfNodes * 2) {
            toast.error('Not have enough no of Silver Kingdom', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            try {
                if (walletNetwork === 0) {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else {
                    const curretProvider = await getProvider(walletNetwork);
                    setLoading(true);
                    setTask("Upgrading Silver ⇒ Gold");
                    setMsg(walletNetwork === 2 ? `Wating form WalletConnect Provider to confirm!` : "Wating from Metamask to confirm!");
                    const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const req = await NodeManager.methods.upgrade('silver', 'gold', upgradeNoOfNodes).estimateGas({ from: userId });
                    if (req) {
                        const tx = await NodeManager.methods.upgrade('silver', 'gold', upgradeNoOfNodes).send({ from: userId });
                        console.log(tx);
                        setReload(true);
                    }
                    setLoading(false);
                    setMsg('');
                    setTask('');

                }
            } catch (err) {
                setLoading(false);
                setMsg('');
                setTask('');
                var errorCustom = JSON.parse(err.message.replace('Internal JSON-RPC error.', '').trim());
                errorCustom = errorCustom.message.replace('execution reverted:', '').trim();
                console.log(errorCustom);
                toast.error(errorCustom, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
    }

    const handelCreateNodeForUser = async () => {
        if (tire < 0) {
            toast.warn('Please select your tier first', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (noOfNodes < 1) {
            toast.warn('Please enter the number of Kingdoms', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (noOfNodes > maxPurchase(tire)) {
            toast.warn(`Not allowed to create nodes more than ${maxPurchase(tire)}`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (transferAddressByOwner === '') {
            toast.warn('Please enter the address', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            try {
                if (walletNetwork === 0) {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else {
                    const curretProvider = await getProvider(walletNetwork);
                    setLoading(true);
                    setTask(`Creating Nodes for ${transferAddressByOwner}`)
                    setMsg(walletNetwork === 2 ? `Wating form WalletConnect Provider to confirm!` : "Wating from Metamask to confirm!");
                    const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const s_tier = tiersData[tire];
                    const req = await NodeManager.methods.createForUser(s_tier[0], noOfNodes, transferAddressByOwner).estimateGas({ from: userId });
                    if (req) {
                        const tx = await NodeManager.methods.createForUser(s_tier[0], noOfNodes, transferAddressByOwner).send({ from: userId });
                        console.log(tx);
                        setReload(true);
                    }
                    setLoading(false);
                    setMsg('');
                    setTask('');
                }
            } catch (err) {
                setLoading(false);
                setMsg('');
                setTask('');
                var errorCustom = JSON.parse(err.message.replace('Internal JSON-RPC error.', '').trim());
                errorCustom = errorCustom.message.replace('execution reverted:', '').trim();
                console.log(errorCustom);
                toast.error(errorCustom, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
    }

    const handelFetchUserInfo = async () => {
        console.log("Returns the user info");
        console.log("Address to view the user Info: ", userAddress);
        if (!userId) {
            toast.error('Connect your wallet', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else if (!userAddress) {
            toast.error('Please enter the wallet address!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        else {
            try {
                if (walletNetwork === 0) {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else {
                    setLoading(true);
                    setMsg("Fetching teirs ...");
                    const curretProvider = await getProvider(walletNetwork);
                    const web3 = new Web3(curretProvider);
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const multicall = new Multicall({
                        multicallAddress: addressList.Multicall[networkId ? networkId : id],
                        provider: curretProvider,
                    });
                    const req = await multicall.aggregate([
                        NodeManager.methods.countOfNodes(userAddress, 'bronze'),
                        NodeManager.methods.countOfNodes(userAddress, 'silver'),
                        NodeManager.methods.countOfNodes(userAddress, 'gold'),
                        NodeManager.methods.claimable(userAddress),
                    ]);
                    setUserNodes(req);
                    setLoading(false);
                    setMsg('');
                }
            } catch (e) {
                setLoading(false);
                setMsg('');
                console.log(e.message);
            }

        }

    }

    const handelShowCreateNode = () => {
        setTransferNodeOwner(!transferNodeOwner);
        setGetUserInfo(false);
        setTransferNode(false);

    }

    const handelShowUserInfo = () => {
        setGetUserInfo(!getUserInfo);
        setTransferNodeOwner(false);
        setTransferNode(false);
    }

    const handleShowTranfer = () => {
        setTransferNode(!transferNode);
        setTransferNodeOwner(false);
        setGetUserInfo(false);
    }

    return (
        <section className="create-node">
            <Container className="custom-container">
                <div className="row">
                    <div className="col-12">
                        <div className="create-node-wrapper">
                            <div className="rectangle-mb">
                                <div className="text-center">
                                    <div className="node-rectanle">
                                        <h3 className="yellow">Create A Kingdom</h3>
                                    </div>
                                    <p>Choose between the three tiers of Kingdoms below</p>
                                </div>
                                <div className="tiers-list">
                                    <Row>
                                        {
                                            tiersData ? tiersData.map((item, index) => {
                                                return (
                                                    <Col md="6" lg="4" key={index}  >
                                                        <div className={`item ${active && tire === index ? "active" : ""}`}
                                                            id={index}
                                                            onClick={() => boxSelected(index)}
                                                        >
                                                            <div className="image">
                                                                <img src={`/images/${capitalize(item[0])}.svg`} alt="Tier" className="img-fluid" />
                                                            </div>
                                                            <div className="content">
                                                                <h4>{capitalize(item[0])}</h4>
                                                                <p>{Web3.utils.fromWei(item[1], "ether")} Alora per Kingdom</p>
                                                                <p>Earn {Web3.utils.fromWei(item[2], "ether")} Alora per Day</p>
                                                            </div>
                                                            <span className="tick fa fa-check"></span>
                                                        </div>
                                                    </Col>
                                                )
                                            })
                                                : ''
                                        }
                                    </Row>
                                </div>
                            </div>
                            <h4 className="active-tier">Active Tier</h4>
                            <form action="">
                                <div className="nodes-input">
                                    <input
                                        type="text"
                                        placeholder="Number of Kingdoms"
                                        onChange={(e) => updateNoOfNodes(e)}
                                    // disabled={tire<0?true:false}
                                    />
                                </div>
                            </form>

                            <div className="upgrade-nodes-part">
                                <div className="btn-list">
                                    <button
                                        className={`btn btn-brown ${userAllownce <= 0 && userId ? "active" : ''}`}
                                        onClick={() => approveAlora()}
                                        disabled={userAllownce <= 0 && userId ? false : true}
                                    >
                                        {userAllownce > 0 ? "Approved" : 'Approve Contract'}
                                    </button>

                                    <button
                                        className={`btn btn-brown ${userId && userAllownce > 0 ? "active" : ''}`}
                                        onClick={() => handelCreateNode()}
                                        disabled={userId && userAllownce > 0 ? false : true}
                                    >
                                        Create Kingdom
                                    </button>
                                    <button
                                        className={`btn btn-brown ${userId && userAllownce > 0 ? "active" : ''}`}
                                        disabled={userId && userAllownce > 0 ? false : true}
                                        onClick={() => handelCompondNode()}
                                    >
                                        Compound Kingdoms
                                    </button>
                                    <button
                                        className={`btn btn-brown ${noOfNodes <= getUserTierBalance(tire) && activeTransfer && userId ? "active" : ''}`}
                                        disabled={noOfNodes <= getUserTierBalance(tire) && activeTransfer && userId ? false : true}
                                        onClick={() => (handleShowTranfer())}
                                    >Transfer Kingdom</button>
                                    <br />
                                    {/* Admin Part for creating nodes for user */}
                                    {userId === owner &&
                                        <div >
                                            <button
                                                className={`btn btn-brown ${userId ? "active" : ''}`}
                                                onClick={() => (handelShowCreateNode())}
                                                disabled={userId ? false : true}
                                            >
                                                Create Kingdoms for user
                                            </button>

                                            <button
                                                className={`btn btn-brown ${userId ? "active" : ''}`}
                                                onClick={() => handelShowUserInfo()}
                                                disabled={userId ? false : true}
                                            >
                                                Get user Info
                                            </button>
                                        </div>

                                    }
                                    {/* Transfer node address setting */}
                                    {transferNode && !transferNodeOwner && !getUserInfo && <div className="address-wrapper">
                                        <div className="input-wrapper">
                                            <input
                                                type="text"
                                                name="address"
                                                className="form-control"
                                                onChange={(e) => setTransferAddress(e.target.value)}
                                                placeholder="Address "
                                            />
                                        </div>
                                        <div className="action-btns">
                                            <button
                                                className="btn btn-brown active"
                                                onClick={() => handleTransfer()}
                                            >Confirm</button>
                                            <button className="btn btn-brown active" onClick={() => (setTransferNode(!transferNode))}> Cancel</button>
                                        </div>

                                    </div>}
                                    {/* Show hide adress field for create node for user */}
                                    {transferNodeOwner && !getUserInfo && !transferNode && <div className="address-wrapper">
                                        <div className="input-wrapper">
                                            <input
                                                type="text"
                                                name="address"
                                                className="form-control"
                                                onChange={(e) => setTransferAddressByOwner(e.target.value)}
                                                placeholder="Address "
                                            />
                                        </div>
                                        <div className="action-btns">
                                            <button
                                                className="btn btn-brown active"
                                                onClick={() => handelCreateNodeForUser()}
                                            >Create</button>
                                            <button className="btn btn-brown active" onClick={() => setTransferNodeOwner(!transferNodeOwner)}> Cancel</button>
                                        </div>

                                    </div>}

                                    {/* Get user Info address field */}

                                    {getUserInfo && !transferNodeOwner && !transferNode && <div className="address-wrapper">
                                        <div className="input-wrapper">
                                            <input
                                                type="text"
                                                name="address"
                                                className="form-control"
                                                onChange={(e) => setUserAddress(e.target.value)}
                                                placeholder="Address "
                                            />
                                        </div>
                                        <div className="action-btns">
                                            <button
                                                className="btn btn-brown active"
                                                onClick={() => handelFetchUserInfo()}
                                            >Submit</button>
                                            <button className="btn btn-brown active" onClick={() => setGetUserInfo(!getUserInfo)}> Cancel</button>
                                        </div>

                                    </div>}

                                    {userNodes && owner === userId && getUserInfo && <Table>
                                        <thead>
                                            <tr>
                                                <th>Bronze</th>
                                                <th>Silver</th>
                                                <th>Gold</th>
                                                <th>Total Kingdoms</th>
                                                <th>Reward</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                            <tr>
                                                <td>{userNodes ? userNodes[0] : 0}</td>
                                                <td>{userNodes ? userNodes[1] : 0}</td>
                                                <td>{userNodes ? userNodes[2] : 0}</td>
                                                <td>{userNodes ? parseInt(userNodes[0]) + parseInt(userNodes[1]) + parseInt(userNodes[2]) : 0}</td>
                                                <td>{userNodes ? parseFloat(Web3.utils.fromWei(userNodes[3], 'ether')).toFixed(8) : 0}</td>
                                            </tr>
                                        </tbody>

                                    </Table>}
                                    <div className="upgrade-node">
                                        <h4>Upgrade Kingdoms</h4>
                                        <p>In order to upgrade Kingdom tiers, you must possess a quantity of $ALORA
                                            tokens that is equal to or greater than the difference in the tiers
                                            price.</p>
                                        <ul className="">
                                            <li>Bronze to Silver Kingdoms - Costs 5 Bronze Kingdoms</li>
                                            <li>Bronze to Gold Kingdoms - Costs 10 Bronze Kingdoms</li>
                                            <li className="me-0">Silver to Gold Kingdoms - Costs 2 Silver Kingdoms</li>
                                        </ul>
                                        <Row>
                                            <Col lg="4">
                                                <div className="nodes-input">
                                                    <input type="text" placeholder="Number of Kingdoms" onChange={(e) => handleUpgradeNoOfNodes(e)} />
                                                </div>
                                            </Col>
                                            <Col lg="8">
                                                <div className="btn-list">
                                                    <button
                                                        className={`btn btn-brown ${(getUserTierBalance(0) >= upgradeNoOfNodes * 5) && userId && upgradeNoOfNodes ? "active" : ''}`}
                                                        disabled={(getUserTierBalance(0) >= upgradeNoOfNodes * 5) && userId && upgradeNoOfNodes ? false : true}
                                                        onClick={() => handelBronzeToSilver()}
                                                    >Bronze ⇒ Silver</button>
                                                    <button
                                                        className={`btn btn-brown ${(getUserTierBalance(0) >= upgradeNoOfNodes * 10) && userId && upgradeNoOfNodes ? "active" : ''}`}
                                                        disabled={(getUserTierBalance(0) >= upgradeNoOfNodes * 10) && userId && upgradeNoOfNodes ? false : true}
                                                        onClick={() => handelBronzeToGold()}
                                                    >Bronze ⇒ Gold</button>
                                                    <button
                                                        className={`btn btn-brown ${(getUserTierBalance(1) >= upgradeNoOfNodes * 2) && userId && upgradeNoOfNodes ? "active" : ''}`}
                                                        disabled={(getUserTierBalance(1) >= upgradeNoOfNodes * 2) && userId && upgradeNoOfNodes ? false : true}
                                                        onClick={() => handelSilverToGold()}
                                                    >Silver ⇒ Gold</button>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}
