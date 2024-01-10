import Layout from "./Layout";
import { useState, useEffect, useContext } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material";
import { useConnectWallet } from "@web3-onboard/react";
import { airdropABI } from "./broomAirdrop";
import { getAirdropProof } from "./api";
import { WblurStakeAbi } from "./wblur-staking";
import { tokenLockerAbi } from "./token-locker";
import convexIcon from "./assets/convex_logo_whitebackground.png";
import curveIcon from "./assets/curve-logo.f83f84d4.png";
import * as ethers from "ethers";
import { contentQuotesLinter } from "@ant-design/cssinjs/lib/linters";
// import burstIcon from "./assets/BURST_Icon_Black.png";
function HeadInfoItem({ head, content }) {
  return (
    <Box>
      <Stack>
        <Box
          sx={{ opacity: 0.5 }}
          fontSize={15}
          fontWeight={500}
          color={"#fff"}
        >
          {head}
        </Box>
        <Box
          sx={{ fontFamily: "Rajdhani SemiBold" }}
          fontSize={17}
          fontWeight={700}
          color={"#fff"}
        >
          {content}
        </Box>
      </Stack>
    </Box>
  );
}
function HeadInfo({ head, content, sx }) {
  return (
    <Box sx={sx}>
      <HeadInfoItem head={head} content={content}></HeadInfoItem>
    </Box>
  );
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
const WhiteDisabledButton = styled(Button)({
  "&.Mui-disabled": {
    background: "#d7d7d7",
    color: "rgba(0, 0, 0, 0.26)",
    borderRadius: "10px",
  },
});

const StyledAccordion = styled(Accordion)({
  ".MuiAccordionSummary-root:hover:not(.Mui-expanded)": {
    backgroundColor: "rgb(6,6,6)",
  },
  "& .MuiAccordionSummary-expandIconWrapper": {
    color: "#fff",
  },
});
const YellowButton = styled(Button)({
  "&.MuiButton-root": { background: "rgba(232, 214, 152, 1) !important" },
});
const GreyButton = styled(Button)({
  "&.MuiButton-root": {
    background: "rgba(146, 146, 146, 0.2)",
    width: "200px",
  },
  "&.MuiButton-root.Mui-disabled": {
    color: "rgba(255,255,255,0.6)",
  },
});

const FunctionButton = (props) => {
  const { burstColor, children } = props;
  if (burstColor === "yellow") {
    return <YellowButton {...props}>{children}</YellowButton>;
  } else
    return (
      <GreyButton {...props} disabled>
        {children}
      </GreyButton>
    );
};
const Claim = () => {
  // const { contextValue, updateContextValue } = useContext(MyContext);
  const [claimData, setClaimData] = useState({});
  const [{ wallet }, ,] = useConnectWallet();

  const [stakeLPContract, setStakeLPContract] = useState();
  const [stakeContract, setStakeContract] = useState();
  const [claimRes, setClaimRes] = useState({});
  const [tokenPrice, setTokenPrice] = useState({});
  const [broomAirdropContract, setBroomAirdropContract] = useState();
  const [poolInfo, setPoolInfo] = useState([]);
  const [LpClaimInfo, setLpClaimInfo] = useState({});
  const [burstLockerContract, setBurstLockerContract] = useState();
  const [tokenLockerValue, setTokenLockerValue] = useState(0);
  const [broomBalanceInLockerRes, setBroomBalanceInLockerRes] = useState({});
  const [lockerReleasableInfo, setLockerReleasableInfo] = useState(0);
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
  useEffect(() => {
    async function Connect() {
      if (wallet) {
        const provider = new ethers.providers.Web3Provider(wallet.provider);
        const signer = await provider.getSigner();

        const airdropContract = new ethers.Contract(
          "0x696f24eb7507cae60d2be265e5acf189e292267a",
          airdropABI,
          provider
        );
        const stakeContract = new ethers.Contract(
          "0x51411D82eb5a74e1301f897a81B2FD920c355cF6",
          WblurStakeAbi,
          provider
        );
        const connectedStakeContract = stakeContract.connect(signer);
        const tokenLockerContract = new ethers.Contract(
          "0xDE2579f400dE6ceAd02dD74C2ffa00C31fC9E7Fc",
          tokenLockerAbi,
          provider
        );

        setBurstLockerContract(tokenLockerContract.connect(signer));
        setStakeContract(connectedStakeContract);
        setBroomAirdropContract(airdropContract.connect(signer));
      }
    }
    Connect();
  }, [wallet]);
  async function getTotalClaimable() {
    if (wallet && tokenPrice) {
      const address = wallet.accounts[0].address;
      try {
        const stakedLPRes = await stakeContract.earned(address);
        const balance = await stakeContract.balanceOf(address);

        const earnedLPCount =
          Number(BigInt(stakedLPRes._hex) / 10n ** 16n) / 100;
        const earnedLPValue =
          earnedLPCount *
            tokenPrice[
              "0x9f96F12f3cAB9Ee00860cb123E2775Bdf426c228".toLowerCase()
            ] || 0;
        setLpClaimInfo({ count: earnedLPCount, value: earnedLPValue });

        const broomRes = await burstLockerContract.lockedBalances(address);
        setBroomBalanceInLockerRes(broomRes);
        const releasableBalanceRes =
          await burstLockerContract.releasableBalanceOf(address);
        const lockerBalanceRes = await burstLockerContract.balanceOf(address);

        const releasableBalance =
          Number(BigInt(releasableBalanceRes._hex) / 10n ** 16n) / 100;

        const releasableValue =
          releasableBalance *
            tokenPrice[
              "0x0535a470f39dec973c15d2aa6e7f968235f6e1d4".toLowerCase()
            ] || 0;

        const tokenLockerBalance =
          Number(BigInt(lockerBalanceRes._hex) / 10n ** 16n) / 100;

        const tokenLockerValue =
          tokenLockerBalance *
            tokenPrice[
              "0x0535a470f39dec973c15d2aa6e7f968235f6e1d4".toLowerCase()
            ] || 0;
        setTokenLockerValue(tokenLockerValue);
        setLockerReleasableInfo({
          count: releasableBalance,
          value: releasableValue,
        });
      } catch (error) {
        console.log(error);
      }
    }
  }
  useEffect(() => {
    if (wallet && stakeContract) getTotalClaimable();
  }, [wallet, stakeContract]);

  const {
    lockEarnedValue = 0,

    earnedLPCount = 0,
    earnedLPValue = 0,

    stakedLPExtraRewardInfo,
    stakedLPExtraTotalValue = 0,
    lockClaimableTokens,
  } = claimData;

  return (
    <Layout>
      <Box sx={{ padding: "80px 200px" }}>
        <StyledAccordion
          sx={{
            background: "rgb(42, 42, 42)",
            color: "#fff",
            marginBottom: "20px",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Stack width={"100%"} direction={"row"} textAlign={"left"}>
              <Box sx={{ fontSize: "17px", fontWeight: 700, flex: "1 1 0px" }}>
                Claim $BROOM
              </Box>
              <HeadInfo
                sx={{ flex: "1 1 0px" }}
                head={"Claimable (USD value)"}
                content={`$${
                  claimRes.amount ? BigInt(claimRes.amount) / 10n ** 18n : 0
                }`}
              />
              {/* <HeadInfo
              sx={{ flex: "1 1 0px" }}
              head={"Apr"}
              content={`${
                lockValue
                  ? ((lockEarnedValue / lockValue / 7) * 365 * 100).toFixed(2)
                  : 0
              }%`}
            /> */}
              <FunctionButton
                burstColor={lockEarnedValue ? "yellow" : "black"}
                sx={{
                  flex: "1 1 0px",
                  maxWidth: "120px",
                  marginX: "8px",
                  height: "41px",
                  color: "#000",
                }}
                onClick={async () => {
                  try {
                    const address = wallet.accounts[0].address;
                    const res = await broomAirdropContract.claim(
                      address,
                      BigInt(claimRes.amount),
                      claimRes.proof
                      // { gasLimit: 2100000 }
                    );
                  } catch (error) {
                    console.log(error);
                  }
                }}
                variant="contained"
              >
                Claim
              </FunctionButton>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {poolInfo.length > 0 && (
              <Box>
                {poolInfo
                  .find((pool) => {
                    if (
                      pool.addr.toLowerCase() ===
                      import.meta.env.VITE_BURST_LOCKER.toLowerCase()
                    )
                      return pool;
                  })
                  .reward_list.map((reward, index) => {
                    let rewardInfo;
                    if (lockClaimableTokens) {
                      rewardInfo = lockClaimableTokens.find((token) => {
                        if (
                          token.address.toLowerCase() ===
                          reward.addr.toLowerCase()
                        )
                          return true;
                      });
                    }
                    return (
                      <Stack direction={"row"} key={index}>
                        <Box sx={{ width: "40px", textAlign: "left" }}>
                          {/* <img
                          src={
                            reward.symbol === "Burst"
                              ? burstIcon
                              : reward.symbol === "BHP"
                              ? BHPIcon
                              : reward.icon
                          }
                          style={{ height: "24px" }}
                        ></img> */}
                        </Box>

                        <Box sx={{ width: "60px", textAlign: "left" }}>
                          {reward.symbol}
                        </Box>

                        <Box sx={{ textAlign: "left" }}>
                          {`${rewardInfo?.count || 0} ≈ $ ${
                            rewardInfo?.value?.toFixed(2) || 0
                          }`}
                        </Box>
                      </Stack>
                    );
                  })}
              </Box>
            )}
          </AccordionDetails>
        </StyledAccordion>
        <StyledAccordion
          sx={{
            background: "rgb(42, 42, 42)",
            color: "#fff",
            marginBottom: "20px",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Stack width={"100%"} direction={"row"} textAlign={"left"}>
              <Box sx={{ fontSize: "17px", fontWeight: 700, flex: "1 1 0px" }}>
                Stake LP
              </Box>
              <HeadInfo
                sx={{ flex: "1 1 0px" }}
                head={"Claimable (USD value)"}
                content={`$${
                  (earnedLPValue + stakedLPExtraTotalValue)?.toFixed(2) || 0
                }`}
              />
              {/* <HeadInfo
                sx={{ flex: "1 1 0px" }}
                head={"Apr"}
                content={`${
                  earnedLPValue
                    ? (
                        ((earnedLPValue + stakedLPExtraTotalValue) /
                          stakedLPValue /
                          7) *
                        365 *
                        100
                      ).toFixed(2)
                    : 0
                }%`}
              /> */}
              <FunctionButton
                burstColor={LpClaimInfo.count > 0 ? "yellow" : "black"}
                sx={{
                  flex: "1 1 0px",
                  maxWidth: "120px",
                  marginX: "8px",
                  height: "41px",
                  color: "#000",
                }}
                onClick={async () => {
                  try {
                    const transaction = await stakeContract.getReward();

                    const receipt = await transaction.wait();
                    if (receipt.status === 1) {
                      getTotalClaimable();
                    } else {
                      console.error(
                        "Transaction failed. Error message:",
                        receipt.statusText
                      );
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }}
                variant="contained"
              >
                Claim
              </FunctionButton>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {poolInfo.length > 0 && (
              <Box>
                <Stack direction={"row"}>
                  {/* <Box sx={{ width: "40px", textAlign: "left" }}>
                  <img src={burstIcon} style={{ height: "24px" }}></img>
                </Box> */}
                  <Box sx={{ width: "60px", textAlign: "left" }}>{"Burst"}</Box>

                  <Box sx={{ textAlign: "left" }}>
                    {`${earnedLPCount || 0} ≈ $ ${
                      earnedLPValue?.toFixed(2) || 0
                    }`}
                  </Box>
                </Stack>
                {poolInfo
                  .find((pool) => {
                    if (
                      pool.addr.toLowerCase() ===
                      "0x51411D82eb5a74e1301f897a81B2FD920c355cF6".toLowerCase()
                    )
                      return pool;
                  })
                  .reward_list.map((reward) => {
                    if (
                      reward.addr.toLowerCase() ===
                      "0x0535a470f39DEc973C15D2Aa6E7f968235F6e1D4".toLowerCase()
                    ) {
                      return <></>;
                    }
                    let extraRewardInfo;
                    if (stakedLPExtraRewardInfo) {
                      extraRewardInfo = stakedLPExtraRewardInfo.find(
                        (extraReward) => {
                          if (
                            extraReward?.tokenAddress?.toLowerCase() ===
                            reward.addr.toLowerCase()
                          )
                            return true;
                        }
                      );
                    }
                    return (
                      <Stack direction={"row"}>
                        <Box sx={{ marginRight: "10px" }}>{reward.symbol}</Box>
                        <Box>{extraRewardInfo?.amount || 0}</Box>
                      </Stack>
                    );
                  })}
              </Box>
            )}
          </AccordionDetails>
        </StyledAccordion>
        <StyledAccordion
          sx={{
            marginBottom: "20px",
            background: "rgb(42, 42, 42)",
            color: "#fff",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Stack width={"100%"} direction={"row"} textAlign={"left"}>
              <Box sx={{ fontSize: "17px", fontWeight: 700, flex: "1 1 0px" }}>
                Rewards
              </Box>
              <HeadInfo
                sx={{ flex: "1 1 0px" }}
                head={"Claimable (USD value)"}
                content={`$${lockerReleasableInfo.value?.toFixed(2) || 0}`}
              />
              <HeadInfo
                sx={{ flex: "1 1 0px" }}
                head={"Unlocking reward"}
                content={`$${tokenLockerValue?.toFixed(2) || 0}`}
              />
              <FunctionButton
                burstColor={lockerReleasableInfo.count > 0 ? "yellow" : "black"}
                sx={{
                  flex: "1 1 0px",
                  maxWidth: "120px",
                  marginX: "8px",
                  height: "41px",
                  color: "#000",
                }}
                onClick={async () => {
                  try {
                    const transaction = await burstLockerContract.releaseToken(
                      wallet.accounts[0].address
                    );

                    const receipt = await transaction.wait();
                    if (receipt.status === 1) {
                      getTotalClaimable();
                    } else {
                      console.error(
                        "Transaction failed. Error message:",
                        receipt.statusText
                      );
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }}
                variant="contained"
              >
                Claim
              </FunctionButton>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack
              direction={"row"}
              // sx={{ justifyContent: tokenLockerValue > 0 ? "space-around" : "" }}
              textAlign={"left"}
            >
              {tokenLockerValue > 0 && (
                <Box sx={{ width: "40%" }}>
                  <Box textAlign={"left"} sx={{ marginBottom: "20px" }}>
                    Unlocking Progress
                  </Box>
                  {broomBalanceInLockerRes &&
                    broomBalanceInLockerRes.lockData.length > 0 && (
                      <Stack direction={"row"} sx={{ fontFamily: "Rajdhani" }}>
                        <Box sx={{ flex: "1 1 0px" }}>Amount</Box>
                        <Box sx={{ flex: "1 1 50px" }}> UnlockTime</Box>
                        <Box sx={{ flex: "1 1 0px" }}> Remaining</Box>
                      </Stack>
                    )}
                  {broomBalanceInLockerRes &&
                    broomBalanceInLockerRes.lockData.length > 0 &&
                    broomBalanceInLockerRes.lockData.map((data, index) => {
                      return (
                        <Stack
                          key={index}
                          direction={"row"}
                          sx={{ marginBottom: "20px" }}
                        >
                          <Box sx={{ flex: "1 1 0px" }}>
                            {Number(BigInt(data.amount) / 10n ** 16n) / 100}
                          </Box>
                          <Box sx={{ flex: "1 1 50px" }}>
                            {new Date(data.endTime * 1000).toLocaleString()}
                          </Box>
                          <Box sx={{ flex: "1 1 0px" }}>
                            {` ${calculateWeeksRemaining(
                              data.endTime * 1000
                            )} Weeks`}
                          </Box>
                        </Stack>
                      );
                    })}
                </Box>
              )}
            </Stack>
          </AccordionDetails>
        </StyledAccordion>
        <StyledAccordion
          sx={{
            background: "rgb(42, 42, 42)",
            color: "#fff",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Stack width={"100%"} direction={"row"} textAlign={"left"}>
              <Box sx={{ fontSize: "17px", fontWeight: 700, flex: "1 1 0px" }}>
                Airdrop
              </Box>

              <FunctionButton
                burstColor={"black"}
                sx={{
                  flex: "1 1 0px",
                  maxWidth: "120px",
                  marginX: "8px",
                  height: "41px",
                  color: "#000",
                }}
                onClick={async () => {
                  try {
                  } catch (error) {
                    console.log(error);
                  }
                }}
                variant="contained"
              >
                Claim
              </FunctionButton>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Box
            // sx={{ justifyContent: tokenLockerValue > 0 ? "space-around" : "" }}
            >
              <Stack direction={"row"} sx={{ marginBottom: "12px" }}>
                <img
                  src={curveIcon}
                  style={{ width: "24px", marginRight: "0.5rem" }}
                />
                {`100 = $ 0`}
              </Stack>
              <Stack direction={"row"}>
                <img
                  src={convexIcon}
                  style={{ width: "24px", marginRight: "0.5rem" }}
                />
                {`100 = $ 0`}
              </Stack>
            </Box>
          </AccordionDetails>
        </StyledAccordion>
      </Box>
    </Layout>
  );
};

export default Claim;
