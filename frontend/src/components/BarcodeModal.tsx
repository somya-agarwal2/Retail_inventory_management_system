import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { barcodeRfidApi } from '../services/api';
import { Printer, Copy, Check, Download } from 'lucide-react';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sku: string;
  productName: string;
  price?: number;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({
  isOpen,
  onClose,
  sku,
  productName,
  price,
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && sku) {
      setLoading(true);
      barcodeRfidApi
        .generateBarcodeSvg(sku)
        .then((svg) => setSvgContent(svg))
        .catch((err) => console.error('Failed to generate vector barcode', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, sku]);

  const handleCopySku = () => {
    navigator.clipboard.writeText(sku);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Barcode Label - ${sku}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 20px; }
            .label-box { border: 2px dashed #0f172a; display: inline-block; padding: 16px; border-radius: 8px; }
            .title { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
            .sku { font-size: 12px; color: #475569; margin-bottom: 8px; }
            .price { font-size: 16px; font-weight: 800; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="label-box">
            <div class="title">${productName}</div>
            <div class="sku">SKU: ${sku}</div>
            ${svgContent}
            ${price ? `<div class="price">$${price.toFixed(2)}</div>` : ''}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Code 128 Vector Barcode"
      subtitle={`Product: ${productName} (SKU: ${sku})`}
      maxWidth="md"
    >
      <div className="flex flex-col items-center justify-center p-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-500">Generating crisp SVG vector barcode...</span>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-inner">
            <div className="text-sm font-semibold text-slate-800 mb-1">{productName}</div>
            <div className="text-xs font-mono text-slate-500 mb-4 tracking-wider">SKU: {sku}</div>

            <div
              className="bg-white p-4 rounded-lg shadow-sm border border-slate-200"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />

            {price !== undefined && (
              <div className="mt-4 text-xl font-bold text-slate-900">
                ${price.toFixed(2)}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex w-full space-x-3">
          <button
            onClick={handleCopySku}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1.5 text-emerald-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1.5" />
                Copy SKU
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            disabled={!svgContent}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Barcode Label
          </button>
        </div>
      </div>
    </Modal>
  );
};
