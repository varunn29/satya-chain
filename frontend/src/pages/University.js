import { useState } from "react";
import { issueCertificate } from "../utils/contractHelper";
import { uploadToIPFS } from "../utils/ipfs";
import { generateCertificatePDF, downloadPDF } from "../utils/pdfGenerator";

export default function University() {
  const [form, setForm] = useState({
    certId: "",
    studentName: "",
    studentWallet: "",
    course: "",
    university: "Mumbai University"
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [lastCert, setLastCert] = useState(null);

  function updateField(key, value) {
    setForm({ ...form, [key]: value });
  }

  function validate() {
    if (!form.certId.trim()) return "Certificate ID required";
    if (!form.studentName.trim()) return "Student name required";
    if (!/^0x[0-9a-fA-F]{40}$/.test(form.studentWallet.trim())) {
      return "Valid student wallet address required";
    }
    if (!form.course.trim()) return "Course required";
    return null;
  }

  async function handleIssue() {
    const err = validate();
    if (err) return setStatus({ type: "error", msg: err });

    try {
      setLoading(true);

      setStatus({ type: "info", msg: "📄 Generating PDF..." });
      const pdfBlob = await generateCertificatePDF(form);
      downloadPDF(pdfBlob, `${form.certId}.pdf`);

      setStatus({ type: "info", msg: "☁️ Uploading to IPFS..." });
      const pdfFile = new File([pdfBlob], `${form.certId}.pdf`, {
        type: "application/pdf"
      });
      const ipfsHash = await uploadToIPFS(pdfFile);

      setStatus({ type: "info", msg: "⛓️ Storing on blockchain..." });
      const txHash = await issueCertificate(
        form.certId,
        form.studentName,
        form.course,
        ipfsHash,
        form.studentWallet
      );

      setLastCert({ ...form, ipfsHash, txHash });
      setStatus({
        type: "success",
        msg: "✅ Certificate issued successfully! PDF downloaded."
      });
      setForm({
        certId: "",
        studentName: "",
        studentWallet: "",
        course: "",
        university: "Mumbai University"
      });
    } catch (e) {
      console.error(e);
      let msg = e.message;
      if (msg.includes("user rejected")) msg = "Transaction cancelled";
      if (msg.includes("Not admin")) msg = "Only admin wallet can issue";
      if (msg.includes("ID exists")) msg = "Certificate ID already exists";
      if (msg.includes("Pinata") || msg.includes("IPFS"))
        msg = "PDF downloaded ✓ — but IPFS upload failed (check Pinata JWT)";
      if (msg.includes("Contract not deployed"))
        msg = "PDF downloaded ✓ — but contract not deployed yet";
      setStatus({ type: "error", msg: `⚠️ ${msg}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 mb-4">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            University Panel
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
          Issue New{" "}
          <span className="gradient-text">Certificate</span>
        </h1>
        <p className="text-lg text-slate-600">
          Fill the details — certificate will be stored on blockchain + IPFS
        </p>
      </div>

      {/* Form Card */}
      <div className="card space-y-5 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Certificate ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.certId}
              onChange={(e) => updateField("certId", e.target.value)}
              placeholder="2024-001"
              className="input-field"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              University
            </label>
            <input
              type="text"
              value={form.university}
              onChange={(e) => updateField("university", e.target.value)}
              className="input-field"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Student Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={form.studentName}
            onChange={(e) => updateField("studentName", e.target.value)}
            placeholder="Rahul Sharma"
            className="input-field"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Course <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={form.course}
            onChange={(e) => updateField("course", e.target.value)}
            placeholder="B.Tech Computer Science"
            className="input-field"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            University Wallet Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={form.studentWallet}
            onChange={(e) => updateField("studentWallet", e.target.value)}
            placeholder="University Wallet Address (0x...)"
            className="input-field"
            disabled={loading}
          />
        </div>

        <button
          onClick={handleIssue}
          disabled={loading}
          className="btn-primary w-full py-4 text-base"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Processing...
            </>
          ) : (
            <>🎉 Generate & Store Certificate</>
          )}
        </button>

        {status.msg && (
          <div
            className={`p-4 rounded-xl text-sm font-medium flex items-start gap-3 ${
              status.type === "error"
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : status.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
            }`}
          >
            <span>{status.msg}</span>
          </div>
        )}
      </div>

      {/* Last Certificate Info */}
      {lastCert && (
        <div className="card mt-6 border-emerald-200 bg-emerald-50/50 animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎉</span>
            <h3 className="font-bold text-emerald-900 text-lg">
              Last Issued Certificate
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Certificate ID
              </div>
              <div className="font-semibold text-slate-900">{lastCert.certId}</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                Student
              </div>
              <div className="font-semibold text-slate-900">
                {lastCert.studentName}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-emerald-100 md:col-span-2">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                IPFS Hash
              </div>
              <div className="font-mono text-xs text-indigo-600 break-all">
                {lastCert.ipfsHash}
              </div>
            </div>
            {lastCert.txHash && (
              <div className="bg-white rounded-lg p-3 border border-emerald-100 md:col-span-2">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Transaction
                </div>
                <a
                  href={`https://amoy.polygonscan.com/tx/${lastCert.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-indigo-600 break-all hover:underline"
                >
                  {lastCert.txHash}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3 animate-fade-in">
        <span className="text-xl">ℹ️</span>
        <p className="text-sm text-indigo-900 leading-relaxed">
          <strong>Note:</strong> Only the university admin wallet can issue
          certificates. Make sure your MetaMask is connected with the admin
          account.
        </p>
      </div>
    </div>
  );
}