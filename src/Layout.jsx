import { useState, useEffect } from "react";
import "./App.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import SweeperIcon from "./assets/SweeperDAO.svg";
import bag from "./assets/bag.svg";
import { useConnectWallet, useAccountCenter } from "@web3-onboard/react";
import * as ethers from "ethers";
import { ABI } from "./broomAbi";
import { erc20TokenAbi } from "./erc20Token";
import { Link } from "react-router-dom";
function bigIntToNumber(param, calMulti) {
  if (calMulti) {
    return Number(BigInt(param)) / 10000;
  }
  return Number(BigInt(param) / 10n ** 16n) / 100;
}
function Layout({ children }) {
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const [contract, setContract] = useState();

  const updateAccountCenter = useAccountCenter();

  useEffect(() => {
    updateAccountCenter({ enabled: false });
  }, []);

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

        setContract(Contract.connect(signer));
      }
    }
    Connect();
  }, [wallet]);

  return (
    <Box sx={{ padding: "1rem" }}>
      <Stack
        direction={"row"}
        sx={{ padding: "0 5%", justifyContent: "space-between" }}
      >
        <Box textAlign={"left"} sx={{ display: "flex" }}>
          <img src={SweeperIcon} />
          <Link to={"/app"}>
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
          </Link>
          <Link to={"/claim"}>
            <Box
              sx={{
                color: "rgba(232, 214, 152, 1)",
                margin: "0 1rem",
                cursor: "pointer",
              }}
              onClick={() => {
                //   setShowClaimModal(true);
              }}
            >
              CLAIM REWARDS
            </Box>
          </Link>
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
      </Stack>
      {children}
    </Box>
  );
}

export default Layout;
