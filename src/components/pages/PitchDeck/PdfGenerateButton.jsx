import React from 'react';
import { FileDown } from 'lucide-react';
import { generatePDF, usePitchDeckData } from './PdfGenerator';

const PdfGenerateButton = () => {
  const { collectSlideData } = usePitchDeckData();

  const handleGeneratePDF = async () => {
    const slideData = collectSlideData();
    await generatePDF(slideData);
  };

  return (
    <button
      onClick={handleGeneratePDF}
      className="fixed bottom-8 right-8 p-4 bg-[#527853] text-white rounded-full shadow-lg hover:bg-[#436743] transition-colors duration-200 flex items-center justify-center gap-2"
    >
      <FileDown className="w-6 h-6" />
      <span className="hidden md:inline">Generate PDF</span>
    </button>
  );
};

export default PdfGenerateButton;