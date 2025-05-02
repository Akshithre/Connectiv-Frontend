import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react'; 
import { Upload, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation  } from 'react-router-dom';
import Navbar from '../../components/pages/Navbar';
import { useBusinessProposal } from '../../providers/businessProposalContextProvider';
import { businessProposalApi } from '../../services/businessProposalApi';
import { useAuth } from '../../contexts/authContext/index'; // Adjust path as needed
import { uploadToS3 } from '../../utils/s3Utils';
import Navigation from './BusinessValuation/Navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
// const InfoTooltip = ({ text }) => (
//   <div className="inline-flex items-center ml-1">
//     <div className="group relative inline-block">
//       <Info className="w-4 h-4 text-gray-500 cursor-help" />
//       <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-50 w-64 p-2.5 text-sm text-white bg-gray-800 rounded-lg -translate-x-1/2 left-1/2 bottom-full mb-2">
//         {text}
//         <div className="absolute w-2 h-2 bg-gray-800 rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
//       </div>
//     </div>
//   </div>
// );
// const Navigation = ({ currentStep }) => {
//   const steps = [
//     { id: 1, label: 'Business Profile' },
//     { id: 2, label: 'Business Valuation' },
//     { id: 3, label: 'Proposal Creation' },
//     { id: 4, label: 'Investor Access' }
//   ];

//   return (
//     <div className="w-full bg-white border-b">
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-center py-4">
//           {steps.map((step, index) => (
//             <React.Fragment key={step.id}>
//               {/* Step circle with number */}
//               <div className="flex flex-col items-center">
//                 <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
//                   ${currentStep >= step.id 
//                     ? 'border-yellow-500 bg-yellow-500 text-black' 
//                     : 'border-gray-300 text-gray-300'
//                   } transition-colors duration-200`}
//                 >
//                   <span className="text-sm font-medium">{step.id}</span>
//                 </div>
                
//                 {/* Step label */}
//                 <span className={`mt-2 text-xs text-center w-24
//                   ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}
//                 >
//                   {step.label}
//                 </span>
//               </div>
              
//               {/* Connector line between steps */}
//               {index < steps.length - 1 && (
//                 <div className={`w-16 h-0.5 mx-2
//                   ${currentStep > step.id ? 'bg-yellow-500' : 'bg-gray-300'}`}
//                 />
//               )}
//             </React.Fragment>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };
const InfoTooltip = ({ text }) => {
  // Split the text by numbers at the start of lines and format them
  const formatTooltipText = (text) => {
    if (!text) return '';
    
    // Split the text by number patterns (e.g., "1.", "2.", "3.")
    const points = text.split(/(?=\d+\.)/);
    
    return points.map((point, index) => (
      // Only add margin top after the first item
      <div key={index} className={`${index > 0 ? 'mt-2' : ''}`}>
        {point.trim()}
      </div>
    ));
  };

  return (
    <div className="inline-flex items-center ml-1">
      <div className="group relative inline-block">
        <Info className="w-4 h-4 text-gray-500 cursor-help" />
        <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-50 w-64 p-2.5 text-sm text-white bg-gray-800 rounded-lg -translate-x-1/2 left-1/2 bottom-full mb-2">
          {formatTooltipText(text)}
          <div className="absolute w-2 h-2 bg-gray-800 rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      </div>
    </div>
  );
};
const Card = ({ title, description, isPublic, children, tooltipText }) => (
  <div className="bg-white rounded-lg shadow-sm mb-6">
    <div className="p-6">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {tooltipText && <InfoTooltip text={tooltipText} />}
        </div>
        {isPublic !== undefined && (
          <span className={`text-xs px-2 py-1 rounded ${
            isPublic ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {isPublic ? 'Publicly disclosed' : 'Not publicly disclosed'}
          </span>
        )}
      </div>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {children}
    </div>
  </div>
);

const ConfidentialInfo = ({ formData, setFormData, errors }) => {
  const countries = [
    { code: '+91', name: 'India' },
    { code: '+1', name: 'USA' },
    { code: '+44', name: 'UK' },
    { code: '+86', name: 'China' },
    { code: '+81', name: 'Japan' },
    { code: '+49', name: 'Germany' },
    { code: '+33', name: 'France' },
    { code: '+61', name: 'Australia' }
  ];

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'primaryEmail') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        emailError: validateEmail(value) ? '' : 'Please enter a valid email address'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <Card 
      title="Confidential Information" 
      isPublic={false}
      tooltipText="We keep the information submitted in this section confidential. You have the option to disclose this information to investors of your choice."
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 max-w-3xl">
        <div>
          <label className="block text-sm mb-1"><span className="text-red-500">*</span>Personal Name</label>
          <input
            type="text"
            name="personalName"
            value={formData.personalName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm ${
              errors.personalName ? 'border-red-500' : ''
            }`}
          />
          {errors.personalName && (
            <p className="text-red-500 text-xs mt-1">This field is mandatory</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1"><span className="text-red-500">*</span>Business Legal Name <InfoTooltip text="As per Goverment records like Incorporation Certificate, PAN, GST." /></label>
          <input
            type="text"
            name="businessLegalName"
            value={formData.businessLegalName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm ${
              errors.businessLegalName ? 'border-red-500' : ''
            }`}
          />
          {errors.businessLegalName && (
            <p className="text-red-500 text-xs mt-1">This field is mandatory</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1"><span className="text-red-500">*</span>Mobile Number</label>
          <div className="flex gap-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="px-3 py-2 border rounded text-sm w-32"
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.code} ({country.name})
                </option>
              ))}
            </select>
            <input
              type="tel"
              name="mobileNo"
              value={formData.mobileNo}
              onChange={handleChange}
              className={`flex-1 px-3 py-2 border rounded text-sm ${
                errors.mobileNo ? 'border-red-500' : ''
              }`}
            />
          </div>
          {errors.mobileNo && (
            <p className="text-red-500 text-xs mt-1">This field is mandatory</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1"><span className="text-red-500">*</span>Primary Email</label>
          <input
            type="email"
            name="primaryEmail"
            value={formData.primaryEmail}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded text-sm ${
              errors.primaryEmail ? 'border-red-500' : ''
            }`}
          />
          {errors.primaryEmail && (
            <p className="text-red-500 text-xs mt-1">This field is mandatory</p>
          )}
          {formData.emailError && (
            <p className="text-red-500 text-xs mt-1">{formData.emailError}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

const BusinessInfo = ({ formData, setFormData }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  
  const legalEntityTypes = [
    'Sole Proprietor',
    'Partnership Firm',
    'LLP',
    'Private Limited Company',
    'Public Limited Company'
  ];

  // This would typically come from an API or larger data file
  const nicIndustries = [
    'Agriculture, Forestry and Fishing',
    'Mining and Quarrying',
    'Manufacturing',
    'Construction',
    'Wholesale and Retail Trade',
    // Add more industries as per NIC classification
  ];

  const indianCities = [
   'New Delhi', // National Capital
    'Mumbai', // Maharashtra
    'Chennai', // Tamil Nadu
    'Kolkata', // West Bengal
    'Bengaluru', // Karnataka
    'Hyderabad', // Telangana
    'Gandhinagar', // Gujarat
    'Jaipur', // Rajasthan
    'Lucknow', // Uttar Pradesh
    'Bhopal', // Madhya Pradesh
    'Patna', // Bihar
    'Bhubaneswar', // Odisha
    'Raipur', // Chhattisgarh
    'Ranchi', // Jharkhand
    'Thiruvananthapuram', // Kerala
    'Dehradun', // Uttarakhand
    'Chandigarh', // Punjab & Haryana
    'Shimla', // Himachal Pradesh
    'Srinagar', // Jammu & Kashmir (Summer)
    'Jammu', // Jammu & Kashmir (Winter)
    'Itanagar', // Arunachal Pradesh
    'Dispur', // Assam
    'Imphal', // Manipur
    'Shillong', // Meghalaya
    'Aizawl', // Mizoram
    'Kohima', // Nagaland
    'Agartala', // Tripura
    'Gangtok', // Sikkim
    'Panaji', // Goa
    // Union Territories
    'Port Blair', // Andaman & Nicobar Islands
    'Silvassa', // Dadra & Nagar Haveli
    'Daman', // Daman & Diu
    'Kavaratti', // Lakshadweep
    'Puducherry', // Puducherry
    'Leh' // Ladakh 
  ];
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const hasShortDescError = (text) => {
    return text?.length > 0 && text?.length < 50;
  };
  const hasTextError = (text, minLength = 100) => {
    return text?.length > 0 && text?.length < minLength;
  };
  return (
    <Card 
      title="Business Information" 
      isPublic={true}
      tooltipText="We disclose the information submitted in this section to pre-approved investors."
    >
      <div className="space-y-4 max-w-3xl">
        <div>
          <label className="block text-sm mb-1">Your Designation</label>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            className="w-full max-w-xs px-3 py-2 border rounded text-sm"
            
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Legal Entity Type</label>
          <select
            name="legalEntityType"
            value={formData.legalEntityType}
            onChange={handleChange}
            className="w-full max-w-xs px-3 py-2 border rounded text-sm"
           
          >
            <option value="">Select Type</option>
            {legalEntityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Business Established Year</label>
          <select
            name="establishedYear"
            value={formData.establishedYear}
            onChange={handleChange}
            className="w-full max-w-xs px-3 py-2 border rounded text-sm"
            
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Business Registered Location</label>
          <select
            name="businessLocation"
            value={formData.businessLocation}
            onChange={handleChange}
            className="w-full max-w-xs px-3 py-2 border rounded text-sm"
            
          >
            <option value="">Select City</option>
            {indianCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Industry</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full max-w-lg px-3 py-2 border rounded text-sm"
            
          >
            <option value="">Select Industry</option>
            {nicIndustries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>
        <div>
         <label className="block text-sm mb-1">
            Short Business Description 
            <InfoTooltip text="Minimum 50 characters, maximum 100 characters" />
          </label>
          <textarea
            name="shortBusinessDesc"
            value={formData.shortBusinessDesc}
            onChange={handleChange}
            className={`w-full max-w-2xl px-3 py-2 rounded text-sm text-gray-900
              ${hasShortDescError(formData.shortBusinessDesc) 
                ? 'border-2 border-red-500 outline-none focus:ring-0' 
                : 'border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
            rows="2"
            minLength={50}
            maxLength={100}
            placeholder="Minimum 50 characters, maximum 100 characters"
            onInvalid={(e) => {
              e.target.setCustomValidity('Your business description should be at least 50 characters.')
            }}
            onInput={(e) => {
              e.target.setCustomValidity('')
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.shortBusinessDesc?.length || 0}/100 characters
          </p>
         
            
          
</div>
<div>
          <label className="block text-sm mb-1">
            Long Business Description 
            <InfoTooltip text="Minimum 100 characters, maximum 500 characters" />
          </label>
          <textarea
            name="businessDesc"
            value={formData.businessDesc}
            onChange={handleChange}
            className={`w-full max-w-2xl px-3 py-2 rounded text-sm text-gray-900
              ${hasTextError(formData.businessDesc) 
                ? 'border-2 border-red-500 outline-none focus:ring-0' 
                : 'border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
            rows="3"
            minLength={100}
            maxLength={500}
            placeholder="Minimum 100 characters, maximum 500 characters"
            onInvalid={(e) => {
              e.target.setCustomValidity('Your business description should be at least 100 characters.')
            }}
            onInput={(e) => {
              e.target.setCustomValidity('')
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.businessDesc?.length || 0}/500 characters
          </p>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Key Products (or) Services 
            <InfoTooltip text="Minimum 100 characters, maximum 500 characters" />
          </label>
          <textarea
            name="keyProducts"
            value={formData.keyProducts}
            onChange={handleChange}
            className={`w-full max-w-2xl px-3 py-2 rounded text-sm text-gray-900
              ${hasTextError(formData.keyProducts) 
                ? 'border-2 border-red-500 outline-none focus:ring-0' 
                : 'border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
            rows="3"
            minLength={100}
            maxLength={500}
            placeholder="Minimum 100 characters, maximum 500 characters"
            onInvalid={(e) => {
              e.target.setCustomValidity('Your description should be at least 100 characters.')
            }}
            onInput={(e) => {
              e.target.setCustomValidity('')
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.keyProducts?.length || 0}/500 characters
          </p>
        </div>

        <div>
          <label className="block text-sm mb-1">
            Business Strengths 
            <InfoTooltip text="Minimum 100 characters, maximum 500 characters" />
          </label>
          <textarea
            name="businessStrengths"
            value={formData.businessStrengths}
            onChange={handleChange}
            className={`w-full max-w-2xl px-3 py-2 rounded text-sm text-gray-900
              ${hasTextError(formData.businessStrengths) 
                ? 'border-2 border-red-500 outline-none focus:ring-0' 
                : 'border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'}`}
            rows="3"
            minLength={100}
            maxLength={500}
            placeholder="Minimum 100 characters, maximum 500 characters"
            onInvalid={(e) => {
              e.target.setCustomValidity('Your description should be at least 100 characters.')
            }}
            onInput={(e) => {
              e.target.setCustomValidity('')
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.businessStrengths?.length || 0}/500 characters
          </p>
        </div>

        <div className="space-y-4">
          {[
            { name: 'annualSales', label: 'Annual Reported Sales (Recent full-year)' },
            { name: 'annualEBITDA', label: 'Annual Reported EBITDA (or) Operating Profit (Recent full-year)' },
            { name: 'monthlySales', label: 'Current Year Monthly Sales' },
            { name: 'totalAssets', label: 'Total Asset Value on Balance Sheet (Recent full-year)' },
            { name: 'totalLiabilities', label: 'Total Liabilities on Balance Sheet (Recent full-year)' }
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm mb-1">{field.label}</label>
              <div className="flex items-center max-w-xs">
                <span className="mr-2">INR</span>
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border rounded text-sm"
                  placeholder="1000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const DocumentUpload = ({ formData, setFormData, pendingUploads, setPendingUploads }) => {
  const handleFileChange = async (event, fieldName) => {
    const files = Array.from(event.target.files);
    
    // Validate each file
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 5MB limit`);
        return;
      }
    }

    // Update pending uploads
    // setPendingUploads(prev => ({
    //   ...prev,
    //   [fieldName]: [...(prev[fieldName] || []), ...files]
    // }));

    // Create file entries with names
    const newFileEntries = files.map(file => ({
      name: file.name,
      type: fieldName === 'businessPhotos' ? 'image' : 'document',
      isNew: true
    }));

    // Update form data with file entries
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), ...newFileEntries]
    }));
  };

  const removeFile = (e, fieldName, index) => {
    e.preventDefault();
    
    const fileToRemove = formData[fieldName][index];
    
    // If it's a new file, remove from pending uploads
    // if (fileToRemove.isNew) {
    //   setPendingUploads(prev => ({
    //     ...prev,
    //     [fieldName]: (prev[fieldName] || []).filter((_, i) => 
    //       prev[fieldName][i].name !== fileToRemove.name
    //     )
    //   }));
    // }

    // Remove from form data
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
};

  return (
    <Card title="Documents & Proof">
      <div className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm font-medium mb-2">
            Business Photos (up to 5MB each)
            <InfoTooltip
              text={`1. Photos submitted in this section are not disclosed publicly, except to investors of your choice. 2. You can upload multiple files. 3. Ensure photos are clear, complete and legible.`}
            />
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'businessPhotos')}
            className="block w-full text-sm text-gray-500 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50"
            accept="image/*"
            multiple
          />
          <div className="mt-2 space-y-2">
            {formData.businessPhotos?.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm truncate">{item.name}</span>
                <button
                  type="button"
                  onClick={(e) => removeFile(e, 'businessPhotos', index)}
                  className="text-red-500 hover:text-red-600 ml-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Legal Documents (up to 5MB each)
            <InfoTooltip text="1. Documents submitted in this section are not disclosed publicly, except to investors of your choice. 2. You can upload multiple files. 3. Ensure documents are clear, complete and legible." />
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'legalDocs')}
            className="block w-full text-sm text-gray-500 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50"
            accept=".pdf,.doc,.docx"
            multiple
          />
          <div className="mt-2 space-y-2">
            {formData.legalDocs?.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm truncate">{item.name}</span>
                <button
                  type="button"
                  onClick={(e) => removeFile(e, 'legalDocs', index)}
                  className="text-red-500 hover:text-red-600 ml-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Marketing Material (up to 5MB each)
            <InfoTooltip text="1. Documents submitted in this section are not disclosed publicly, except to investors of your choice. 2. You can upload multiple files. 3. Ensure documents are clear, complete and legible." />
          </label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, 'marketingDocs')}
            className="block w-full text-sm text-gray-500 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50"
            accept=".pdf,.doc,.docx"
            multiple
          />
          <div className="mt-2 space-y-2">
            {formData.marketingDocs?.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm truncate">{item.name}</span>
                <button
                  type="button"
                  onClick={(e) => removeFile(e, 'marketingDocs', index)}
                  className="text-red-500 hover:text-red-600 ml-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
// const TermsAndConditions = ({ formData, setFormData, errors }) => (
//   <Card title="Terms and Conditions">
//     <div className="flex items-start space-x-2">
//       <input
//         type="checkbox"
//         id="terms"
//         name="termsAccepted"
//         checked={Boolean(formData.termsAccepted)} // Explicitly convert to boolean
//         onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
//         className={`mt-1 ${errors?.termsAccepted ? 'border-red-500' : ''}`}
//       />
//       <div className="flex flex-col">
//         <label htmlFor="terms" className={`text-sm ${errors?.termsAccepted ? 'text-red-500' : 'text-gray-600'}`}>
//           I accept the terms and conditions and authorize <span className="font-semibold">SMEInvestorHub</span> to contact me further for information and business transactions.
//         </label>
//         {errors?.termsAccepted && (
//           <p className="text-red-500 text-xs mt-1">Please accept the terms and conditions</p>
//         )}
//       </div>
//     </div>
//   </Card>
// );
const TermsAndConditions = ({ formData, setFormData, errors }) => (
  <Card title="Terms and Conditions">
    <div className="flex items-start space-x-2">
      <input
        type="checkbox"
        id="terms"
        name="termsAccepted"
        checked={Boolean(formData.termsAccepted)}
        onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
        className={`mt-1 ${errors?.termsAccepted ? 'border-red-500' : ''}`}
      />
      <div className="flex flex-col">
        <label htmlFor="terms" className="text-sm text-gray-600">
          I accept the terms and conditions and authorize <span className="font-semibold">Connectiv</span> to contact me further for information and business transactions.
        </label>
        {errors?.termsAccepted && (
          <p className="text-red-500 text-xs mt-1">Please accept the terms and conditions</p>
        )}
      </div>
    </div>
  </Card>
);
// Add this helper function at the top of your BusinessProposalForm component
const areFormDatasEqual = (data1, data2) => {
  // Helper function to clean up data for comparison
  const cleanData = (data) => {
    const cleaned = { ...data };
    // Remove properties that shouldn't trigger the unsaved changes warning
    delete cleaned.emailError;
    
    // Convert all values to strings for consistent comparison and handle empty values
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === null || cleaned[key] === undefined) {
        cleaned[key] = '';
      } else if (typeof cleaned[key] === 'number') {
        cleaned[key] = cleaned[key].toString();
      } else if (Array.isArray(cleaned[key])) {
        // Handle arrays (like documents)
        cleaned[key] = JSON.stringify(cleaned[key]);
      }
    });
    return cleaned;
  };

  // Clean both data objects
  const cleanData1 = cleanData(data1);
  const cleanData2 = cleanData(data2);

  // Compare stringified versions of the cleaned data
  return JSON.stringify(cleanData1) === JSON.stringify(cleanData2);
};
const BusinessProposalForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const { businessProposal, setBusinessProposal } = useBusinessProposal();
  const { userDetails } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [proposalData, setProposalData] = useState(null);
  const currentStep = 1;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  const [errors, setErrors] = useState({
    personalName: false,
    businessLegalName: false,
    mobileNo: false,
    primaryEmail: false,
    termsAccepted: false 
  });
  // const [pendingUploads, setPendingUploads] = useState({
  //   businessPhotos: null,
  //   legalDocs: null,
  //   marketingDocs: null
  // });
  
  const [formData, setFormData] = useState({
    userId: userDetails?.userId || '',
    personalName: '',
    businessLegalName: '',
    mobileNo: '',
    primaryEmail: '',
    designation: '',
    legalEntityType: '',
    establishedYear: '',
    businessLocation: '',
    industry: '',
    shortBusinessDesc: '',
    businessDesc: '',
    keyProducts: '',
    businessStrengths: '',
    annualSales: '',
    annualEBITDA: '',
    monthlySales: '',
    totalAssets: '',
    totalLiabilities: '',
  //   businessPhotos: [], // Initialize as empty array
  // legalDocs: [], // Initialize as empty array
  // marketingDocs: [],
    termsAccepted: false
  });

  const fetchProposalData = async (proposalId) => {
    setIsFetching(true);
    setError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-proposal/${proposalId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch proposal: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Response data:', JSON.stringify(responseData, null, 2));

      if (!responseData.status || !responseData.data) {
        throw new Error(responseData.message || 'Failed to fetch proposal data');
      }

      const fetchedProposal = responseData.data;
      setProposalData(fetchedProposal);

      // Process documents from backend
    //   const processDocuments = (documents, type) => {
    //     const typeMapping = {
    //         "businessPhoto": "business_photo",
    //         "legaldoc": "legal_doc",
    //         "marketingDocs": "market_doc",
    //         "business_photo": "business_photo",
    //         "legal_doc": "legal_doc",
    //         "market_doc": "market_doc"
    //     };
    
    //     if (!documents || !Array.isArray(documents)) {
    //         console.log('No documents or invalid documents array');
    //         return [];
    //     }
    
    //     const backendType = typeMapping[type] || type;
    
    //     console.log('Processing documents:', {
    //         documents,
    //         requestedType: type,
    //         mappedType: backendType,
    //         documentTypes: documents.map(doc => doc.type)
    //     });
    
    //     const filteredDocs = documents.filter(doc => {
    //         const match = doc.type === backendType;
    //         if (!match) {
    //             console.log(`Type mismatch - Document type: ${doc.type}, Looking for: ${backendType}`);
    //         }
    //         return match;
    //     });
    
    //     console.log('Filtered documents:', filteredDocs);
    
    //     const processedDocs = filteredDocs.map(doc => ({
    //       preview: doc.file,
    //       file: doc.file,
    //       type: type === "businessPhoto" || type === "business_photo" ? 'image' : 'document',
    //       name: doc.file.split('/').pop(),
    //       isNew: false // Mark as existing document
    //   }));
    
    //     console.log('Processed documents:', processedDocs);
    //     return processedDocs;
    // };

      // Create a single processed form data object
      const processedFormData = {
        userId: fetchedProposal.userId || userDetails?.userId || '',
        personalName: fetchedProposal.personalName || '',
        businessLegalName: fetchedProposal.businessLegalName || '',
        mobileNo: fetchedProposal.mobileNo || '',
        primaryEmail: fetchedProposal.primaryEmail || '',
        designation: fetchedProposal.designation || '',
        legalEntityType: fetchedProposal.legalEntityType || '',
        establishedYear: fetchedProposal.establishedYear || '',
        businessLocation: fetchedProposal.businessLocation || '',
        industry: fetchedProposal.industry || '',
        shortBusinessDesc: fetchedProposal.shortBusinessDesc || '',
        businessDesc: fetchedProposal.businessDesc || '',
        keyProducts: fetchedProposal.keyProducts || '',
        businessStrengths: fetchedProposal.businessStrengths || '',
        annualSales: fetchedProposal.annualSales || '',
        annualEBITDA: fetchedProposal.annualEBITDA || '',
        monthlySales: fetchedProposal.monthlySales || '',
        totalAssets: fetchedProposal.totalAssets || '',
        totalLiabilities: fetchedProposal.totalLiabilities || '',
        termsAccepted: Boolean(fetchedProposal.termsAccepted),
        // businessPhotos: processDocuments(fetchedProposal.documents, "business_photo"),
        // legalDocs: processDocuments(fetchedProposal.documents, "legal_doc"),
        // marketingDocs: processDocuments(fetchedProposal.documents, "market_doc")
      };

      // Update form data
      setFormData(processedFormData);

      // Set initial form data with a deep copy to avoid reference issues
      setInitialFormData(JSON.parse(JSON.stringify(processedFormData)));

      // Update context with fresh data
      // setBusinessProposal(prev => ({
      //   ...prev,
      //   ...fetchedProposal,
      //   documents: fetchedProposal.documents || []
      // }));

      setHasUnsavedChanges(false);

    } catch (err) {
      console.error('Error fetching proposal:', err);
      setError(err.message || 'Failed to fetch proposal data. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };
  
// Effect to fetch proposal data if ID is available
useEffect(() => {
  const proposalId = location.state?.proposalId;
  if (proposalId) {
    fetchProposalData(proposalId);
  } else {
    // For new proposals, set initial form data with default values
    const defaultFormData = {
      userId: userDetails?.userId || '',
      personalName: '',
      businessLegalName: '',
      mobileNo: '',
      primaryEmail: '',
      designation: '',
      legalEntityType: '',
      establishedYear: '',
      businessLocation: '',
      industry: '',
      shortBusinessDesc: '',
      businessDesc: '',
      keyProducts: '',
      businessStrengths: '',
      annualSales: '',
      annualEBITDA: '',
      monthlySales: '',
      totalAssets: '',
      totalLiabilities: '',
      termsAccepted: false,
      businessPhotos: [],
      legalDocs: [],
      marketingDocs: []
    };
    
    setFormData(defaultFormData);
    // Set initial form data for change tracking
    setInitialFormData(JSON.parse(JSON.stringify(defaultFormData)));
  }
}, [location.state?.proposalId, userDetails?.userId]);
console.log('Form submission data:', {
  ...formData,
  termsAccepted: Boolean(formData.termsAccepted)
});
// Add a refresh function that can be called when needed
const refreshProposalData = () => {
  const proposalId = location.state?.proposalId;
  if (proposalId) {
    fetchProposalData(proposalId);
  }
};


useEffect(() => {
  if (userDetails?.userId) {
    setFormData(prev => ({
      ...prev,
      userId: userDetails.userId
    }));
  }
}, [userDetails]);
// Replace your existing form change tracking useEffect with this:
useEffect(() => {
  if (initialFormData) {  // Only check if initialFormData exists
    const hasChanges = !areFormDatasEqual(initialFormData, formData);
    console.log('Change detected:', hasChanges);  // For debugging
    setHasUnsavedChanges(hasChanges);
  }
}, [formData, initialFormData]);
const validateForm = () => {
  const newErrors = {
    personalName: !formData.personalName.trim(),
    businessLegalName: !formData.businessLegalName.trim(),
    mobileNo: !formData.mobileNo.trim(),
    primaryEmail: !formData.primaryEmail.trim(),
    termsAccepted: !formData.termsAccepted
  };
  
  setErrors(newErrors);
  return !Object.values(newErrors).some(error => error);
};
const handleSave = async (e) => {
  e.preventDefault();
  setError('');
  
  if (!validateForm()) {
    setError('Please fill in all mandatory fields');
    return;
  }
  if (!formData.userId) {
    setError('User not authenticated. Please log in.');
    setIsLoading(false);
    return;
  }

  setIsLoading(true);
  try {
    // const documents = [];
    
    // const uploadTypes = {
    //   businessPhotos: "business_photo",
    //   legalDocs: "legal_doc",
    //   marketingDocs: "market_doc"
    // };

    // for (const [fieldName, docType] of Object.entries(uploadTypes)) {
    //   const existingDocs = formData[fieldName]?.filter(doc => !doc.isNew) || [];
    //   existingDocs.forEach(doc => {
    //     if (doc.file) {
    //       documents.push({
    //         type: docType,
    //         file: doc.file
    //       });
    //     }
    //   });
    // }

    // Then handle new uploads
    // for (const [uploadKey, docType] of Object.entries(uploadTypes)) {
    //   if (pendingUploads[uploadKey]?.length) {
    //     for (const file of pendingUploads[uploadKey]) {
    //       const uploadResult = await uploadToS3(file);
    //       if (uploadResult.success) {
    //         documents.push({
    //           type: docType,
    //           file: uploadResult.url
    //         });
    //       }
    //     }
    //   }
    // }

    const dataToSend = {
      userId: formData.userId,
      personalName: formData.personalName || '',
      businessLegalName: formData.businessLegalName || '',
      mobileNo: formData.mobileNo || '',
      primaryEmail: formData.primaryEmail || '',
      designation: formData.designation || '',
      legalEntityType: formData.legalEntityType || '',
      establishedYear: formData.establishedYear || '',
      businessLocation: formData.businessLocation || '',
      industry: formData.industry || '',
      shortBusinessDesc: formData.shortBusinessDesc || '',
      businessDesc: formData.businessDesc || '',
      keyProducts: formData.keyProducts || '',
      businessStrengths: formData.businessStrengths || '',
      annualSales: formData.annualSales || 0,
      annualEBITDA: formData.annualEBITDA || 0,
      monthlySales: formData.monthlySales || 0,
      totalAssets: formData.totalAssets || 0,
      totalLiabilities: formData.totalLiabilities || 0,
      termsAccepted: formData.termsAccepted,
      // documents: documents
    };

    const proposalId = location.state?.proposalId;
    const endpoint = proposalId 
      ? `${API_BASE_URL}/api/business-proposal/update-proposal`
      : `${API_BASE_URL}/api/business-proposal/create`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(proposalId ? { ...dataToSend, proposalId } : dataToSend)
    });

    if (!response.ok) {
      throw new Error('Failed to save proposal');
    }

    const responseData = await response.json();
    
    if (!responseData.status) {
      throw new Error(responseData.message || 'Failed to save proposal');
    }

    // After successful save, update the proposalId in location state if it's a new proposal
    if (!proposalId) {
      navigate(location.pathname, {
        state: { proposalId: responseData.data._id },
        replace: true
      });
    }
    // setPendingUploads({
    //   businessPhotos: null,
    //   legalDocs: null,
    //   marketingDocs: null
    // });
    // Refresh the data
    if (proposalId) {
      await fetchProposalData(proposalId);
    }
    // const savedFormData = JSON.parse(JSON.stringify(formData));
    // setInitialFormData(savedFormData);
    setHasUnsavedChanges(false);
    toast.success('Changes saved successfully!');
   

  } catch (err) {
    console.error('Error saving form:', err);
    setError(err.message || 'Failed to save form. Please try again.');
    toast.error('Failed to save changes. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

// Add new function to handle navigation to next page
const handleNext = () => {
  const proposalId = location.state?.proposalId;
  
  if (!proposalId) {
    toast.error('Please save the proposal before proceeding to the next step');
    return;
  }

  if (hasUnsavedChanges) {
    setPendingNavigation('next');
    setShowConfirmDialog(true);
    return;
  }

  navigateNext();
};

// Add this new function
const navigateNext = () => {
  // Save the current user details before navigation
  const currentUserDetails = localStorage.getItem('userDetails');
  
  navigate('/business-valuation', {
    state: { 
      proposalId: location.state?.proposalId,
      shouldRefresh: true,
      // Pass the previous user details
      userDetails: currentUserDetails ? JSON.parse(currentUserDetails) : null
    }
  });
};

// Modify handleCancel
const handleCancel = () => {
  if (hasUnsavedChanges) {
    setPendingNavigation('cancel');
    setShowConfirmDialog(true);
    return;
  }
  
  navigateCancel();
};

// Add this new function
const navigateCancel = () => {
  navigate('/home');
};

// Add these new handlers
const handleConfirmNavigation = () => {
  setShowConfirmDialog(false);
  
  if (pendingNavigation === 'next') {
    navigateNext();
  } else if (pendingNavigation === 'cancel') {
    navigateCancel();
  }
  
  // Reset form data and pending uploads
  setFormData(initialFormData);
  setPendingUploads({
    businessPhotos: null,
    legalDocs: null,
    marketingDocs: null
  });
  setHasUnsavedChanges(false);
  setPendingNavigation(null);
  
  toast.info('Changes have been discarded');
};
const handleCancelNavigation = () => {
  setShowConfirmDialog(false);
  setPendingNavigation(null);
};

return (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <Navigation currentStep={currentStep} />
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Updated title with explicit info message */}
        <div className="mb-6">
  <h1 className="text-2xl font-bold">1. Business Profile Registration <span className="text-sm font-normal text-gray-600">(Provide basic details about your business to register on the portal)</span></h1>
</div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

      {isFetching ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <ConfidentialInfo formData={formData} setFormData={setFormData} errors={errors} />
          <BusinessInfo formData={formData} setFormData={setFormData} />
          {/* <DocumentUpload 
            formData={formData} 
            setFormData={setFormData} 
            pendingUploads={pendingUploads}
            setPendingUploads={setPendingUploads}
          /> */}
          <TermsAndConditions 
            formData={formData} 
            setFormData={setFormData} 
            errors={errors}
          />
          <div className="flex justify-center gap-4 mt-8">
            <button 
              type="button"
              onClick={handleCancel}
              className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 
                font-medium transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                font-medium transition-colors text-sm ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save'
              )}
            </button>
            <button 
              type="button"
              onClick={handleNext}
              disabled={isLoading || !location.state?.proposalId}
              className={`px-8 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 
                font-medium transition-colors text-sm ${(isLoading || !location.state?.proposalId) ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              Next
            </button>
          </div>
        </form>
      )}

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Unsaved Changes</h2>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Would you like to discard these changes and restore the previous version?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelNavigation}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Keep Changes
              </button>
              <button
                onClick={handleConfirmNavigation}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
};
export default BusinessProposalForm;