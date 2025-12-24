import { AIComparisonData } from "@/services/ai-service";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { toast } from "sonner";

export const generateComparisonPDF = async (data: AIComparisonData, elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    toast.error("Could not find the table to generate PDF");
    return;
  }

  const toastId = toast.loading("Generating PDF report...");

  try {
    // 1. Capture the element as PNG using html-to-image
    // This library handles modern CSS (like oklch/lab) better than html2canvas
    const imgData = await toPng(element, {
      cacheBust: true,
      backgroundColor: "#ffffff",
      pixelRatio: 2, // High resolution
    });

    // 2. Initialize PDF
    // A4 size: 210mm x 297mm
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // 3. Calculate Dimensions to fit width
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth - 20; // 10mm margin each side
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    // 4. Header Branding
    const primaryColor = "#7c3aed"; // Violet-600

    pdf.setFillColor(245, 243, 255); // Violet-50
    pdf.rect(0, 0, 210, 30, "F");

    pdf.setFontSize(22);
    pdf.setTextColor(primaryColor);
    pdf.setFont("helvetica", "bold");
    pdf.text("HomeConnect", 10, 18);

    pdf.setFontSize(10);
    pdf.setTextColor("#4b5563");
    pdf.setFont("helvetica", "normal");
    pdf.text(`Smart Comparison Report • ${new Date().toLocaleDateString()}`, 10, 25);

    // 5. Add Image (The Table)
    let position = 35; // Start below header

    // Add image to PDF
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);

    // 6. Filename Sanitization (Robust)
    const prop1 = data.properties[0]?.replace(/\s+/g, '_') || "Property1";
    const prop2 = data.properties[1]?.replace(/\s+/g, '_') || "Property2";

    const sanitize = (name: string) => {
      return name.replace(/[\\/:*?"<>|]/g, '');
    };

    const safeFilename = `${sanitize(prop1)}-vs-${sanitize(prop2)}.pdf`;

    pdf.save(safeFilename);
    toast.success("PDF downloaded successfully!", { id: toastId });

  } catch (error) {
    console.error("PDF Generation Error:", error);
    toast.error("Failed to generate PDF", { id: toastId });
  }
};
