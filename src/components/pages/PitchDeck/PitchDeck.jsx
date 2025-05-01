import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Slide0 from './slides/slide0';
import Slide1 from './slides/slide1';
import Slide2 from './slides/slide2';
import Slide3 from './slides/slide3';
import Slide4 from './slides/slide4';
import Slide5 from './slides/slide5';
import Slide6 from './slides/slide6';
import Slide7 from './slides/slide7';
import Slide8 from './slides/slide8';
import Slide9 from './slides/slide9';
import Slide10 from './slides/slide10';
import Slide11 from './slides/slide11';
import Slide12 from './slides/slide12';
import Slide13 from './slides/slide13';
import Slide14 from './slides/slide14';

import { PitchDeckProvider } from './context/PitchDeckContext';
import { usePitchDeck } from './context/PitchDeckContext';
import SidebarThumbnails from './sidebarThumbnails';

const PitchDeck = () => {
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingSlideChange, setPendingSlideChange] = useState(null);

  const slides = [
    { id: 0, title: 'Opening Page'},
    { id: 1, title: 'Business Transaction Type' },
    { id: 2, title: 'Company Overview' },
    { id: 3, title: 'Next 3 Year Journey' },
    { id: 4, title: 'Historical Performance' },
    { id: 5, title: 'Revenue Model'},
    { id: 6, title: 'Profit Estimates and KPIs '},
    { id: 7, title: 'Charts for all the custom KPIs'},
    { id: 8, title: 'Cash Estimates'},
    { id: 9, title: 'DCF Valuation Basis-New Issue'},
    { id: 10, title: 'DCF Valuation Basis-Existing Stake - Exit'},
    { id: 11, title: 'EBITDA-based Valuation Basis-New Issue'},
    { id: 12, title: 'EBITDA-based Valuation Basis-Existing Stake - Exit'},
    { id: 13, title: 'Custom images of the user which would be uploaded'},
    { id: 14, title: 'Closing Page'},
  ];

  const handleSlideChange = (newSlide) => {
    // Get reference to current slide's isDirty state
    const currentSlideData = document.querySelector(`[data-slide="${currentSlide}"]`);
    const isDirty = currentSlideData?.dataset?.isDirty === 'true';

    if (isDirty) {
      setPendingSlideChange(newSlide);
      toast.warn(
        <div>
          <p className="mb-2">You have unsaved changes!</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                // Discard changes
                setCurrentSlide(newSlide);
                setPendingSlideChange(null);
                toast.dismiss();
              }}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Discard
            </button>
            <button
              onClick={async () => {
                // Save changes
                const saveButton = currentSlideData?.querySelector('[data-save-button]');
                if (saveButton) {
                  await saveButton.click();
                }
                setCurrentSlide(newSlide);
                setPendingSlideChange(null);
                toast.dismiss();
              }}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "light",
          closeButton: false
        }
      );
    } else {
      setCurrentSlide(newSlide);
    }
  };

  const renderCurrentSlide = () => {
    switch (currentSlide) {
      case 0:
        return <Slide0 />;
      case 1:
        return <Slide1 />;
      case 2:
        return <Slide2 />;
      case 3:
        return <Slide3 />;
      case 4:
        return <Slide4 />;
      case 5:
        return <Slide5 />;
      case 6:
        return <Slide6 />;
      case 7:
        return <Slide7 />;
      case 8:
        return <Slide8 />;
      case 9:
        return <Slide9 />;
      case 10:
        return <Slide10 />;
      case 11:
        return <Slide11 />;
      case 12:
        return <Slide12 />;
      case 13:
        return <Slide13 />;
      case 14:
        return <Slide14 />;
      default:
        return <Slide0 />;
    }
  };

  const goToNextSlide = () => {
    
    if (currentSlide < slides.length-1) {
      handleSlideChange(currentSlide + 1);
    }
  };

  const goToPrevSlide = () => {
    
    if (currentSlide > 0) {
      handleSlideChange(currentSlide - 1);
    }
  };

  return (
    <PitchDeckProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <SidebarThumbnails 
            slides={slides} 
            currentSlide={currentSlide}
            onSlideSelect={handleSlideChange}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="relative w-full h-full">
              {renderCurrentSlide()}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center px-6 py-4 bg-white border-t">
            <button
              onClick={goToPrevSlide}
              disabled={currentSlide === 0}
               // Updated condition
              className={`px-4 py-2 rounded ${
                currentSlide === 0 
                
                  ? 'bg-gray-200 text-gray-500' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Previous
            </button>
            <span className="text-gray-600">
              Slide {currentSlide+1} of {slides.length}
            </span>
            <button
              onClick={goToNextSlide}
              disabled={currentSlide === slides.length-1}
              className={`px-4 py-2 rounded ${
                currentSlide === slides.length-1 
                  ? 'bg-gray-200 text-gray-500' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>
        <ToastContainer
          position="top-center"
          autoClose={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          theme="light"
        />
      </div>
    </PitchDeckProvider>
  );
};

export default PitchDeck;