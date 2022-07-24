import { useState, useEffect } from "react";

import { Paper, Grid, Button, TextField } from "@material-ui/core";
// import { daoContractAddress, nftURI , REACT_APP_ALCHEMY_KEY} from '../../config'
import { park2EarnContractAddress, REACT_APP_ALCHEMY_KEY } from "../../config";
import Park2Earn from "../../contracts/Park2Earn.json";
import { ethers } from "ethers";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import Moralis from "moralis";

import NavBar from "../../src/navbar";

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(REACT_APP_ALCHEMY_KEY);
export const Park2EarnContract = new web3.eth.Contract(
  Park2Earn.abi,
  park2EarnContractAddress
);

export default function Home() {
  const [txError, setTxError] = useState(null);
  const [walletError, setWalletError] = useState(null);
  const [currentAccount, setCurrentAccount] = useState("");
  const [requestedAccounts, setRequestedAccounts] = useState(false);
  const [correctNetwork, setCorrectNetwork] = useState(false);

  const [winners, setWinners] = useState([]);
  const [publicGoods, setPublicGoods] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function getAll() {
      setIsLoading(true);
      let promotionWinnners = [];
      promotionWinnners = await Park2EarnContract.methods
        .getPromotionWinners(1)
        .call(); // returns int

      setWinners(promotionWinnners);
      var publicGoodArray = [];
      for (var i = 0; i < promotionWinnners.length; i++) {
        const promotion = await Park2EarnContract.methods
          .getPublicGood(promotionWinnners[i])
          .call(); // returns int
        publicGoodArray.push(promotion);
      }
      setPublicGoods(publicGoodArray);
      setIsLoading(false);
    }

    getAll();
  }, []);

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

  return (
    <div>
      <NavBar walletAddress={currentAccount} />

      <Grid container item xs={12}>
        <Grid container item xs={3} justifyContent="center"></Grid>

        <Grid container item xs={6} justifyContent="center">
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
              <div style={{ width: "100%" }}>
                <Grid container item xs={12} justifyContent="center">
                  <h1
                    style={{ marginTop: "80px", color: "white", width: "100%" }}
                  >
                    Winners
                  </h1>
                </Grid>
                {isLoading ? (
                  <div style={{ color: "black" }}>Loading...</div>
                ) : publicGoods.length > 0 ? (
                  <div style={{ width: "100%" }}>
                    <Grid
                      style={{
                        border: "1px solid black",
                        borderRadius: "10px",
                      }}
                    >
                      <Grid
                        item
                        container
                        xs={12}
                        direction="row"
                        style={{ padding: "5px" }}
                      >
                        <Grid
                          container
                          item
                          xs={6}
                          j
                          justifyContent="center"
                          style={{ fontWeight: "bold" }}
                        >
                          {"Title"}
                        </Grid>

                        <Grid
                          container
                          item
                          xs={6}
                          justifyContent="center"
                          style={{ fontWeight: "bold" }}
                        >
                          {"Description"}
                        </Grid>
                      </Grid>

                      {publicGoods.map((publicGood, index) => {
                        return (
                          <Grid
                            item
                            container
                            xs={12}
                            key={index}
                            style={{ padding: "5px" }}
                          >
                            <Grid container item xs={6} justifyContent="center">
                              {publicGood.title}
                            </Grid>

                            <Grid container item xs={6} justifyContent="center">
                              {publicGood.description}
                            </Grid>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </div>
                ) : null}
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
      </Grid>
    </div>
  );
}
