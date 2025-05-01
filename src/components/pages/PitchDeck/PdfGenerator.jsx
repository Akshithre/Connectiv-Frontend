import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Utility function to wait for elements to be fully rendered
const waitForElement = (selector) => {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
};

// Function to wait for charts and dynamic content
const waitForCharts = async () => {
  return new Promise(resolve => {
    setTimeout(resolve, 2000); // Increased timeout for better chart rendering
  });
};

// Enhanced function to prepare inputs for capture
const prepareInputsForCapture = (element) => {
  // Handle regular inputs
  const inputs = element.querySelectorAll('input');
  inputs.forEach(input => {
    const value = input.value;
    const style = window.getComputedStyle(input);
    
    const displayDiv = document.createElement('div');
    displayDiv.textContent = value;
    displayDiv.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: ${style.backgroundColor};
      color: ${style.color};
      padding: ${style.padding};
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize};
      display: flex;
      align-items: center;
      z-index: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-radius: ${style.borderRadius};
    `;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    wrapper.appendChild(displayDiv);
  });

  // Handle textareas
  const textareas = element.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    const value = textarea.value;
    const style = window.getComputedStyle(textarea);
    
    const displayDiv = document.createElement('div');
    displayDiv.textContent = value;
    displayDiv.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: ${style.backgroundColor};
      color: ${style.color};
      padding: ${style.padding};
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize};
      white-space: pre-wrap;
      overflow-wrap: break-word;
      z-index: 1;
      border-radius: ${style.borderRadius};
    `;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    textarea.parentNode.insertBefore(wrapper, textarea);
    wrapper.appendChild(textarea);
    wrapper.appendChild(displayDiv);
  });

  // Handle contenteditable elements
  const editableElements = element.querySelectorAll('[contenteditable="true"]');
  editableElements.forEach(editable => {
    const content = editable.innerHTML;
    const style = window.getComputedStyle(editable);
    
    const displayDiv = document.createElement('div');
    displayDiv.innerHTML = content;
    displayDiv.style.cssText = editable.style.cssText;
    displayDiv.style.position = 'static';
    
    editable.parentNode.insertBefore(displayDiv, editable);
    editable.style.display = 'none';
  });
};

// Function to capture a single slide with proper height handling
const captureSlide = async (slideElement, slideIndex) => {
  // Wait for all content to load
  await waitForCharts();
  
  try {
    // Clone the slide for capture
    const clone = slideElement.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);

    // Handle inputs and dynamic content
    prepareInputsForCapture(clone);

    // Set fixed width for consistent capture
    const A4_WIDTH = 1123; // A4 width in pixels at 96 DPI (landscape)
    clone.style.width = `${A4_WIDTH}px`;
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';

    // Handle charts and dynamic content
    const charts = clone.getElementsByClassName('recharts-wrapper');
    Array.from(charts).forEach(chart => {
      chart.style.visibility = 'visible';
      chart.style.width = '100%';
      chart.style.height = '100%';
    });

    // Get actual content height
    const contentHeight = clone.scrollHeight;
    const A4_HEIGHT = 794; // A4 height in pixels at 96 DPI (landscape)
    
    // Calculate number of pages needed
    const totalPages = Math.ceil(contentHeight / A4_HEIGHT);
    const canvases = [];

    // Capture each page
    for (let page = 0; page < totalPages; page++) {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: A4_WIDTH,
        height: A4_HEIGHT,
        windowWidth: A4_WIDTH,
        windowHeight: A4_HEIGHT,
        y: page * A4_HEIGHT,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.slide-content');
          if (clonedElement) {
            clonedElement.style.transform = 'none';
            clonedElement.style.margin = '0';
            clonedElement.style.padding = '20px';
          }
        }
      });
      canvases.push(canvas);
    }

    // Cleanup
    document.body.removeChild(clone);
    return canvases;
  } catch (error) {
    console.error(`Error capturing slide ${slideIndex + 1}:`, error);
    throw error;
  }
};

// Function to add canvas to PDF with proper positioning
const addCanvasToPdf = (pdf, canvas, isFirstPage = false) => {
  if (!isFirstPage) {
    pdf.addPage();
  }

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  try {
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      0,
      0,
      pdfWidth,
      pdfHeight
    );
  } catch (error) {
    console.error('Error adding image to PDF:', error);
    throw error;
  }
};

// Main PDF generation function
export const generatePDF = async (slides) => {
  try {
    // Create PDF instance with landscape orientation
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    let isFirstPage = true;

    // Process each slide
    for (let i = 0; i < slides.length; i++) {
      const slideElement = document.querySelector(`.slide-${i + 1}`);
      if (!slideElement) continue;

      const canvases = await captureSlide(slideElement, i);
      
      // Add each page of the slide to the PDF
      for (const canvas of canvases) {
        addCanvasToPdf(pdf, canvas, isFirstPage);
        isFirstPage = false;
      }
    }

    // Save the PDF
    pdf.save('pitch-deck.pdf');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Slide wrapper component with proper height handling
const SlideWrapper = ({ children, slideNumber }) => {
  return (
    <div className={`slide-content slide-${slideNumber} bg-white min-h-0`}>
      <div className="slide-inner-content">
        {children}
      </div>
    </div>
  );
};

// Hook for PDF generation
export const usePdfGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePdf = async (totalSlides) => {
    setIsGenerating(true);
    try {
      await generatePDF(Array.from({ length: totalSlides }, (_, i) => i + 1));
      return true;
    } catch (error) {
      console.error('PDF generation failed:', error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    handleGeneratePdf
  };
};

export default SlideWrapper;