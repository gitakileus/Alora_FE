import React, { useEffect, useState } from "react";
import { MerkleTree } from "merkletreejs";
import SHA256 from "keccak256";
import { whitelisters } from "../utils/whitelisters";
import Header from "./Header";
import Web3 from "web3";
import { toast } from "react-toastify";
import { addressList } from "../utils/addresses";
import BusdContract from "../contracts/Busd.json";
import AloraNodeContract from "../contracts/AloraNode.json";
import { getProvider } from "../utils/ProviderHelper";

const id = process.env.REACT_APP_ENV === "live" ? 56 : 97;

export default function Whitelist({
  setLoading,
  setMsg,
  userId,
  setUserId,
  walletNetwork,
  setNetworkId,
  setWalletNetwork,
  setTask,
}) {
  const [isWhitelist, setISWhitelist] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [wlProof, setWlProof] = useState(null);
  const [userDeposit, setUserDeposit] = useState(0);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [wallet, setWallet] = useState(false);

  useEffect(() => {
    const leaves = whitelisters.map((x) => SHA256(x));
    const tree = new MerkleTree(leaves, SHA256, { sortPairs: true });
    const root = tree.getRoot().toString("hex");
    const leaf = SHA256(userId);
    const proofForTx = tree.getHexProof(leaf);
    const staus = tree.verify(proofForTx, leaf, root);
    setISWhitelist(staus);
    const checkApproveStatus = async () => {
      try {
        if (walletNetwork === 0) {
          console.log(
            "Non-Ethereum browser detected. You should consider trying MetaMask!"
          );
        } else {
          const curretProvider = await getProvider(walletNetwork);
          const web3 = new Web3(
            curretProvider || process.env.REACT_APP_TESTNET_RPC_URL
          );
          const BUSDContract = new web3.eth.Contract(
            BusdContract.abi,
            addressList.Busd[id]
          );
          const allownce = await BUSDContract.methods
            .allowance(userId, addressList.AloraNode[id])
            .call({ from: userId });
          if (parseInt(allownce) >= 1000) {
            setIsApproved(true);
          }
        }
      } catch (err) {
        console.log(err);
        var errorCustom = JSON.parse(
          err.message.replace("Internal JSON-RPC error.", "").trim()
        );
        errorCustom = errorCustom.message
          .replace("execution reverted:", "")
          .trim();
        console.log(errorCustom);
      }
    };

    if (staus) {
      checkApproveStatus();
      fetchDeposits();
      setWlProof(proofForTx);
    }
    // eslint-disable-next-line
  }, [userId]);

  const fetchDeposits = async () => {
    try {
      if (!walletNetwork === 0) {
        console.log(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      } else {
        const curretProvider = await getProvider(walletNetwork);
        const web3 = new Web3(
          curretProvider || process.env.REACT_APP_TESTNET_RPC_URL
        );
        const AloraNode = new web3.eth.Contract(
          AloraNodeContract.abi,
          addressList.AloraNode[id]
        );
        const totalAmount = await AloraNode.methods
          ._totalDeposit()
          .call({ from: userId });
        const userAmount = await AloraNode.methods
          .depositAmount(userId)
          .call({ from: userId });
        if (totalAmount && userAmount) {
          setTotalDeposit(Web3.utils.fromWei(totalAmount, "ether"));
          setUserDeposit(Web3.utils.fromWei(userAmount, "ether"));
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const approveBusd = async () => {
    if (userId) {
      try {
        if (!walletNetwork === 0) {
          console.log(
            "Non-Ethereum browser detected. You should consider trying MetaMask!"
          );
        } else {
          const curretProvider = await getProvider(walletNetwork);
          setLoading(true);
          setTask("Approving BUSD");
          setMsg(
            walletNetwork === 2
              ? `Wating form WalletConnect Provider to confirm!`
              : "Wating from Metamask to confirm!"
          );
          const web3 = new Web3(
            curretProvider || process.env.REACT_APP_TESTNET_RPC_URL
          );
          const BUSDContract = new web3.eth.Contract(
            BusdContract.abi,
            addressList.Busd[id]
          );
          const req = await BUSDContract.methods
            .approve(
              addressList.AloraNode[id],
              web3.utils.toWei("1000", "ether")
            )
            .estimateGas({ from: userId });
          if (req) {
            const tx = await BUSDContract.methods
              .approve(
                addressList.AloraNode[id],
                web3.utils.toWei("1000", "ether")
              )
              .send({ from: userId });
            if (tx) {
              setIsApproved(true);
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
        setTask("");
        var errorCustom = JSON.parse(
          err.message.replace("Internal JSON-RPC error.", "").trim()
        );
        errorCustom = errorCustom.message
          .replace("execution reverted:", "")
          .trim();
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
  };

  const depositBusd = async () => {
    if (wlProof) {
      try {
        if (walletNetwork === 0) {
          console.log(
            "Non-Ethereum browser detected. You should consider trying MetaMask!"
          );
        } else {
          const curretProvider = await getProvider(walletNetwork);
          setLoading(true);
          setTask("Depositing BUSD");
          setMsg(
            walletNetwork === 2
              ? `Wating form WalletConnect Provider to confirm!`
              : "Wating from Metamask to confirm!"
          );
          const web3 = new Web3(
            curretProvider || process.env.REACT_APP_TESTNET_RPC_URL
          );
          const AloraNode = new web3.eth.Contract(
            AloraNodeContract.abi,
            addressList.AloraNode[id]
          );
          const req = await AloraNode.methods
            .depositToken(wlProof)
            .estimateGas({ from: userId });
          if (req) {
            const tx = await AloraNode.methods
              .depositToken(wlProof)
              .send({ from: userId });
            if (tx) {
              fetchDeposits();
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
        setTask("");
        var errorCustom = JSON.parse(
          err.message.replace("Internal JSON-RPC error.", "").trim()
        );
        errorCustom = errorCustom.message
          .replace("execution reverted:", "")
          .trim();
        console.log("Custom Error: ", errorCustom.message);
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
  };

  return (
    <>
      <Header
        setUserId={setUserId}
        userId={userId}
        setNetworkId={setNetworkId}
        setLoading={setLoading}
        setMsg={setMsg}
        wallet={wallet}
        setWallet={setWallet}
        setWalletNetwork={setWalletNetwork}
      />
      <div className="banner">
        <div className="tiers-list mt-0">
          <div className="row mx-0">
            <div className="col-lg-12">
              <div className="item w-75 m-auto active posit whitelist">
                <div className="inner-whitelist">
                  <div className="text-center mb-lg-4 mb-3">
                    <h2 className="theme-color mb-3">Whitelist</h2>
                    {/* <p className='text-capitalize'>getting your deposit as investment</p> */}
                  </div>

                  <div className="action-btns text-center mb-5">
                    <button
                      className="btn btn-brown text-capitalize"
                      onClick={() => setWallet(true)}
                    >
                      {!userId ? "Connect" : "Connected"}
                    </button>
                  </div>

                  {!userId ? (
                    <p className="text-capitalize">
                      Connect your wallet to check whitelist
                    </p>
                  ) : (
                    ""
                  )}

                  {!isWhitelist ? (
                    <p className="text-capitalize">Not Whitelisted!</p>
                  ) : (
                    <>
                      <p className="text-capitalize">
                        You Wallet is Whitelisted!
                      </p>
                      {userDeposit <= 0 ? (
                        <div className="d-flex justify-content-center align-items-center btn-list py-lg-3">
                          <button
                            className={`btn btn-brown ${
                              !isApproved && userId ? "active" : ""
                            }`}
                            onClick={() => approveBusd()}
                            disabled={!isApproved && userId ? false : true}
                          >
                            Approve BUSD
                          </button>
                          <button
                            className={`btn btn-brown ${
                              userDeposit <= 0 && userId ? "active" : ""
                            }`}
                            onClick={() => depositBusd()}
                            disabled={userDeposit <= 0 && userId ? false : true}
                          >
                            Deposit BUSD
                          </button>
                        </div>
                      ) : (
                        <p className="text-capitalize">Already Invested</p>
                      )}
                    </>
                  )}
                </div>
                <div className="card side-card">
                  <div className="whitelist-list">
                    <ul>
                      <li className="d-flex justify-content-between">
                        <span className="label">Your Deposits: </span>
                        <span className="value"> {userDeposit} BUSD</span>
                      </li>
                      <li className="d-flex justify-content-between">
                        <span className="label">Total Deposits: </span>
                        <span className="value"> {totalDeposit} BUSD</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
