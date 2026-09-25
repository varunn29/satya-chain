import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CONTRACT_ADDRESS } from "../config/constants";
import { verifyCertificate } from "../utils/contractHelper";
import { getIPFSUrl } from "../utils/ipfs";

export default function Verify() {
  const { certId: urlCertId } = useParams();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState(urlCertId || "");
  const [cert, setCert] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (urlCertId) verify(urlCertId);
    // eslint-disable-next-line
  }, [urlCertId]);

  async function verify(id) {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      setCert(null);

      const result = await verifyCertificate(id);

      if (!result.isValid) {
        setError("Certificate not found or has been revoked");
        return;
      }
      setCert({ id, ...result });
    } catch (e) {
      console.error(e);
      let msg = e.message;
      if (msg.includes("Contract not deployed")) {
        msg = "Contract not deployed yet — partner ka wait karo";
      } else if (msg.includes("could not decode")) {
        msg = "Certificate not found on blockchain — it may be fake";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchId.trim()) navigate(`/verify/${searchId.trim()}`);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="text-center mb-10 animate-slide-up">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 mb-4">
          <span className="text-lg">🔍</span>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Blockchain Verification
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
          Verify <span className="gradient-text">Certificate</span>
        </h1>
        <p className="text-lg text-slate-600">
          Enter certificate ID or scan the QR code
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={handleSearch}
        className="card mb-6 flex gap-3 flex-wrap animate-slide-up"
        style={{ animationDelay: "0.1s" }}
      >
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Enter Certificate ID (e.g., 2024-001)"
          className="input-field flex-1 min-w-[200px]"
          disabled={loading}
        />
        <button
          type="submit"
          className="btn-primary whitespace-nowrap"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Verifying
            </>
          ) : (
            <>🔍 Verify</>
          )}
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 animate-fade-in">
          <div className="inline-block w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-5 text-slate-600 font-medium">
            Verifying on blockchain...
          </p>
        </div>
      )}

      {/* NOT VERIFIED */}
      {error && !loading && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-10 text-center animate-scale-in">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-3xl font-extrabold text-rose-600 mb-3">
            NOT VERIFIED
          </h2>
          <p className="text-slate-700 mb-4 text-lg">{error}</p>
          <div className="bg-white rounded-xl p-4 inline-block">
            <p className="text-sm text-slate-500">
              This certificate does not exist on blockchain or has been revoked.
            </p>
          </div>
        </div>
      )}

      {/* VERIFIED */}
      {cert && !loading && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-8 animate-scale-in">
          <div className="text-center mb-6">
            <div className="text-7xl mb-3">✅</div>
            <h2 className="text-3xl font-extrabold text-emerald-600 mb-2">
              VERIFIED
            </h2>
            <p className="text-slate-600">Certificate is authentic</p>
          </div>

          <div className="bg-white rounded-xl p-6 space-y-3 shadow-sm">
            {[
              ["Student Name", cert.studentName],
              ["Course", cert.course],
              ["Certificate ID", cert.id],
              ["Issue Date", cert.issueDate]
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between border-b border-slate-100 pb-3 gap-4 last:border-0"
              >
                <span className="font-medium text-slate-500">{label}:</span>
                <span className="text-slate-900 font-semibold text-right">
                  {value}
                </span>
              </div>
            ))}

            <div className="pt-3 flex flex-col gap-3">
              <a
                href={getIPFSUrl(cert.ipfsHash)}
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full"
              >
                📄 View Original PDF on IPFS
              </a>
              <a
                href={`https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
                className="text-center text-sm text-indigo-600 hover:underline font-medium"
              >
                🔗 View on PolygonScan
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!cert && !error && !loading && (
        <div className="text-center py-16 card animate-fade-in">
          <div className="text-6xl mb-4 animate-float">🔎</div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            Ready to verify
          </h3>
          <p className="text-slate-500">
            Enter a certificate ID above to verify
          </p>
        </div>
      )}
    </div>
  );
}