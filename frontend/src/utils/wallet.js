import { ethers } from "ethers";
import { NETWORK } from "../config/constants";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask install karo!");
  }

  // ⭐ Force MetaMask popup har baar
  // Ye permissions maangta hai, aur user ko explicitly approve karna padta hai
  try {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }]
    });
  } catch (err) {
    // User ne reject kiya
    if (err.code === 4001) {
      throw new Error("Connection rejected by user");
    }
    // Agar method supported nahi hai toh ignore karo
    console.warn("wallet_requestPermissions not available:", err.message);
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  // Network check — Amoy pe switch karo agar nahi hai
  const targetChainId = "0x13882";
  if (network.chainId.toString() !== parseInt(targetChainId, 16).toString()) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK.chainId }],
      });
    } catch (switchError) {
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