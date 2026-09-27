import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from "../config/constants";
import { connectWallet } from "./wallet";

// ============================================
// CONTRACT INSTANCE HELPERS
// ============================================

function validateConfig(sector) {
  const address = CONTRACT_ADDRESSES[sector];

  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(`Contract not deployed for sector: ${sector}`);
  }

  if (!address.startsWith("0x") || address.length !== 42) {
    throw new Error("Invalid contract address format.");
  }

  return true;
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export async function getContract(sector) {
  validateConfig(sector);
  try {
    const { signer } = await connectWallet();
    return new ethers.Contract(
      CONTRACT_ADDRESSES[sector],
      CONTRACT_ABIS[sector],
      signer
    );
  } catch (error) {
    throw new Error(`Unable to connect wallet: ${getErrorMessage(error)}`);
  }
}

export async function getReadOnlyContract(sector) {
  validateConfig(sector);
  try {
    if (!window.ethereum) throw new Error("MetaMask required");
    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(
      CONTRACT_ADDRESSES[sector],
      CONTRACT_ABIS[sector],
      provider
    );
  } catch (error) {
    throw new Error(
      `Unable to connect to wallet provider: ${getErrorMessage(error)}`
    );
  }
}

// ============================================
// ADMIN CHECK (Multi-Admin Security)
// ============================================

export async function checkIsAdmin(sector) {
  try {
    const contract = await getReadOnlyContract(sector);
    const adminAddress = await contract.admin();

    if (!window.ethereum) {
      return { isAdmin: false, adminAddress, currentUser: null };
    }

    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    const currentUser = accounts[0] || null;

    const isAdmin =
      currentUser &&
      adminAddress &&
      currentUser.toLowerCase() === adminAddress.toLowerCase();

    return { isAdmin, adminAddress, currentUser };
  } catch (error) {
    console.warn("Admin check failed:", error.message);
    return { isAdmin: false, adminAddress: null, currentUser: null };
  }
}

// ============================================
// EDUCATION — ISSUE / VERIFY
// ============================================

export async function issueCertificate(
  certId,
  studentName,
  course,
  ipfsHash,
  studentWallet
) {
  try {
    const contract = await getContract("education");
    const tx = await contract.issue(
      certId,
      studentName,
      course,
      ipfsHash,
      studentWallet
    );
    await tx.wait();
    return tx.hash;
  } catch (error) {
    throw new Error(`Failed to issue certificate: ${getErrorMessage(error)}`);
  }
}

export async function verifyCertificate(certId) {
  try {
    const contract = await getReadOnlyContract("education");
    const result = await contract.verify(certId);
    return {
      holderName: result[0],
      type: result[1],
      ipfsHash: result[2],
      issueDate: new Date(Number(result[3]) * 1000).toLocaleDateString(
        "en-IN",
        { year: "numeric", month: "long", day: "numeric" }
      ),
      isValid: result[4],
    };
  } catch (error) {
    throw new Error(`Failed to verify certificate: ${getErrorMessage(error)}`);
  }
}

export async function getCertificatesByStudent(studentAddress) {
  try {
    const contract = await getReadOnlyContract("education");
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
            { year: "numeric", month: "long", day: "numeric" }
          ),
          isValid: cert[4],
        };
      })
    );
  } catch (error) {
    throw error;
  }
}

// ============================================
// GOVERNMENT — ISSUE / VERIFY
// ============================================

export async function issueGovernmentID(
  id,
  idType,
  holderName,
  ipfsHash,
  holderWallet
) {
  try {
    const contract = await getContract("government");
    const tx = await contract.issue(
      id,
      idType,
      holderName,
      ipfsHash,
      holderWallet
    );
    await tx.wait();
    return tx.hash;
  } catch (error) {
    throw new Error(`Failed to issue ID: ${getErrorMessage(error)}`);
  }
}

export async function verifyGovernmentID(id) {
  try {
    const contract = await getReadOnlyContract("government");
    const result = await contract.verify(id);
    return {
      holderName: result[0],
      type: result[1],
      ipfsHash: result[2],
      issueDate: new Date(Number(result[3]) * 1000).toLocaleDateString(
        "en-IN",
        { year: "numeric", month: "long", day: "numeric" }
      ),
      isValid: result[4],
    };
  } catch (error) {
    throw new Error(`Failed to verify ID: ${getErrorMessage(error)}`);
  }
}

// ============================================
// HEALTHCARE — ISSUE / VERIFY
// ============================================

export async function issueHealthcareRecord(
  id,
  recordType,
  patientName,
  doctorName,
  ipfsHash,
  patientWallet
) {
  try {
    const contract = await getContract("healthcare");
    const tx = await contract.issue(
      id,
      recordType,
      patientName,
      doctorName,
      ipfsHash,
      patientWallet
    );
    await tx.wait();
    return tx.hash;
  } catch (error) {
    throw new Error(`Failed to issue health record: ${getErrorMessage(error)}`);
  }
}

export async function verifyHealthcareRecord(id) {
  try {
    const contract = await getReadOnlyContract("healthcare");
    const result = await contract.verify(id);
    return {
      holderName: result[0],
      type: result[1],
      doctorName: result[2],
      ipfsHash: result[3],
      issueDate: new Date(Number(result[4]) * 1000).toLocaleDateString(
        "en-IN",
        { year: "numeric", month: "long", day: "numeric" }
      ),
      isValid: result[5],
    };
  } catch (error) {
    throw new Error(
      `Failed to verify health record: ${getErrorMessage(error)}`
    );
  }
}

// ============================================
// LAND — ISSUE / VERIFY
// ============================================

export async function issueLandRecord(
  id,
  deedType,
  ownerName,
  propertyAddress,
  ipfsHash,
  ownerWallet
) {
  try {
    const contract = await getContract("land");
    const tx = await contract.issue(
      id,
      deedType,
      ownerName,
      propertyAddress,
      ipfsHash,
      ownerWallet
    );
    await tx.wait();
    return tx.hash;
  } catch (error) {
    throw new Error(`Failed to issue land record: ${getErrorMessage(error)}`);
  }
}

export async function verifyLandRecord(id) {
  try {
    const contract = await getReadOnlyContract("land");
    const result = await contract.verify(id);
    return {
      holderName: result[0],
      type: result[1],
      propertyAddress: result[2],
      ipfsHash: result[3],
      issueDate: new Date(Number(result[4]) * 1000).toLocaleDateString(
        "en-IN",
        { year: "numeric", month: "long", day: "numeric" }
      ),
      isValid: result[5],
    };
  } catch (error) {
    throw new Error(`Failed to verify land record: ${getErrorMessage(error)}`);
  }
}

// ============================================
// GENERIC SECTOR HELPERS
// ============================================

export async function issueRecord(sector, payload) {
  switch (sector) {
    case "education":
      return issueCertificate(
        payload.id,
        payload.holderName,
        payload.extra1,
        payload.ipfsHash,
        payload.wallet
      );
    case "government":
      return issueGovernmentID(
        payload.id,
        payload.extra1,
        payload.holderName,
        payload.ipfsHash,
        payload.wallet
      );
    case "healthcare":
      return issueHealthcareRecord(
        payload.id,
        payload.extra1,
        payload.holderName,
        payload.extra2,
        payload.ipfsHash,
        payload.wallet
      );
    case "land":
      return issueLandRecord(
        payload.id,
        payload.extra1,
        payload.holderName,
        payload.extra2,
        payload.ipfsHash,
        payload.wallet
      );
    default:
      throw new Error(`Unknown sector: ${sector}`);
  }
}

export async function verifyRecord(sector, id) {
  switch (sector) {
    case "education":
      return verifyCertificate(id);
    case "government":
      return verifyGovernmentID(id);
    case "healthcare":
      return verifyHealthcareRecord(id);
    case "land":
      return verifyLandRecord(id);
    default:
      throw new Error(`Unknown sector: ${sector}`);
  }
}

// ============================================
// REVOKE (Admin only)
// ============================================

export async function revokeRecord(sector, id) {
  try {
    const contract = await getContract(sector);
    const tx = await contract.revoke(id);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    throw new Error(`Failed to revoke: ${getErrorMessage(error)}`);
  }
}

// ============================================
// BACKWARDS COMPATIBILITY
// ============================================

export async function revokeCertificate(certId) {
  return revokeRecord("education", certId);
}

// ============================================
// STATS (for Dashboard)
// ============================================

export async function getSectorStats(sector) {
  try {
    const contract = await getReadOnlyContract(sector);
    const total = Number(await contract.total());

    let revokedCount = 0;
    try {
      revokedCount = Number(await contract.revokedCount());
    } catch {
      revokedCount = 0;
    }

    return {
      total,
      revoked: revokedCount,
      verified: total - revokedCount,
    };
  } catch (error) {
    console.warn(`Stats error for ${sector}:`, error.message);
    return { total: 0, verified: 0, revoked: 0 };
  }
}