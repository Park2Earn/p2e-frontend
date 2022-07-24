// import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'
import { useState, useEffect } from "react";

import { Paper, Grid, Button, TextField } from "@material-ui/core";
// import { nftContractAddress, nftURI , REACT_APP_ALCHEMY_KEY} from '../../config'
import { park2EarnContractAddress, usdcAavePolygonMumbai } from "../../config";
import Park2Earn from "../../contracts/Park2Earn.json";
import MockERC20 from "../../contracts/MockERC20.json";

import { ethers } from "ethers";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Moralis from "moralis";

import styles from "../../styles/Home.module.css";

import NavBar from "../../src/navbar";
import { formatUnits, parseUnits } from "ethers/lib/utils";

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
// const web3 = createAlchemyWeb3(REACT_APP_ALCHEMY_KEY);
// export const nftDAOContract = new web3.eth.Contract(
// 	NFT.abi,
// 	nftContractAddress
// );

export default function Home() {
  const [txError, setTxError] = useState(null);
  const [walletError, setWalletError] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [requestedAccounts, setRequestedAccounts] = useState(false);
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [StakingDepositAmount, setStakingDepositAmount] = useState(0);
  const [StakingWithdrawAmount, setStakingWithdrawAmount] = useState(0);

  // Checks if wallet is connected
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (ethereum) {
      // console.log('Got the ethereum obejct: ', ethereum)
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        // console.log('Found authorized Account: ', accounts[0])
        setCurrentAccount(accounts[0]);
      } else {
        // console.log('No authorized account found')
      }
    } else {
      setWalletError("Please install MetaMask Wallet.");
    }
  };

  // Checks if wallet is connected to the correct network
  const checkCorrectNetwork = async () => {
    const { ethereum } = window;
    if (ethereum) {
      let chainId = await ethereum.request({ method: "eth_chainId" });
      // console.log('Connected to chain:' + chainId)

      // const rinkebyChainId = '0x2a'

      // const devChainId = 1337
      const rinkebyChainId = "0x13881";

      const devChainId = 80001;
      const localhostChainId = `0x${Number(devChainId).toString(16)}`;

      if (chainId !== rinkebyChainId && chainId !== localhostChainId) {
        setCorrectNetwork(false);
      } else {
        setCorrectNetwork(true);
      }
    } else {
      setWalletError("Please install MetaMask Wallet.");
    }
  };

  function walletListener() {
    const { ethereum } = window;
    if (ethereum) {
      ethereum.on("accountsChanged", (accounts) => {
        // Handle the new accounts, or lack thereof.
        // "accounts" will always be an array, but it can be empty.
        window.location.reload();
      });

      ethereum.on("chainChanged", (chainId) => {
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.
        window.location.reload();
      });
    } else {
      setWalletError("Please install MetaMask Wallet.");
    }

    //   ethereum.on('message', mesg => {
    // 	  console.log("asd435&&")
    // 	  console.log(msg)
    //   })
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    checkCorrectNetwork();

    walletListener();
  }, [currentAccount]);

  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        setWalletError("Please install MetaMask Wallet.");
        return;
      }
      let chainId = await ethereum.request({ method: "eth_chainId" });
      // let chainId = await ethereum.request({
      //     method: 'wallet_switchEthereumChain',
      //   params: [{ chainId: '0x13881' }], // '0x3830303031'
      // })
      // console.log('Connected to chain:' + chainId)

      const rinkebyChainId = "0x13881";

      const devChainId = 80001;
      const localhostChainId = `0x${Number(devChainId).toString(16)}`;

      console.log(localhostChainId);
      console.log(chainId);
      if (chainId !== rinkebyChainId && chainId !== localhostChainId) {
        alert("You are not connected to the Polygon Mumbai Testnet!");
        return;
      }

      // console.log(requestedAccounts)
      setRequestedAccounts(true);

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // console.log('Found account', accounts[0])
      setCurrentAccount(accounts[0]);
    } catch (error) {
      // console.log('Error connecting to metamask', error)
    }
  };

  const approveStake = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const erc20Contract = new ethers.Contract(
          usdcAavePolygonMumbai,
          MockERC20.abi,
          signer
        );

        let p2eTx = await erc20Contract.approve(
          park2EarnContractAddress,
          StakingDepositAmount
        );
        console.log("Approve staking....", p2eTx.hash);

        let tx = await p2eTx.wait();

        // setMiningStatus(1)
      } else {
        setWalletError("Please install MetaMask Wallet.");
      }
    } catch (error) {
      console.log(error);
      // console.log('Error minting character', error)
      setTxError(error.message);
    }
  };

  // Creates fund transfer transaction
  const depositFunds = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const park2EarnContract = new ethers.Contract(
          park2EarnContractAddress,
          Park2Earn.abi,
          signer
        );

        let p2eTx = await park2EarnContract.stake(
          usdcAavePolygonMumbai,
          StakingDepositAmount,
          1
        );
        console.log("Staking....", p2eTx.hash);

        let tx = await p2eTx.wait();

        // setMiningStatus(1)
      } else {
        setWalletError("Please install MetaMask Wallet.");
      }
    } catch (error) {
      // console.log('Error minting character', error)
      setTxError(error.message);
    }
  };

  const withdrawFunds = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const park2EarnContract = new ethers.Contract(
          park2EarnContractAddress,
          Park2Earn.abi,
          signer
        );

        let p2eTx = await park2EarnContract.withdrawStaked(
          StakingWithdrawAmount,
          1
        );

        console.log("Withdrawing....", p2eTx.hash);

        let tx = await p2eTx.wait();

        // setMiningStatus(1)
      } else {
        setWalletError("Please install MetaMask Wallet.");
      }
    } catch (error) {
      // console.log('Error minting character', error)
      setTxError(error.message);
    }
  };

  const handleInputChangeDeposit = async (e) => {
    e.preventDefault();

    // console.log(e.target.value)
    setStakingDepositAmount(parseUnits(e.target.value, 6));
  };

  const handleInputChangeWithdraw = async (e) => {
    e.preventDefault();

    // console.log(e.target.value)
    setStakingWithdrawAmount(parseUnits(e.target.value, 6));
  };

  return (
    <div>
      <NavBar />

      <Grid container item xs={12}>
        <Grid container item xs={3} justifyContent="center"></Grid>

        <Grid container item xs={6} justify="center">
          {walletError === null ? (
            currentAccount === "" ? (
              <Button
                variant="outlined"
                disableElevation
                style={{
                  border: "2px solid",
                  height: "50px",
                  width: "100%",
                  margin: "2px",
                  marginTop: "80px",
                  maxWidth: "200px",
                }}
                aria-label="View Code"
                disabled={currentAccount === "" && requestedAccounts}
                onClick={connectWallet}
              >
                Connect Wallet
              </Button>
            ) : correctNetwork ? (
              <div>
                <Grid container item xs={12} justifyContent="center">
                  <h1
                    style={{ marginTop: "80px", color: "white", width: "100%" }}
                  >
                    Stake tokens
                  </h1>
                </Grid>

                <Grid container item xs={12} justify="center">
                  <TextField
                    id="outlined-basic"
                    type="number"
                    label="Amount"
                    variant="outlined"
                    style={{ marginTop: "50px", background: "white" }}
                    onChange={handleInputChangeDeposit}
                  />
                </Grid>

                <Grid container item xs={12} justify="center">
                  <Button
                    variant="outlined"
                    disableElevation
                    style={{
                      border: "2px solid",
                      height: "50px",
                      width: "100%",
                      margin: "2px",
                      marginTop: "40px",
                      maxWidth: "200px",
                      color: "white",
                    }}
                    aria-label="View Code"
                    onClick={approveStake}
                    // disabled={(nftList.length >= 2 || numMinted == 50)}
                  >
                    Approve stake
                  </Button>
                  <Button
                    variant="outlined"
                    disableElevation
                    style={{
                      border: "2px solid",
                      height: "50px",
                      width: "100%",
                      margin: "2px",
                      marginTop: "40px",
                      maxWidth: "200px",
                      color: "white",
                    }}
                    aria-label="View Code"
                    onClick={depositFunds}
                    // disabled={(nftList.length >= 2 || numMinted == 50)}
                  >
                    Deposit Stake
                  </Button>
                </Grid>

                <Grid container item xs={12} justify="center">
                  <TextField
                    id="outlined-basic"
                    type="number"
                    label="Amount"
                    variant="outlined"
                    style={{ marginTop: "50px", background: "white" }}
                    onChange={handleInputChangeWithdraw}
                  />
                </Grid>

                <Grid container item xs={12} justify="center">
                  <Button
                    variant="outlined"
                    disableElevation
                    style={{
                      border: "2px solid",
                      height: "50px",
                      width: "100%",
                      margin: "2px",
                      marginTop: "40px",
                      maxWidth: "200px",
                      color: "white",
                    }}
                    aria-label="View Code"
                    onClick={withdrawFunds}
                    // disabled={(nftList.length >= 2 || numMinted == 50)}
                  >
                    Withdraw Stake
                  </Button>
                </Grid>
              </div>
            ) : (
              <Paper
                elevation={0}
                style={{
                  width: "100%",
                  margin: "2px",
                  marginTop: "80px",
                  maxWidth: "250px",
                  textAlign: "center",
                }}
              >
                Please connect to Polygon Mumbai Testnet
              </Paper>
            )
          ) : (
            <div style={{ marginTop: "80px" }}>{walletError}</div>
          )}
        </Grid>

        <Grid container item xs={3} justifyContent="center"></Grid>
      </Grid>
    </div>
  );
}
