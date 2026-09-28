const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

export async function uploadToIPFS(file) {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT missing — .env mein daalo");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`IPFS upload failed: ${err}`);
  }

  const data = await res.json();
  return data.IpfsHash;
}

// ============================================
// UPLOAD JSON (for NFT metadata)
// ============================================
export async function uploadJSONToIPFS(jsonObject, fileName = "metadata.json") {
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT missing — .env mein daalo");
  }

  const body = {
    pinataMetadata: { name: fileName },
    pinataContent: jsonObject,
  };

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`IPFS JSON upload failed: ${err}`);
  }

  const data = await res.json();
  return `ipfs://${data.IpfsHash}`;
}

export function getIPFSUrl(hash) {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}