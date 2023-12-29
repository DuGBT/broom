import { useState, useEffect } from "react";
import broomLanding from "./assets/broomlanding.jpg";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useAccountCenter } from "@web3-onboard/react";
import sweepButtonOutline from "./assets/sweepButtonOutline.svg";
import sweep from "./assets/sweep.svg";

const Landing = () => {
  const updateAccountCenter = useAccountCenter();

  useEffect(() => {
    updateAccountCenter({ enabled: false });
  }, []);
  return (
    <Box sx={{ height: "100vh", position: "relative" }}>
      <img style={{ width: "100vw", height: "100vh" }} src={broomLanding} />
      <Button
        onClick={() => {
          window.location.href = "/app";
        }}
        sx={{
          zIndex: "200",
          background: "rgba(232, 214, 152, 1)!important",
          outline: "none !important",
          color: "#000",
          fontFamily: "Roboto Condensed Medium",
          fontWeight: "500",
          position: "absolute",
          bottom: "100px",
          left: "50%",
          transform: "translate(-55%)",
          height: "33px",
          padding: "6px 16px",
        }}
      >
        <img style={{ width: "21px" }} src={sweep} />
        SWEEP NOW
      </Button>
      <img
        style={{
          background: "rgba(232, 214, 152, 1)!important",
          outline: "none !important",
          color: "#000",
          fontFamily: "Roboto Condensed Medium",
          fontWeight: "500",
          position: "absolute",
          bottom: "80px",
          left: "50%",
          transform: "translate(-55%)",
        }}
        src={sweepButtonOutline}
      ></img>
    </Box>
  );
};

export default Landing;
