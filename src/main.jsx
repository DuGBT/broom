import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Web3OnboardProvider, init } from "@web3-onboard/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import injectedModule from "@web3-onboard/injected-wallets";
import Landing from "./Landing.jsx";
import Admin from "./Admin";
const INFURA_KEY = "b0caabe4b0bc4153a499536aa88a053d";
const injected = injectedModule();

const wallets = [injected];
const chains = [
  {
    id: "0x1",
    token: "ETH",
    label: "Ethereum Mainnet",
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  },
  {
    id: "0x5",
    token: "ETH",
    label: "Goerli",
    rpcUrl: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  },
];

const web3Onboard = init({
  connect: {
    autoConnectAllPreviousWallet: true,
  },
  wallets,
  chains,
});
const router = createBrowserRouter([
  {
    path: "/app",
    element: <App />,
  },
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/broom-admin",
    element: <Admin />,
  },
]);
ReactDOM.createRoot(document.getElementById("root")).render(
  <Web3OnboardProvider web3Onboard={web3Onboard}>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </Web3OnboardProvider>
);
