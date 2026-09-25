import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config/constants";
import { connectWallet } from "./wallet";

// ============================================
// CONTRACT INSTANCE HELPERS
// ============================================

function validateConfig() {
  const address = CONTRACT_ADDRESS;

  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error("Contract not deployed. Please set REACT_APP_CONTRACT_ADDRESS.");
  }

  if (!address.startsWith("0x") || address.length !== 42) {
    throw new Error("Invalid contract address format.");
  }

  return true;
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export async function getContract() {
  validateConfig();
  try {
    const { signer } = await connectWallet();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  } catch (error) {
    throw new Error(`Unable to connect wallet: ${getErrorMessage(error)}`);
  }
}

export async function getReadOnlyContract() {
  validateConfig();
  try {
    if (!window.ethereum) throw new Error("MetaMask required");
    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  } catch (error) {
    throw new Error(`Unable to connect to wallet provider: ${getErrorMessage(error)}`);
  }
}

// ============================================
// ISSUE CERTIFICATE (Admin only)
// ============================================

export async function issueCertificate(
  certId,
  studentName,
  course,
  ipfsHash,
  studentWallet
) {
  validateConfig();
  try {
    const contract = await getContract();
    const tx = await contract.issue(
      certId,
      studentName,
      course,
      ipfsHash,
      studentWallet
    );
    await tx.wait();
    return tx;
  } catch (error) {
    throw new Error(`Failed to issue certificate: ${getErrorMessage(error)}`);
  }
}

// ============================================
// VERIFY CERTIFICATE (Public read)
// ============================================

export async function verifyCertificate(certId) {
  validateConfig();
  try {
    const contract = await getReadOnlyContract();
    const result = await contract.verify(certId);
    return {
      studentName: result[0],
      course: result[1],
      ipfsHash: result[2],
      issueDate: new Date(Number(result[3]) * 1000).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
      isValid: result[4]
    };
  } catch (error) {
    throw new Error(`Failed to verify certificate: ${getErrorMessage(error)}`);
  }
}

// ============================================
// GET CERTIFICATES BY STUDENT (Public read)
// ============================================

export async function getCertificatesByStudent(studentAddress) {
  validateConfig();
  try {
    const contract = await getReadOnlyContract();
    const ids = await contract.getCertificatesByStudent(studentAddress);
    return await Promise.all(
      ids.map(async (certId) => {
        const cert = await contract.verify(certId);
        return {
          certId,
          studentName: cert[0],
          course: cert[1],
          ipfsHash: cert[2],
          issueDate: new Date(Number(cert[3]) * 1000).toLocaleDateString(
            "en-IN",
            {
              year: "numeric",
              month: "long",
              day: "numeric"
            }
          ),
          isValid: cert[4]
        };
      })
    );
  } catch (error) {
    throw error;
  }
}

// ============================================
// REVOKE CERTIFICATE (Admin only)
// ============================================

export async function revokeCertificate(certId) {
  validateConfig();
  try {
    const contract = await getContract();
    const tx = await contract.revoke(certId);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    throw new Error(`Failed to revoke certificate: ${getErrorMessage(error)}`);
  }
}