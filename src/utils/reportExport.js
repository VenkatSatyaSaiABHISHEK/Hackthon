import html2pdf from 'html2pdf.js';

/**
 * Export analysis data as JSON file
 * @param {Object} analysis - The analysis data object
 */
export function exportReportToJson(analysis) {
  if (!analysis) {
    console.error('No analysis data to export');
    return;
  }

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `airguard-report-${timestamp}.json`;
  
  const dataStr = JSON.stringify(analysis, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Export analysis report as PDF using html2pdf.js
 * @param {React.RefObject} exportRef - Reference to the DOM node to export
 * @param {Object} options - Optional configuration
 */
export function exportReportToPdf(exportRef, options = {}) {
  if (!exportRef?.current) {
    console.error('Export ref not available');
    return;
  }

  const node = exportRef.current;
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `airguard-report-${timestamp}.pdf`;

  const defaultOptions = {
    margin: 0.5,
    filename: filename,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      letterRendering: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'in', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['.no-break', 'img', 'tr']
    }
  };

  const opt = { ...defaultOptions, ...options };

  // Show loading indicator
  const originalContent = node.innerHTML;
  const loadingDiv = document.createElement('div');
  loadingDiv.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 10px; z-index: 10000;">Generating PDF...</div>';
  document.body.appendChild(loadingDiv);

  html2pdf()
    .set(opt)
    .from(node)
    .save()
    .then(() => {
      document.body.removeChild(loadingDiv);
    })
    .catch((error) => {
      console.error('PDF generation error:', error);
      document.body.removeChild(loadingDiv);
      alert('Failed to generate PDF. Please try again.');
    });
}

/**
 * Alternative implementation using jsPDF + html2canvas
 * Uncomment and use this if html2pdf.js has issues
 * 
 * Installation required:
 * npm install jspdf html2canvas --save
 * 
 * import jsPDF from 'jspdf';
 * import html2canvas from 'html2canvas';
 * 
 * export async function exportReportToPdfAlternative(exportRef) {
 *   if (!exportRef?.current) return;
 *   
 *   const node = exportRef.current;
 *   const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
 *   
 *   try {
 *     const canvas = await html2canvas(node, {
 *       scale: 2,
 *       useCORS: true,
 *       logging: false,
 *       backgroundColor: '#ffffff'
 *     });
 *     
 *     const imgData = canvas.toDataURL('image/jpeg', 0.95);
 *     const pdf = new jsPDF({
 *       orientation: 'portrait',
 *       unit: 'mm',
 *       format: 'a4'
 *     });
 *     
 *     const pdfWidth = pdf.internal.pageSize.getWidth();
 *     const pdfHeight = pdf.internal.pageSize.getHeight();
 *     const imgWidth = canvas.width;
 *     const imgHeight = canvas.height;
 *     const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
 *     const imgX = (pdfWidth - imgWidth * ratio) / 2;
 *     const imgY = 10;
 *     
 *     pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
 *     pdf.save(`airguard-report-${timestamp}.pdf`);
 *   } catch (error) {
 *     console.error('PDF generation failed:', error);
 *     alert('Failed to generate PDF');
 *   }
 * }
 */
