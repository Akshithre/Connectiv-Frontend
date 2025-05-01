import React from 'react';
import SlidePreview from './SlidePreview';
import SidebarThumbnails from './sidebarThumbnails';

const Navigation = ({ currentSlide, onSlideSelect }) => {
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

  return (
    <div className="w-64 bg-white border-r overflow-y-auto">
      <SidebarThumbnails 
        slides={slides} 
        currentSlide={currentSlide}
        onSlideSelect={onSlideSelect}
      />
    </div>
  );
};

export default Navigation;
