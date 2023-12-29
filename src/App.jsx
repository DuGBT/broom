import { useState, useEffect } from "react";
import "./App.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Modal from "@mui/material/Modal";
import SweeperIcon from "./assets/SweeperDAO.svg";
import sweep from "./assets/sweep.svg";
import bag from "./assets/bag.svg";
import { styled } from "@mui/material";
import { useConnectWallet, useAccountCenter } from "@web3-onboard/react";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [point, setPoint] = useState(10000);
  const [multiplier, setMultiplier] = useState(1.01);
  const [tab, setTab] = useState("deposit");
  const [value, setValue] = useState(0);
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const updateAccountCenter = useAccountCenter();

  const handleClose = () => {
    setShowModal(false);
  };
  useEffect(() => {
    updateAccountCenter({ enabled: false });
  }, []);
  useEffect(() => {
    setInterval(() => {
      setPoint((point) => {
        const result = point + 1000 / 3600;
        return +result.toFixed(2);
      });
    }, 1000);
  }, [multiplier]);
  return (
    <Box sx={{ padding: "1rem" }}>
      <Stack
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
            CLAIM
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
      </Stack>
      <Box
        sx={{
          minHeight: "100vh",
          padding: "0 200px",
          background: "#000",
          color: "#fff",
          textAlign: "center",
          paddingTop: "1rem",
        }}
      >
        <Stack direction={"row"} sx={{ marginTop: "150px" }}>
          <Box sx={{ width: "400px", textAlign: "left" }}>
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
              HOLD $BROOM TO EARN{" "}
              <span style={{ color: "rgba(232, 214, 152, 1)" }}>REDACTED</span>
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
              border: "1px solid rgba(212, 207, 165, 0.7)",
              borderLeft: "none",
              borderRight: "none",
              fontFamily: " Roboto Condensed",
              color: "rgba(146, 146, 146, 1)",
              fontSize: "16px",
              textTransform: "uppercase",
              textAlign: "left",
              padding: "12px 0",
              // flex: "0 1 500px",
            }}
          >
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
                {wallet ? point : "--"}
              </Box>
            </Box>
            <Stack
              direction={"row"}
              sx={{
                padding: "12px 0",
                borderTop: "1px solid rgba(212, 207, 165, 0.7)",
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
                <Box>BLUR DEPOSITED</Box>
                <Box
                  sx={{
                    fontFamily: " Roboto Condensed Medium",
                    fontSize: "24px",
                    color: "#fff",
                  }}
                >
                  {wallet ? 100 : "--"}
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
                  {wallet ? 10000 : "--"}
                </Box>
                <Box>Earning {wallet ? 1000 : "--"} PTS Per Hour</Box>
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
                  {wallet ? "1X" : "--"}
                </Box>
                <Box>Increases 0.5x Per Month</Box>
              </Box>
            </Stack>
          </Box>
        </Stack>
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
              border: "1px solid rgb(48,48,48)",
              color: "#fff",
              padding: "1rem",
            }}
          >
            <Box>DEPOSIT $BLUR TO EARN</Box>
            <Stack direction={"row"}>
              <Button
                sx={{
                  flex: "1 1 auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box>0</Box>
                <Box>blur wallet balance</Box>
              </Button>
              <Button
                sx={{
                  flex: "1 1 auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box>0</Box>
                <Box>blur deposited</Box>
              </Button>
            </Stack>
            <Stack direction={"row"} textAlign={"center"}>
              <Box sx={{ flex: "1 1 auto" }}>deposit blur to hold</Box>
              <Box sx={{ flex: "1 1 auto" }}>withdraw blur</Box>
            </Stack>
            <Stack direction={"row"} justifyContent={"center"}>
              <input
                style={{
                  fontSize: "64px",
                  color: "orange",
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
            <Box textAlign={"center"}>
              <Button>Deposit Blur</Button>
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
              >
                <img src={bag} />
                CLAIM
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}

export default App;
