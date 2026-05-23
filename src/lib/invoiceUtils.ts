import { collection, query, where, getDocs, limit, orderBy, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  tokenId: string;
  hospitalId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  hospitalName: string;
  hospitalPhone: string;
  hospitalCity: string;
  doctorName: string;
  doctorSpecialization: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  consultationFee: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Pending';
  paymentMethod: string;
  generatedAt: string;
}

/**
 * Generates and returns a unique invoice for a given completed token.
 * If an invoice already exists for the token, returns the existing one.
 */
export async function createOrGetInvoice(token: any, hospitalData?: any): Promise<Invoice> {
  if (!token || !token.id) {
    throw new Error("Invalid token passed for invoice lookup.");
  }

  // Check state and ensure we look up by tokenId
  const invoicesRef = collection(db, 'invoices');
  const qToken = query(invoicesRef, where('tokenId', '==', token.id));
  const snapToken = await getDocs(qToken);

  if (!snapToken.empty) {
    const d = snapToken.docs[0];
    return { id: d.id, ...d.data() } as Invoice;
  }

  // Create Karachi/Pakistan local formatted date or generic date string
  // Format YYYYMMDD
  const today = new Date();
  
  // Try to use the appointment date if available, or current date
  let dateStr = "";
  if (token.appointmentDate && token.appointmentDate.replace(/[^0-9]/g, '').length >= 6) {
    // E.g. "2026-05-22" or similar
    const cleanDate = token.appointmentDate.replace(/[^0-9]/g, ''); // "20260522"
    if (cleanDate.length === 8) {
      dateStr = cleanDate;
    }
  }
  
  if (!dateStr) {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateStr = `${year}${month}${day}`;
  }

  const prefix = `INV-${dateStr}-`;

  // Query to find latest sequence for this prefix
  const qSeq = query(
    invoicesRef,
    where('invoiceNumber', '>=', prefix),
    where('invoiceNumber', '<=', prefix + '\uf8ff'),
    orderBy('invoiceNumber', 'desc'),
    limit(1)
  );

  let seq = 1;
  try {
    const snapSeq = await getDocs(qSeq);
    if (!snapSeq.empty) {
      const latestInvoiceNum = snapSeq.docs[0].data().invoiceNumber;
      const lastDigits = latestInvoiceNum.split('-').pop();
      if (lastDigits) {
        const parsed = parseInt(lastDigits, 10);
        if (!isNaN(parsed)) {
          seq = parsed + 1;
        }
      }
    }
  } catch (err) {
    console.error("Error generating sequential invoice number, falling back to 1:", err);
  }

  const invoiceNum = `${prefix}${String(seq).padStart(3, '0')}`;

  // Normalize fee values (Urdu display handles free)
  let feeVal = 0;
  if (token.fee || token.consultationFee) {
    const feeStr = String(token.fee || token.consultationFee).replace(/[^0-9]/g, '');
    const num = parseFloat(feeStr);
    if (!isNaN(num)) {
      feeVal = num;
    }
  }

  const invoiceData: Invoice = {
    invoiceNumber: invoiceNum,
    tokenId: token.id,
    hospitalId: token.hospitalId || '',
    patientId: token.patientId || '',
    patientName: token.patientName || 'Patient',
    patientPhone: token.patientPhone || token.phone || 'N/A',
    hospitalName: token.hospitalName || hospitalData?.hospitalName || hospitalData?.name || 'Xdoc Associated Hospital',
    hospitalPhone: hospitalData?.phone || token.hospitalPhone || 'N/A',
    hospitalCity: hospitalData?.city || token.hospitalCity || 'Pakistan',
    doctorName: token.doctorName || 'Doctor',
    doctorSpecialization: token.doctorSpecialization || hospitalData?.specializations?.[0] || 'Medical Specialist',
    appointmentDate: token.appointmentDate || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    appointmentTime: token.appointmentTime || token.timeSlot || 'N/A',
    tokenNumber: token.tokenNumber || token.number || '00',
    consultationFee: feeVal,
    totalAmount: feeVal,
    paymentStatus: 'Paid', // Invoice generated when completed is Paid by definition
    paymentMethod: token.paymentMethod || 'Cash',
    generatedAt: new Date().toISOString()
  };

  const newDocRef = doc(collection(db, 'invoices'));
  await setDoc(newDocRef, invoiceData);

  return { id: newDocRef.id, ...invoiceData };
}

/**
 * Downloads the specified invoice as a PDF using html2canvas & jsPDF.
 * Triggered on button click.
 */
export async function downloadInvoicePDF(
  invoiceData: Invoice, 
  onStateChange?: (state: 'idle' | 'generating' | 'success') => void
) {
  const element = document.getElementById('invoice-content');
  if (!element) {
    console.error("Invoice element #invoice-content not found in DOM");
    return;
  }

  try {
    if (onStateChange) onStateChange('generating');

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Save with the user requested format: Xdoc-Invoice-T001-PatientName.pdf
    const cleanPatientName = (invoiceData.patientName || 'Patient').replace(/\s+/g, '_');
    pdf.save(`Xdoc-Invoice-${invoiceData.tokenNumber}-${cleanPatientName}.pdf`);

    if (onStateChange) {
      onStateChange('success');
      setTimeout(() => onStateChange('idle'), 2000);
    }
  } catch (error) {
    console.error("PDF generation error:", error);
    if (onStateChange) onStateChange('idle');
  }
}

/**
 * Formats and opens the WhatsApp message structure on on-click share action.
 */
export function shareInvoiceWhatsApp(invoiceData: Invoice) {
  // If fee = 0, show "FREE" instead of Rs. 0
  const displayFee = invoiceData.consultationFee === 0 ? "FREE" : `Rs. ${invoiceData.consultationFee.toLocaleString()}`;

  const message = 
    `🏥 *Xdoc Medical Invoice*\n\n` +
    `Invoice #: ${invoiceData.invoiceNumber}\n` +
    `Patient: ${invoiceData.patientName}\n` +
    `Hospital: ${invoiceData.hospitalName}\n` +
    `Doctor: Dr. ${invoiceData.doctorName}\n` +
    `Date: ${invoiceData.appointmentDate}\n` +
    `Time: ${invoiceData.appointmentTime}\n` +
    `Token: ${invoiceData.tokenNumber}\n\n` +
    `💰 *Amount: ${displayFee}*\n` +
    `✅ Status: ${invoiceData.paymentStatus}\n\n` +
    `📱 View full details:\n` +
    `https://xdoc.pages.dev/token/${invoiceData.tokenId}\n\n` +
    `_Powered by Xdoc_ 🏥\n` +
    `xdoc.pages.dev`;

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
}
