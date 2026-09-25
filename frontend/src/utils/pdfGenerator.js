import jsPDF from "jspdf";
import QRCode from "qrcode";

export async function generateCertificatePDF(data) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const pageWidth = 297;
  const pageHeight = 210;
  const centerX = pageWidth / 2;

  // ============================================
  // COLOR PALETTE
  // ============================================
  const colors = {
    indigo: [79, 70, 229],
    indigoDeep: [55, 48, 163],
    indigoLight: [129, 140, 248],
    cyan: [6, 182, 212],
    cyanDeep: [8, 145, 178],
    slate900: [15, 23, 42],
    slate800: [30, 41, 59],
    slate600: [71, 85, 105],
    slate500: [100, 116, 139],
    slate400: [148, 163, 184],
    slate300: [203, 213, 225],
    slate100: [241, 245, 249],
    slate50: [248, 250, 252],
    white: [255, 255, 255],
  };

  // ============================================
  // HELPER: Draw tracked text (letter spacing)
  // ============================================
  function drawTrackedText(text, x, y, tracking = 1, options = {}) {
    const { align = "left", fontSize = 10, font = "helvetica", style = "normal", color } = options;
    
    doc.setFontSize(fontSize);
    doc.setFont(font, style);
    if (color) doc.setTextColor(...color);

    if (align === "center") {
      // Calculate total width
      const textWidth = doc.getTextWidth(text);
      const totalWidth = textWidth + (text.length - 1) * tracking;
      let currentX = x - totalWidth / 2;
      
      for (let i = 0; i < text.length; i++) {
        doc.text(text[i], currentX, y);
        currentX += doc.getTextWidth(text[i]) + tracking;
      }
    } else {
      let currentX = x;
      for (let i = 0; i < text.length; i++) {
        doc.text(text[i], currentX, y);
        currentX += doc.getTextWidth(text[i]) + tracking;
      }
    }
  }

  // ============================================
  // BACKGROUND
  // ============================================
  doc.setFillColor(...colors.slate50);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // ============================================
  // DECORATIVE CORNER ORNAMENTS
  // ============================================
  
  // Top-left corner
  doc.setFillColor(...colors.indigo);
  doc.rect(8, 8, 25, 1.5, "F");
  doc.rect(8, 8, 1.5, 25, "F");
  
  // Top-right corner
  doc.rect(pageWidth - 33, 8, 25, 1.5, "F");
  doc.rect(pageWidth - 9.5, 8, 1.5, 25, "F");
  
  // Bottom-left corner
  doc.rect(8, pageHeight - 9.5, 25, 1.5, "F");
  doc.rect(8, pageHeight - 33, 1.5, 25, "F");
  
  // Bottom-right corner
  doc.rect(pageWidth - 33, pageHeight - 9.5, 25, 1.5, "F");
  doc.rect(pageWidth - 9.5, pageHeight - 33, 1.5, 25, "F");

  // ============================================
  // OUTER BORDERS
  // ============================================

  // Outer indigo
  doc.setDrawColor(...colors.indigo);
  doc.setLineWidth(2.5);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Inner cyan (thinner, inset)
  doc.setDrawColor(...colors.cyan);
  doc.setLineWidth(0.4);
  doc.rect(19, 19, pageWidth - 38, pageHeight - 38);

  // ============================================
  // HEADER SECTION
  // ============================================
  
  // Small badge above title
  drawTrackedText("OFFICIAL DOCUMENT", centerX, 30, 3, {
    align: "center",
    fontSize: 7,
    font: "helvetica",
    style: "bold",
    color: colors.indigo
  });

  // Decorative dots on both sides of badge
  doc.setFillColor(...colors.cyan);
  doc.circle(centerX - 35, 29, 0.8, "F");
  doc.circle(centerX + 35, 29, 0.8, "F");

  // Main title — CERTIFICATE
  drawTrackedText("CERTIFICATE", centerX, 46, 6, {
    align: "center",
    fontSize: 32,
    font: "times",
    style: "bold",
    color: colors.slate900
  });

  // Subtitle — OF COMPLETION
  drawTrackedText("OF COMPLETION", centerX, 55, 4, {
    align: "center",
    fontSize: 9,
    font: "helvetica",
    style: "normal",
    color: colors.slate500
  });

  // Divider line with center diamond
  doc.setDrawColor(...colors.slate300);
  doc.setLineWidth(0.3);
  doc.line(centerX - 40, 60, centerX - 5, 60);
  doc.line(centerX + 5, 60, centerX + 40, 60);
  
  doc.setFillColor(...colors.indigo);
  doc.circle(centerX, 60, 1.2, "F");

  // ============================================
  // UNIVERSITY NAME
  // ============================================
  drawTrackedText((data.university || "Mumbai University").toUpperCase(), centerX, 72, 2, {
    align: "center",
    fontSize: 11,
    font: "helvetica",
    style: "bold",
    color: colors.indigo
  });

  // Thin underline
  const uniWidth = doc.getTextWidth((data.university || "Mumbai University").toUpperCase()) + 12;
  doc.setDrawColor(...colors.cyan);
  doc.setLineWidth(0.4);
  doc.line(centerX - uniWidth / 2, 75, centerX + uniWidth / 2, 75);

  // ============================================
  // "This is to certify that"
  // ============================================
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate500);
  doc.text("This is to certify that", centerX, 88, { align: "center" });

  // ============================================
  // STUDENT NAME
  // ============================================

  // Name (serif, large, elegant)
  doc.setFont("times", "bolditalic");
  doc.setFontSize(38);
  doc.setTextColor(...colors.slate900);
  doc.text(data.studentName, centerX, 108, { align: "center" });

  // Elegant accent line under name
  const nameWidth = doc.getTextWidth(data.studentName);
  doc.setDrawColor(...colors.cyan);
  doc.setLineWidth(0.6);
  doc.line(centerX - nameWidth / 2 - 8, 113, centerX - nameWidth / 2 - 3, 113);
  doc.line(centerX + nameWidth / 2 + 3, 113, centerX + nameWidth / 2 + 8, 113);
  
  // Center diamond
  doc.setFillColor(...colors.cyan);
  doc.circle(centerX, 113, 1, "F");

  // ============================================
  // "has successfully completed"
  // ============================================
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate500);
  doc.text("has successfully completed the course", centerX, 125, { align: "center" });

  // ============================================
  // COURSE NAME
  // ============================================
  drawTrackedText(data.course.toUpperCase(), centerX, 140, 1.5, {
    align: "center",
    fontSize: 16,
    font: "helvetica",
    style: "bold",
    color: colors.indigoDeep
  });

  // ============================================
  // INFO BOXES (Issue Date + Cert ID)
  // ============================================

  const issueDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // --- Issue Date box ---
  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.slate300);
  doc.setLineWidth(0.3);
  doc.roundedRect(25, 158, 60, 20, 2, 2, "FD");

  // Small top accent
  doc.setFillColor(...colors.indigo);
  doc.rect(25, 158, 60, 0.8, "F");

  drawTrackedText("ISSUE DATE", 55, 165, 1.2, {
    align: "center",
    fontSize: 7,
    font: "helvetica",
    style: "bold",
    color: colors.slate500
  });

  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate900);
  doc.text(issueDate, 55, 174, { align: "center" });

  // --- Certificate ID box ---
  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.slate300);
  doc.roundedRect(90, 158, 60, 20, 2, 2, "FD");

  doc.setFillColor(...colors.cyan);
  doc.rect(90, 158, 60, 0.8, "F");

  drawTrackedText("CERTIFICATE ID", 120, 165, 1.2, {
    align: "center",
    fontSize: 7,
    font: "helvetica",
    style: "bold",
    color: colors.slate500
  });

  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...colors.slate900);
  doc.text(data.certId, 120, 174, { align: "center" });

  // ============================================
  // SIGNATURE
  // ============================================

  // Signature line
  doc.setDrawColor(...colors.slate600);
  doc.setLineWidth(0.4);
  doc.line(165, 172, 210, 172);

  drawTrackedText("AUTHORIZED SIGNATURE", 187.5, 178, 1, {
    align: "center",
    fontSize: 6.5,
    font: "helvetica",
    style: "normal",
    color: colors.slate500
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...colors.indigo);
  doc.text("Registrar", 187.5, 183, { align: "center" });

  // ============================================
  // QR CODE
  // ============================================

  const verifyURL = `${window.location.origin}/verify/${data.certId}`;
  const qrDataURL = await QRCode.toDataURL(verifyURL, {
    width: 300,
    margin: 1,
    color: { dark: "#4f46e5", light: "#ffffff" }
  });

  // QR frame
  doc.setFillColor(...colors.white);
  doc.setDrawColor(...colors.indigo);
  doc.setLineWidth(0.4);
  doc.roundedRect(225, 155, 48, 48, 2, 2, "FD");

  // QR code
  doc.addImage(qrDataURL, "PNG", 228, 158, 42, 42);

  drawTrackedText("SCAN TO VERIFY", 249, 208, 1.2, {
    align: "center",
    fontSize: 6,
    font: "helvetica",
    style: "bold",
    color: colors.indigo
  });

  // ============================================
  // FOOTER
  // ============================================

  // Footer divider
  doc.setDrawColor(...colors.slate300);
  doc.setLineWidth(0.2);
  doc.line(25, 195, 210, 195);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...colors.slate400);
  doc.text(
    "🔒 Secured on blockchain · Verify at " +
      `${window.location.origin}/verify/${data.certId}`,
    centerX - 30,
    200,
    { align: "center" }
  );

  // ============================================
  // WATERMARK (subtle)
  // ============================================

  doc.setTextColor(245, 247, 250);
  doc.setFont("times", "bold");
  doc.setFontSize(70);
  doc.text("SATYA-CHAIN", centerX, 145, {
    align: "center",
    angle: 0
  });

  return doc.output("blob");
}

export function downloadPDF(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}