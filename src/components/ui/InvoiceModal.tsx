import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Share2, CornerDownRight, Landmark, Phone, Calendar, Clock, Stethoscope, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { createOrGetInvoice, downloadInvoicePDF, shareInvoiceWhatsApp, Invoice } from '../../lib/invoiceUtils';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '../../contexts/LanguageContext';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: any;           // Pass token details
  hospitalData?: any;   // Optional hospital details
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ 
  isOpen, 
  onClose, 
  token, 
  hospitalData 
}) => {
  const { language } = useLanguage();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pdfState, setPdfState] = useState<'idle' | 'generating' | 'success'>('idle');

  const u = language === 'UR';

  useEffect(() => {
    if (isOpen && token) {
      setLoading(true);
      createOrGetInvoice(token, hospitalData)
        .then((data) => {
          setInvoice(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching or creating invoice:", err);
          setLoading(false);
        });
    }
  }, [isOpen, token, hospitalData]);

  if (!isOpen) return null;

  // Dictionary for Urdu translations based on Part 10
  const getDict = (key: string) => {
    const dict: Record<string, { EN: string; UR: string }> = {
      invoice: { EN: 'Invoice', UR: 'انوائس' },
      downloadPDF: { EN: 'Download PDF', UR: 'پی ڈی ایف ڈاؤن لوڈ' },
      shareWhatsApp: { EN: 'Share on WhatsApp', UR: 'واٹس ایپ پر شیئر کریں' },
      printInvoice: { EN: 'Print', UR: 'پرنٹ' },
      invoiceNumber: { EN: 'Invoice Number', UR: 'انوائس نمبر' },
      patient: { EN: 'Patient', UR: 'مریض' },
      hospital: { EN: 'Hospital', UR: 'ہسپتال' },
      doctor: { EN: 'Doctor', UR: 'ڈاکٹر' },
      specialization: { EN: 'Specialization', UR: 'شعبہ' },
      date: { EN: 'Date', UR: 'تاریخ' },
      time: { EN: 'Time', UR: 'وقت' },
      tokenNum: { EN: 'Token Number', UR: 'ٹوکن نمبر' },
      amount: { EN: 'Amount', UR: 'رقم' },
      fee: { EN: 'Consultation Fee', UR: 'سلاٹنگ فیس' },
      paymentStatus: { EN: 'Payment Status', UR: 'ادائیگی کی حیثیت' },
      paid: { EN: 'Paid', UR: 'ادا شدہ' },
      pending: { EN: 'Pending', UR: 'زیر التواء' },
      totalSymbol: { EN: 'Total', UR: 'کل' },
      thankYou: { EN: 'Thank you for choosing', UR: 'شکریہ ادا کرنے کا' },
      generatingPDF: { EN: 'Generating PDF...', UR: 'پی ڈی ایف بن رہی ہے' },
      downloaded: { EN: 'Downloaded!', UR: 'ڈاؤن لوڈ ہو گیا' },
      method: { EN: 'Method', UR: 'طریقہ' },
      close: { EN: 'Close', UR: 'بند کریں' }
    };
    return dict[key]?.[u ? 'UR' : 'EN'] || key;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (invoice) {
      downloadInvoicePDF(invoice, setPdfState);
    }
  };

  const handleWhatsApp = () => {
    if (invoice) {
      shareInvoiceWhatsApp(invoice);
    }
  };

  const isFree = invoice ? (invoice.consultationFee === 0 || invoice.totalAmount === 0) : false;
  const displayFee = invoice ? (isFree ? 'FREE' : `Rs. ${invoice.consultationFee.toLocaleString()}`) : '';
  const displayTotal = invoice ? (isFree ? 'FREE' : `Rs. ${invoice.totalAmount.toLocaleString()}`) : '';

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[1002] bg-slate-900/60 backdrop-blur-md flex flex-col justify-end sm:justify-center p-0 sm:p-6 no-print ${u ? 'font-urdu' : 'font-sans'}`} dir={u ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="bg-white rounded-t-[40px] sm:rounded-[48px] max-w-lg w-full mx-auto flex flex-col h-[90vh] sm:h-[85vh] shadow-2xl relative border border-slate-100"
        >
          {/* Header Bar */}
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <span className="w-10 h-10" /> {/* Spacer */}
            <h2 className="text-xl font-black text-slate-800 tracking-tight text-center">
              {getDict('invoice')}
            </h2>
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100/60 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sub-context contents */}
          <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar bg-slate-50/40">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {u ? 'انوائس تیار کی جا رہی ہے...' : 'Compiling medical receipt...'}
                </p>
              </div>
            ) : invoice ? (
              <div id="invoice-content" className="w-full max-w-md mx-auto p-8 bg-white border border-slate-100 rounded-3xl shadow-lg shadow-slate-200/40 text-[#0B1D35] flex flex-col relative overflow-hidden my-2">
                {/* Horizontal color strip */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0B5FFF] to-[#00C9B1]" />
                
                {/* Header Section */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-5 mb-5 mt-2">
                  <div className="flex flex-col">
                    <BrandLogo size={42} className="mb-2" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">xdoc.pages.dev</span>
                  </div>
                  <div className="text-right">
                    <h1 className="text-xl font-black tracking-widest text-[#0B5FFF] leading-none mb-1">INVOICE</h1>
                    <p className="font-mono text-[11px] font-bold text-slate-500">{invoice.invoiceNumber}</p>
                    <p className="text-[9px] font-semibold text-slate-450 mt-1">{getDict('date')}: {invoice.appointmentDate}</p>
                  </div>
                </div>

                {/* Sender/Receiver Details Block */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-150 pb-5 mb-5">
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{getDict('hospital')}</h4>
                    <h3 className="text-sm font-black text-[#0B1D35] leading-tight truncate">{invoice.hospitalName}</h3>
                    <p className="text-xs font-semibold text-slate-500">{invoice.hospitalCity}</p>
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Phone size={10} /> {invoice.hospitalPhone}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{getDict('patient')}</h4>
                    <h3 className="text-sm font-black text-[#0B1D35] leading-tight truncate">{invoice.patientName}</h3>
                    <p className="text-xs font-bold text-slate-400 flex items-center justify-end gap-1">
                      <Phone size={10} /> {invoice.patientPhone}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">{invoice.appointmentDate}</p>
                  </div>
                </div>

                {/* Treatment details */}
                <div className="bg-[#FAFCFF] border border-blue-50/80 rounded-2xl p-4 mb-5 space-y-3">
                  <h4 className="text-[9px] font-black text-[#0B5FFF] uppercase tracking-widest border-b border-dashed border-blue-100 pb-2">
                    {u ? 'تفصیلات' : 'APPOINTMENT INFORMATION'}
                  </h4>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{getDict('doctor')}</span>
                    <span className="font-bold text-[#0B1D35]">Dr. {invoice.doctorName}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{getDict('specialization')}</span>
                    <span className="font-semibold text-slate-600">{invoice.doctorSpecialization}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{getDict('time')}</span>
                    <span className="font-semibold text-slate-600">{invoice.appointmentTime}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-bold">{getDict('tokenNum')}</span>
                    <span className="font-mono font-black text-[#0B5FFF] text-sm">#{invoice.tokenNumber}</span>
                  </div>
                </div>

                {/* Financial overview */}
                <div className="border-t border-slate-100 pt-3 mb-5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">{getDict('fee')}</span>
                    <span className="font-bold text-[#0B1D35]">{displayFee}</span>
                  </div>
                  <div className="border-t border-[#E2E8F0] pt-3 flex justify-between items-center">
                    <span className="text-xs font-black text-[#0B1D35] uppercase tracking-wider">{getDict('totalSymbol')}</span>
                    <span className="text-base font-black text-[#0B5FFF]">{displayTotal}</span>
                  </div>
                </div>

                {/* Verification badge */}
                <div className="flex items-center justify-between bg-slate-50/80 rounded-2xl p-3 border border-slate-100/60 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{getDict('paymentStatus')}:</span>
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg bg-[#00C9B1]/10 text-[#00C9B1]">
                      ✅ {getDict('paid')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{getDict('method')}:</span>
                    <span className="text-xs font-bold text-slate-600">{invoice.paymentMethod}</span>
                  </div>
                </div>

                {/* Slogan */}
                <div className="text-center border-t border-slate-100 pt-4 space-y-0.5 mt-auto">
                  <p className="text-xs font-bold text-[#0B5FFF]">{getDict('thankYou')} {invoice.hospitalName}!</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Powered by Xdoc</p>
                  <p className="text-[8px] text-[#00C9B1] font-black uppercase tracking-[0.1em]">xdoc.pages.dev</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 font-medium">
                Unable to compile invoice receipt. Please try again.
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="px-6 py-5 border-t border-slate-100 bg-white shadow-xl flex items-center gap-3 shrink-0 rounded-b-[40px] sm:rounded-b-[48px]">
            <button
              onClick={handlePrint}
              disabled={loading || !invoice}
              className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-98 disabled:opacity-50"
            >
              <Printer size={16} />
              <span>{getDict('printInvoice')}</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={loading || !invoice || pdfState === 'generating'}
              className="flex-1 py-4 bg-[#0B5FFF] hover:bg-[#0B5FFF]/90 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-98 disabled:opacity-50"
            >
              <Download size={16} />
              <span>
                {pdfState === 'generating' ? getDict('generatingPDF') : 
                 pdfState === 'success' ? getDict('downloaded') : getDict('downloadPDF')}
              </span>
            </button>
            <button
              onClick={handleWhatsApp}
              disabled={loading || !invoice}
              className="py-4 px-6 bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-98 shadow-md shadow-green-500/10"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">{getDict('shareWhatsApp')}</span>
              <span className="sm:hidden">WhatsApp</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
