import React, { useEffect } from 'react'
import Lottie from 'react-lottie-player'
import wave from '../Assets/lotties/wave-lottie.json'
import nodes from '../Assets/lotties/total-nodes.json'
import rewards from '../Assets/lotties/rewards.json'
import Multicall from '@dopex-io/web3-multicall';
import Web3 from 'web3'
import { getProvider } from '../utils/ProviderHelper'
import { addressList } from '../utils/addresses'
import NodeManagerContract from '../contracts/NodeManager.json'
import { Container } from 'react-bootstrap';
import { toast } from 'react-toastify';

const appEnv = process.env.REACT_APP_ENV === 'live' ? 'bsc' : 'bscTestnet';
const id = appEnv === 'live' ? 56 : 97;

export default function Banner({
    userId,
    reload,
    nodesData,
    setNodeData,
    networkId,
    claimableReward,
    setClaimableReward,
    setOwner,
    setLoading,
    setMsg,
    setTask,
    walletNetwork
}) {
    let IntervI;
    useEffect(() => {
        const init = async () => {
            try {
                if (walletNetwork === 0) {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else {
                    const curretProvider = await getProvider(walletNetwork);
                    // setChainId(curretProvider.chainId);
                    const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    // const userAccout = await web3.eth.getAccounts();
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const multicall = new Multicall({
                        multicallAddress: addressList.Multicall[networkId ? networkId : id],
                        provider: curretProvider,
                    });
                    const req = await multicall.aggregate([
                        NodeManager.methods.countTotal(),
                        NodeManager.methods.claimable(userId),
                        NodeManager.methods.countOfTier('bronze'),
                        NodeManager.methods.countOfTier('silver'),
                        NodeManager.methods.countOfTier('gold'),
                        NodeManager.methods.countOfNodes(userId, 'bronze'),
                        NodeManager.methods.countOfNodes(userId, 'silver'),
                        NodeManager.methods.countOfNodes(userId, 'gold'),
                        NodeManager.methods.owner(),
                    ]);
                    setNodeData(req);
                    setClaimableReward(Web3.utils.fromWei(req[1], 'ether'));
                    setOwner(req[8]);
                }
            } catch (e) {
                console.log(e.message);
                // setWallet(false);
            }
        }
        if (userId !== null) {
            init();
        } else {
            setNodeData(null);
        }

        // eslint-disable-next-line
    }, [userId, reload]);

    const claimReward = async () => {
        if (userId) {
            try {
                if (walletNetwork === 0) {
                    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
                } else {
                    const curretProvider = await getProvider(walletNetwork);
                    setLoading(true);
                    setTask("Claiming Reward")
                    setMsg(walletNetwork === 2 ? `Wating form WalletConnect Provider to confirm!` : "Wating from Metamask to confirm!");
                    const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const req = await NodeManager.methods.claim().estimateGas({ from: userId });
                    if (req) {
                        const tx = await NodeManager.methods.claim().send({ from: userId });
                        console.log(tx);
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
    useEffect(() => {

        const fetchClaimableReward = async () => {
            if (userId) {
                if (walletNetwork > 0) {
                    const curretProvider = await getProvider(walletNetwork);
                    const web3 = new Web3(curretProvider || process.env.REACT_APP_TESTNET_RPC_URL);
                    const NodeManager = new web3.eth.Contract(NodeManagerContract.abi, addressList.NodeManager[networkId ? networkId : id]);
                    const req = await NodeManager.methods.claimable(userId).call({ from: userId });
                    // console.log("User Reward: ",req);
                    setClaimableReward(Web3.utils.fromWei(req, "ether"));
                } else {
                    setClaimableReward(0);
                }
            }
        }
        // eslint-disable-next-line
        IntervI = setInterval(fetchClaimableReward, 15000);

    }, [IntervI, claimableReward]);


    return (
        <div className="banner">

            <Container className="custom-container">
                <div className="row">
                    <div className="col-12">
                        <div className="lottie-wave">
                            <Lottie
                                loop
                                animationData={wave}
                                play
                                speed="0.8"
                            // style={{ width: 40, height: 40 }}
                            />
                            {/* <lottie-player src="https://assets1.lottiefiles.com/packages/lf20_m3entfcy.json"
                                background="transparent" speed="0.5" loop autoplay></lottie-player> */}
                        </div>
                        <div className="banner-top text-center">
                            <h1>Welcome to Alora</h1>
                            <p>You can use this app to create Alora Kingdoms, <span className="yellow">view, claim and
                                compound rewards.</span></p>
                        </div>
                        <div className="hexagone-wrapper">
                            <div className="hexagone-parent text-center">
                                <div className="hexagone">
                                    <div className="my-node ">
                                        <img className="img-fluid" src="./images/my-nodes.png" alt="My nodes Img" />
                                    </div>
                                </div>
                                <div className="list">
                                    <ul>
                                        <li>
                                            <span className="label">My Kingdoms: </span>
                                            <span className="value">{nodesData ?
                                                parseInt(nodesData[5]) + parseInt(nodesData[6]) + parseInt(nodesData[7])
                                                : 0} / 130</span>
                                        </li>
                                        <li>
                                            <span className="label">Bronze: </span>
                                            <span className="value">{nodesData ? nodesData[5] : 0} / 100</span>
                                        </li>
                                        <li>
                                            <span className="label">Silver: </span>
                                            <span className="value">{nodesData ? nodesData[6] : 0} / 20</span>
                                        </li>
                                        <li>
                                            <span className="label">Gold: </span>
                                            <span className="value">{nodesData ? nodesData[7] : 0} / 10</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="hexagone-parent text-center">
                                <div className="hexagone">
                                    <div className="total-nonde ">
                                        <Lottie
                                            loop
                                            animationData={nodes}
                                            play
                                        />
                                        {/* <lottie-player
                                            src="https://assets4.lottiefiles.com/packages/lf20_slytwtf8.json"
                                            background="transparent" speed="0.5" loop autoplay></lottie-player> */}
                                    </div>
                                </div>
                                <div className="list">
                                    <ul>
                                        <li>
                                            <span className="label">Total Kingdoms: </span>
                                            <span className="value"> {nodesData ? nodesData[0] : 0}</span>
                                        </li>
                                        <li>
                                            <span className="label">Bronze:  </span>
                                            <span className="value">{nodesData ? nodesData[2] : 0}</span>
                                        </li>
                                        <li>
                                            <span className="label">Silver:  </span>
                                            <span className="value">{nodesData ? nodesData[3] : 0}</span>
                                        </li>
                                        <li>
                                            <span className="label">Gold: </span>
                                            <span className="value">{nodesData ? nodesData[4] : 0}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="hexagone-parent text-center">
                                <div className="hexagone">
                                    <div className="lottie-reward ">
                                        <Lottie
                                            loop
                                            animationData={rewards}
                                            play
                                        />
                                        {/* <lottie-player
                                            src="https://assets9.lottiefiles.com/packages/lf20_iehc3ou4.json"
                                            background="transparent" speed="0.5" loop autoplay></lottie-player> */}
                                    </div>
                                </div>
                                <div className="list">
                                    <ul>
                                        <li>
                                            <span className="label">Rewards:  </span>
                                            <span className="value">
                                                {/* {Web3.utils.fromWei(nodesData ? nodesData[1]: '0', 'ether')} */}
                                                {userId && claimableReward ? parseFloat(claimableReward).toFixed(8) : '0'}
                                            </span>
                                        </li>
                                    </ul>
                                    {
                                        nodesData && nodesData[1] > 0 ?
                                            <div className="action-btns">
                                                <button className="btn btn-brown"
                                                    onClick={() => claimReward()}
                                                >Claim Rewards</button>
                                            </div>
                                            : ''
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
