export default function GovernmentCredentialCard({ credential, onViewIPFS }) {
  return (
    <div className="card hover:shadow-lg transition relative overflow-hidden">
      {/* Ribbon — different from NFT ribbons */}
      <div className="absolute top-0 right-0 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider">
        🆔 CREDENTIAL
      </div>

      <div className="pr-24 mb-4">
        <h3 className="text-xl font-bold text-cyan-900">
          {credential.holderName}
        </h3>
        <p className="text-gray-600 text-sm">{credential.idType}</p>
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p>
          <strong>ID:</strong> {credential.id}
        </p>
        <p>
          <strong>Date:</strong> {credential.issueDate}
        </p>
        <p className="text-cyan-700">
          <strong>Model:</strong> Verifiable Credential (VC-style)
        </p>
      </div>

      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-2 mb-4 text-xs text-cyan-800">
        ⚡ Issuer-signed record · Holder-held · Verifier-checked on-chain.
        <br />
        <span className="text-cyan-600">
          No NFT — production systems use W3C Verifiable Credentials.
        </span>
      </div>

      <div className="flex gap-2">
        {onViewIPFS && (
          <button
            onClick={() => onViewIPFS(credential)}
            className="flex-1 btn-secondary text-sm py-2"
          >
            🔗 IPFS
          </button>
        )}
      </div>
    </div>
  );
}