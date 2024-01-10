import Layout from "./Layout";
import { useState, useEffect } from "react";
import "./App.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Modal from "@mui/material/Modal";
import SweeperIcon from "./assets/SweeperDAO.svg";
import sweep from "./assets/sweep.svg";
import bag from "./assets/bag.svg";
import { useConnectWallet, useAccountCenter } from "@web3-onboard/react";
import * as ethers from "ethers";
import { ABI } from "./broomAbi";
import { erc20TokenAbi } from "./erc20Token";
import { airdropABI } from "./broomAirdrop";
import { getAirdropProof } from "./api";
import StakeLP from "./StakeLP";

function bigIntToNumber(param, calMulti) {
  if (calMulti) {
    return Number(BigInt(param)) / 10000;
  }
  return Number(BigInt(param) / 10n ** 16n) / 100;
}
function numberToBigInt(param) {
  return BigInt(param * 100) * 10n ** 16n;
}
function calculateWeeksRemaining(timestamp) {
  const now = Date.now();

  const timeDifference = timestamp - now;

  if (timeDifference <= 0) {
    return 0;
  }

  const weeksRemaining = Math.floor(timeDifference / (7 * 24 * 60 * 60 * 1000));

  return weeksRemaining;
}
function App() {
  const [showModal, setShowModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [point, setPoint] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [score, setScore] = useState(0);
  const [deposited, setDeposited] = useState(0);
  const [balance, setBalance] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [tab, setTab] = useState("deposit");
  const [value, setValue] = useState(0);
  const [lockRes, setLockRes] = useState();
  const [initialScore, setInitialScore] = useState(0);
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const [contract, setContract] = useState();
  const [broomContract, setBroomContract] = useState();
  const [broomAirdropContract, setBroomAirdropContract] = useState();
  const [claimRes, setClaimRes] = useState({});

  const updateAccountCenter = useAccountCenter();

  const handleClose = () => {
    setShowModal(false);
  };
  useEffect(() => {
    updateAccountCenter({ enabled: false });
  }, []);

  async function getBalance() {
    try {
      const address = wallet.accounts[0].address;
      const res = await broomContract.balanceOf(address);

      setBalance(bigIntToNumber(res._hex));
    } catch (error) {
      console.log(error);
    }
  }
  async function checkApprove() {
    try {
      const address = wallet.accounts[0].address;

      const res = await broomContract.allowance(
        address,
        "0x6d6456f5471768F49c9f82Cb3fEC67439f77D1b7"
      );
      setAllowance(bigIntToNumber(res._hex));
    } catch (error) {
      console.log(error);
    }
  }
  async function approve(value) {
    try {
      const transaction = await broomContract.approve(
        "0x6d6456f5471768F49c9f82Cb3fEC67439f77D1b7",
        numberToBigInt(value)
      );
      const receipt = await transaction.wait();
      if (receipt.status === 1) {
        checkApprove();
      } else {
        console.error("Transaction failed. Error message:", receipt.statusText);
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    async function getClaimRes() {
      try {
        const address = wallet.accounts[0].address;
        const res = await getAirdropProof({ address });
        setClaimRes(res.data.data);
      } catch (error) {
        console.log(error);
      }
    }
    if (wallet) getClaimRes();
  }, [wallet]);

  async function getDeposited() {
    try {
      const address = wallet.accounts[0].address;
      const res = await contract.balanceOf(address);
      setDeposited(bigIntToNumber(res._hex));
    } catch (error) {
      console.log(error);
    }
  }
  async function getScore() {
    try {
      const address = wallet.accounts[0].address;
      const res = await contract.scoreOf(address);
      setScore(bigIntToNumber(res._hex));
      setInitialScore(bigIntToNumber(res._hex));
    } catch (error) {
      console.log(error);
    }
  }
  async function getPoint() {
    try {
      const address = wallet.accounts[0].address;
      const res = await contract.pointsOf(address);

      setPoint(bigIntToNumber(res._hex));
    } catch (error) {
      console.log(error);
    }
  }
  async function getMultiplier() {
    try {
      const address = wallet.accounts[0].address;
      const res = await contract.multiplierOf(address);
      setMultiplier(bigIntToNumber(res._hex, true));
    } catch (error) {
      console.log(error);
    }
  }
  async function getLockData() {
    try {
      const address = wallet.accounts[0].address;
      const res = await contract.lockedBalances(address);
      setLockRes(res);
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchUserData() {
    try {
      getMultiplier();
      getScore();
      getPoint();
      getDeposited();
      getLockData();
    } catch (error) {
      console.log(error);
    }
  }

  async function deposit(value) {
    try {
      const transaction = await contract.deposit(numberToBigInt(value));
      const receipt = await transaction.wait();
      if (receipt.status === 1) {
        checkApprove();
        getBalance();
        fetchUserData();
      } else {
        console.error("Transaction failed. Error message:", receipt.statusText);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async function withdraw(value) {
    try {
      const transaction = await contract.withdraw(numberToBigInt(value));
      const receipt = await transaction.wait();
      if (receipt.status === 1) {
        getBalance();
        fetchUserData();
      } else {
        console.error("Transaction failed. Error message:", receipt.statusText);
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    if (wallet && broomContract) {
      getBalance();
      checkApprove();
    }
  }, [wallet, broomContract]);

  useEffect(() => {
    if (initialScore > 0 && deposited > 0) {
      setInterval(() => {
        setScore((score) => {
          return score + deposited / 3600;
        });
      }, 1000);
    }
  }, [initialScore, deposited, multiplier]);

  useEffect(() => {
    async function Connect() {
      if (wallet) {
        const provider = new ethers.providers.Web3Provider(wallet.provider);
        const signer = await provider.getSigner();
        const Contract = new ethers.Contract(
          "0x6d6456f5471768F49c9f82Cb3fEC67439f77D1b7",
          ABI,
          provider
        );
        const broomContract = new ethers.Contract(
          "0xcA821c688F3647321d791D1e3DC8267a27F37b09",
          erc20TokenAbi,
          provider
        );
        const airdropContract = new ethers.Contract(
          "0x696f24eb7507cae60d2be265e5acf189e292267a",
          airdropABI,
          provider
        );
        setBroomAirdropContract(airdropContract.connect(signer));
        setContract(Contract.connect(signer));
        setBroomContract(broomContract.connect(signer));
      }
    }
    Connect();
  }, [wallet]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        getMultiplier();
        getScore();
        getPoint();
        getDeposited();
        getLockData();
      } catch (error) {
        console.log(error);
      }
    }
    if (contract && wallet) {
      fetchUserData();
    }
  }, [contract, wallet]);

  const approved = balance > 0 && allowance >= value;

  return (
    <Layout>
      <Box sx={{ padding: "1rem" }}>
        {/* <Stack
        direction={"row"}
        sx={{ padding: "0 5%", justifyContent: "space-between" }}
      >
        <Box textAlign={"left"} sx={{ display: "flex" }}>
          <img src={SweeperIcon} />
          <Box
            sx={{
              color: "rgba(232, 214, 152, 1)",
              margin: "0 1rem",
              marginLeft: "60px",
              cursor: "pointer",
            }}
          >
            HOLDER AIRDROP
          </Box>
          <Box
            sx={{
              color: "rgba(232, 214, 152, 1)",
              margin: "0 1rem",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowClaimModal(true);
            }}
          >
            CLAIM $BROOM
          </Box>
        </Box>
        <Button
          sx={{
            background: "rgba(232, 214, 152, 1) !important",
            outline: "none !important",
            color: "#000",
            fontFamily: "Roboto Condensed Medium",
            fontWeight: "500",
          }}
          onClick={() => {
            wallet ? disconnect(wallet) : connect();
          }}
        >
          <img src={bag} />
          {wallet
            ? `${wallet.accounts[0].address.slice(
                0,
                6
              )}...${wallet.accounts[0].address.slice(-4)}`
            : "Connect Wallet"}
        </Button>
      </Stack> */}
        <Box
          sx={{
            padding: "0 200px",
            background: "#000",
            color: "#fff",
            textAlign: "center",
            paddingTop: "1rem",
          }}
        >
          <Box
            sx={{
              textAlign: "left",
              marginRight: "50px",
              marginBottom: "100px",
            }}
          >
            <Box sx={{ marginBottom: "12px" }}>
              <img src={sweep} />
            </Box>
            <Box
              sx={{
                fontFamily: "Roboto Condensed",
                fontSize: "50px",
                lineHeight: "44px",
                marginBottom: "20px",
              }}
            >
              HOLD $BROOM TO EARN
              <span
                style={{ color: "rgba(232, 214, 152, 1)" }}
              >{` REDACTED`}</span>
            </Box>
            <Box
              sx={{
                fontFamily: "Roboto Condensed",
                fontSize: "14px",
                color: "rgba(146, 146, 146, 1)",
              }}
            >
              {`Sweeping ain't much, but it's honest work.`}
            </Box>
          </Box>
          <Box
            sx={{
              borderTop: "1px solid rgba(212, 207, 165, 0.7)",
              // borderBottom: "1px solid rgba(212, 207, 165, 0.7)",
              borderLeft: "none",
              borderRight: "none",
              // border
              fontFamily: " Roboto Condensed",
              color: "rgba(146, 146, 146, 1)",
              fontSize: "16px",
              textTransform: "uppercase",
              textAlign: "left",
              padding: "12px 0",
              // flex: "0 1 500px",
            }}
          >
            <Stack direction={"row"} justifyContent={"space-between"}>
              <Box>
                <Box>
                  HOLDER SCORE
                  <span style={{ fontSize: "12px", lineHeight: "14px" }}>
                    (Points x Multiplier)
                  </span>
                </Box>
                <Box
                  sx={{
                    fontSize: "48px",
                    color: "rgba(232, 214, 152, 1)",
                    fontFamily: " Roboto Condensed Medium",
                  }}
                >
                  {wallet ? (score * multiplier).toFixed(2) : "--"}
                </Box>
              </Box>
              {wallet && (
                <Box sx={{ display: "flex", flexDirection: "column-reverse" }}>
                  <Button
                    sx={{
                      background: "rgba(232, 214, 152, 1) !important",
                      outline: "none !important",
                      color: "#000",
                      fontFamily: "Roboto Condensed Medium",
                      fontWeight: "500",
                    }}
                    onClick={() => {
                      setShowModal(true);
                    }}
                  >
                    {/* <img src={bag} /> */}
                    DEPOSIT $BROOM TO EARN
                  </Button>
                </Box>
              )}
            </Stack>
            <Box>
              <Stack
                direction={"row"}
                sx={{
                  padding: "12px 0",
                  borderTop: "1px solid rgba(212, 207, 165, 0.7)",
                  borderBottom: "1px solid rgba(212, 207, 165, 0.7)",
                  marginTop: "20px",
                }}
              >
                <Box
                  sx={{
                    flex: "1 1 auto",
                    borderRight: "1px solid rgba(212, 207, 165, 0.7)",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    paddingRight: "35px",
                  }}
                >
                  <Box>$BROOM DEPOSITED</Box>
                  <Box
                    sx={{
                      fontFamily: " Roboto Condensed Medium",
                      fontSize: "24px",
                      color: "#fff",
                    }}
                  >
                    {wallet ? deposited : "--"}
                  </Box>
                  <Box>Earning Holder Points</Box>
                  {/* <Button sx={{}}>Withdraw</Button> */}
                </Box>
                <Box
                  sx={{
                    flex: "1 1 auto",
                    borderRight: "1px solid rgba(212, 207, 165, 0.7)",
                    padding: "0 35px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box>HOLDER POINTS</Box>
                  <Box
                    sx={{
                      fontFamily: " Roboto Condensed Medium",
                      fontSize: "24px",
                      color: "#fff",
                    }}
                  >
                    {wallet ? point : "--"}
                  </Box>
                  <Box>Earning {wallet ? deposited : "--"} PTS Per Hour</Box>
                </Box>
                <Box
                  sx={{
                    flex: "1 1 auto",
                    padding: "0 35px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Box>MULTIPLIER</Box>
                  <Box
                    sx={{
                      fontFamily: " Roboto Condensed Medium",
                      fontSize: "24px",
                      color: "#fff",
                    }}
                  >
                    {wallet ? `${multiplier}X` : "--"}
                  </Box>
                  <Box>Increases 0.5x Per Month</Box>
                </Box>
              </Stack>
              {wallet && lockRes && bigIntToNumber(lockRes.total) > 0 && (
                <Box
                  sx={{ borderBottom: "1px solid rgba(212, 207, 165, 0.7)" }}
                >
                  <Stack
                    direction={"row"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                  >
                    <Box
                      sx={{
                        marginTop: "20px",
                        marginBottom: "20px",
                      }}
                    >
                      Lock Data
                    </Box>
                    {bigIntToNumber(lockRes.releasable) > 0 && (
                      <Button
                        sx={{
                          background: "rgba(232, 214, 152, 1) !important",
                          outline: "none !important",
                          color: "#000",
                          fontFamily: "Roboto Condensed Medium",
                          height: "36.5px",
                          fontWeight: "500",
                        }}
                        onClick={() => {
                          withdraw(bigIntToNumber(lockRes.releasable));
                        }}
                      >
                        withdraw Expired
                      </Button>
                    )}
                  </Stack>
                  <Box
                    sx={{
                      marginBottom: "20px",
                    }}
                  >
                    {`Releasable: ${bigIntToNumber(lockRes.releasable)}`}
                  </Box>
                  {lockRes && lockRes.lockData.length > 0 && (
                    <Stack direction={"row"} sx={{ fontFamily: "Rajdhani" }}>
                      <Box sx={{ flex: "1 1 0px" }}>Amount</Box>
                      <Box sx={{ flex: "1 1 50px" }}> UnlockTime</Box>
                      <Box sx={{ flex: "1 1 0px" }}> Remaining</Box>
                    </Stack>
                  )}
                  {lockRes &&
                    lockRes.lockData &&
                    lockRes.lockData.map((data, index) => {
                      return (
                        <Stack
                          key={index}
                          direction={"row"}
                          sx={{ marginBottom: "20px" }}
                        >
                          <Box sx={{ flex: "1 1 0px" }}>
                            {bigIntToNumber(data.amount)}
                          </Box>
                          <Box sx={{ flex: "1 1 50px" }}>
                            {new Date(data.unlockTime * 1000).toLocaleString()}
                          </Box>
                          <Box sx={{ flex: "1 1 0px" }}>
                            {` ${calculateWeeksRemaining(
                              data.unlockTime * 1000
                            )} Weeks`}
                          </Box>
                        </Stack>
                      );
                    })}
                </Box>
              )}
            </Box>
          </Box>
          <StakeLP />
          <Modal open={showModal} onClose={handleClose}>
            <Box
              sx={{
                position: "absolute",
                height: "500px",
                width: "800px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                background: "rgb(8,4,4)",
                border: "1px solid rgb(231,214,152)",
                borderRadius: "8px",
                color: "#fff",
                padding: "1rem",
              }}
            >
              <Box
                sx={{
                  borderBottom: "1px solid rgb(48, 48, 48)",
                  padding: "8px",
                }}
              >
                DEPOSIT $BROOM TO EARN
              </Box>
              <Stack direction={"row"}>
                <Box
                  sx={{
                    flex: "1 1 0px",
                    background: "rgb(30, 30, 30)",
                    margin: "1rem",
                    padding: "16px",
                  }}
                >
                  <Box>{balance}</Box>
                  <Box>$BROOM wallet balance</Box>
                </Box>
                <Box
                  sx={{
                    flex: "1 1 0px",
                    background: "rgb(30, 30, 30)",
                    margin: "1rem",
                    padding: "16px",
                  }}
                >
                  <Box>{deposited}</Box>
                  <Box>$BROOM deposited</Box>
                </Box>
              </Stack>
              <Stack direction={"row"} textAlign={"center"}>
                <Box
                  sx={{
                    flex: "1 1 0px",
                    borderBottom:
                      tab === "deposit"
                        ? "1px solid rgb(231,214,152)"
                        : "1px solid rgb(48, 48, 48)",
                    cursor: "pointer",
                    color: tab === "deposit" ? "rgb(231,214,152)" : "#fff",
                  }}
                  onClick={() => {
                    setTab("deposit");
                  }}
                >
                  <Box
                    sx={{
                      textTransform: "uppercase",
                    }}
                  >
                    deposit $BROOM to hold
                  </Box>
                  <Box>Earn Points and Multiplier</Box>
                </Box>
                <Box
                  sx={{
                    flex: "1 1 0px",
                    borderBottom:
                      tab === "withdraw"
                        ? "1px solid rgb(231,214,152)"
                        : "1px solid rgb(48, 48, 48)",
                    cursor: "pointer",
                    color: tab === "withdraw" ? "rgb(231,214,152)" : "#fff",
                  }}
                  onClick={() => {
                    setTab("withdraw");
                  }}
                >
                  <Box
                    sx={{
                      textTransform: "uppercase",
                    }}
                  >
                    Withdraw $BROOM
                  </Box>
                  <Box>Lose Multiplier</Box>
                </Box>
              </Stack>
              <Stack
                direction={"row"}
                justifyContent={"center"}
                sx={{ marginTop: "16px" }}
              >
                <input
                  style={{
                    fontSize: "64px",
                    color: "rgba(232, 214, 152, 1)",
                    background: "#000",
                    border: "none",
                    outline: "none",
                  }}
                  value={value}
                  size={String(value).length || 1}
                  onChange={(e) => {
                    setValue(e.target.value);
                  }}
                ></input>
              </Stack>
              <Box textAlign={"center"} sx={{ marginTop: "16px" }}>
                <Button
                  sx={{
                    background: "rgba(232, 214, 152, 1) !important",
                    outline: "none !important",
                    color: "#000",
                    fontFamily: "Roboto Condensed Medium",
                    fontWeight: "500",
                  }}
                  onClick={async () => {
                    try {
                      if (tab === "deposit") {
                        if (!approved) {
                          approve(value);
                        } else {
                          deposit(value);
                        }
                      } else {
                        withdraw(value);
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                >
                  {/* <img src={bag} /> */}
                  {tab === "deposit"
                    ? approved
                      ? "DEPOSIT $BROOM"
                      : "Approve"
                    : "WITHDARW $BROOM"}
                </Button>
              </Box>
            </Box>
          </Modal>
          <Modal
            open={showClaimModal}
            onClose={() => {
              setShowClaimModal(false);
            }}
          >
            <Box
              sx={{
                position: "absolute",
                height: "250px",
                width: "500px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                background: "rgb(8,4,4)",
                border: "1px solid rgb(231,214,152)",
                borderRadius: "8px",
                color: "#fff",
                padding: "1rem",
                outline: "none",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Box sx={{ fontFamily: "Roboto Condensed", fontSize: "22px" }}>
                CLAIMABLE NOW
              </Box>
              <Box
                sx={{
                  fontSize: "48px",
                  color: "rgba(232, 214, 152, 1)",
                  fontFamily: " Roboto Condensed Medium",
                }}
              >
                {100}
              </Box>
              <Box textAlign={"center"}>
                <Button
                  sx={{
                    background: "rgba(232, 214, 152, 1) !important",
                    outline: "none !important",
                    color: "#000",
                    fontFamily: "Roboto Condensed Medium",
                    fontWeight: "500",
                    width: "120px",
                  }}
                  onClick={async () => {
                    try {
                      const address = wallet.accounts[0].address;
                      const res = await broomAirdropContract.claim(
                        address,
                        BigInt(claimRes.amount),
                        claimRes.proof
                      );
                      console.log(res);
                    } catch (error) {
                      console.log(error);
                    }
                  }}
                >
                  <img src={bag} />
                  CLAIM
                </Button>
              </Box>
            </Box>
          </Modal>
        </Box>
      </Box>
    </Layout>
  );
}

export default App;
