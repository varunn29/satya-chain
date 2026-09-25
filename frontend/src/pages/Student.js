import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connectWallet, getCurrentAccount } from "../utils/wallet";
import { getCertificatesByStudent } from "../utils/contractHelper";
import { getIPFSUrl } from "../utils/ipfs";
import CertificateCard from "../components/CertificateCard";

export default function Student() {
  const [account, setAccount] = useState("");
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const manuallyDisconnected = localStorage.getItem("wallet_disconnected");
    if (!manuallyDisconnected) {
      getCurrentAccount().then((addr) => {
        if (addr) {
          setAccount(addr);
          fetchCerts(addr);
        }
      });
    }
    // eslint-disable-next-line
  }, []);

  async function handleConnect() {
    try {
      localStorage.removeItem("wallet_disconnected");
      const { address } = await connectWallet();
      setAccount(address);
      fetchCerts(address);
    } catch (e) {
      alert(e.message);
    }
  }

  async function fetchCerts(address) {
    try {
      setLoading(true);
      setError("");
      const data = await getCertificatesByStudent(address);
      setCerts(data);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDownload(cert) {
    window.open(getIPFSUrl(cert.ipfsHash), "_blank");
  }

  function handleViewIPFS(cert) {
    window.open(getIPFSUrl(cert.ipfsHash), "_blank");
  }

  // Not connected
  if (!account) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-8 text-center">
        <div className="card animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-4xl shadow-lg shadow-indigo-500/30">
            🔗
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
            Connect Your Wallet
          </h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Connect MetaMask to view your blockchain-verified certificates
          </p>
          <button onClick={handleConnect} className="btn-primary px-8 py-4">
            🔌 Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4 animate-slide-up">
        <div>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 mb-4">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Student Dashboard
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
            My <span className="gradient-text">Certificates</span>
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Wallet:</span>
            <span className="font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-xs break-all">
              {account}
            </span>
          </div>
        </div>
        <button
          onClick={() => fetchCerts(account)}
          disabled={loading}
          className="btn-ghost"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
              Loading
            </>
          ) : (
            <>🔄 Refresh</>
          )}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 animate-fade-in">
          <div className="inline-block w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-5 text-slate-600 font-medium">
            Fetching certificates...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 flex items-center gap-3 animate-fade-in">
          <span className="text-xl">⚠️</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && certs.length === 0 && (
        <div className="text-center py-16 card animate-scale-in">
          <div className="text-6xl mb-4 animate-float">📭</div>
          <h2 className="text-2xl font-bold text-slate-700 mb-3">
            No Certificates Yet
          </h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            You don't have any certificates issued to this wallet
          </p>
          <Link to="/university" className="btn-primary inline-flex">
            📝 Issue a Certificate
          </Link>
        </div>
      )}

      {/* Certificates Grid */}
      {!loading && certs.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certs.map((cert, i) => (
            <div
              key={cert.certId}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <CertificateCard
                cert={cert}
                onDownload={handleDownload}
                onViewIPFS={handleViewIPFS}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}