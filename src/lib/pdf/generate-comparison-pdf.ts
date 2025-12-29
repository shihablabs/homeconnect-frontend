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
    
    
    const imgData = await toPng(element, {
      cacheBust: true,
      backgroundColor: "#ffffff",
      pixelRatio: 2, 
    });

    
    
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth - 20; 
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    
    const primaryColor = "#7c3aed"; 

    pdf.setFillColor(245, 243, 255); 
    pdf.rect(0, 0, 210, 30, "F");

    pdf.setFontSize(22);
    pdf.setTextColor(primaryColor);
    pdf.setFont("helvetica", "bold");
    pdf.text("HomeConnect", 10, 18);

    pdf.setFontSize(10);
    pdf.setTextColor("#4b5563");
    pdf.setFont("helvetica", "normal");
    pdf.text(`Smart Comparison Report • ${new Date().toLocaleDateString()}`, 10, 25);

    
    let position = 35; 

    
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);

    
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
