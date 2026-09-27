import { ethers } from "ethers";
import { NETWORK } from "../config/constants";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask install karo!");
  }

  // Force MetaMask popup
  try {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }]
    });
  } catch (err) {
    if (err.code === 4001) {
      throw new Error("Connection rejected by user");
    }
    console.warn("wallet_requestPermissions not available:", err.message);
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  // Network check — Amoy pe switch karo agar nahi hai
  const targetChainIdDecimal = parseInt(NETWORK.chainId, 16); // 0x13882 → 80002
  
  if (Number(network.chainId) !== targetChainIdDecimal) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainId }], // "0x13882"
      });
    } catch (switchError) {
      // Chain add nahi hai toh add karo
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [NETWORK],
        });
      } else {
        throw switchError;
      }
    }
  }

  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { signer, address, provider };
}

export async function getCurrentAccount() {
  if (!window.ethereum) return null;
  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    return accounts[0] || null;
  } catch {
    return null;
  }
}