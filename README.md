# SatyaChain

Multi-sector blockchain records with NFT-backed assets.

## Overview

SatyaChain issues and verifies records across four sectors, each with a distinct on-chain model:

| Sector | Model | Standard |
|--------|-------|----------|
| 🎓 Education | Soulbound NFT (non-transferable) | ERC-721 + ERC-5192 |
| 🆔 Government | On-chain credential (no NFT) | Custom registry |
| 🏠 Land | Transferable NFT | ERC-721 + Enumerable |
| 🏥 Healthcare | Soulbound NFT with access control | ERC-721 + custom ACL |

## Architecture

**Backend (Hardhat, Solidity 0.8.28, OpenZeppelin v5):**

- `CertificateRegistry.sol` — education records
- `GovernmentRegistry.sol` — government credentials
- `HealthcareRegistry.sol` — healthcare records
- `LandRegistry.sol` — land records
- `CertificateNFT.sol` — soulbound education certificates
- `LandDeedNFT.sol` — transferable land deeds
- `HealthRecordNFT.sol` — soulbound health records with patient-controlled access

**Frontend (React):**

- `Dashboard` — real-time on-chain stats per sector
- `University` — issue records (auto-mints NFTs)
- `Verify` — verify by ID + admin-only revoke
- `Student` — view owned certificates, deeds, health records

**Storage:** PDFs and NFT metadata pinned to IPFS via Pinata.

## Running Locally

### 1. Start the local Hardhat node

```bash
cd backend
npx hardhat node