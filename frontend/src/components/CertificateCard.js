export default function CertificateCard({ cert, onDownload, onViewIPFS }) {
  return (
    <div className="card hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-blue-900">
            {cert.studentName}
          </h3>
          <p className="text-gray-600">{cert.course}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            cert.isValid
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {cert.isValid ? "✓ VERIFIED" : "✗ REVOKED"}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p>
          <strong>ID:</strong> {cert.certId}
        </p>
        <p>
          <strong>Date:</strong> {cert.issueDate}
        </p>
      </div>

      <div className="flex gap-2">
        {onDownload && (
          <button
            onClick={() => onDownload(cert)}
            className="flex-1 btn-primary text-sm py-2"
          >
            📄 Download
          </button>
        )}
        {onViewIPFS && (
          <button
            onClick={() => onViewIPFS(cert)}
            className="flex-1 btn-secondary text-sm py-2"
          >
            🔗 IPFS
          </button>
        )}
      </div>
    </div>
  );
}