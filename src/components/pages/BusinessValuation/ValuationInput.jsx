// import React, { useEffect, useState } from 'react';

// const ValuationInput = ({ 
//   label, 
//   years, 
//   values, 
//   onValueChange, 
//   onYearChange,
//   infoText,
//   disabled = false,
//   valuationType = 'ebitda',
//   yearReadOnly = false,
//   showLabel = true
// }) => {
//   // Initialize cleanedValues by removing the index suffixes
//   const [cleanedValues, setCleanedValues] = useState({});

//   useEffect(() => {
//     // Clean up the values object by removing index suffixes
//     const cleaned = {};
//     if (values) {
//       Object.entries(values).forEach(([key, value]) => {
//         // Remove any _0, _1, etc. suffixes from the year
//         const baseYear = key.split('_')[0];
//         if (!cleaned[baseYear] || key === baseYear) {
//           cleaned[baseYear] = value;
//         }
//       });
//     }
//     setCleanedValues(cleaned);
//   }, [values]);

//   const yearPlaceholder = (index) => {
//     const currentYear = new Date().getFullYear();
    
//     if (valuationType === 'ebitda') {
//       return `03-${currentYear - (3 - index)}`;
//     } else {
//       const nextYear = currentYear + 1;
//       return `03-${nextYear + index}`;   
//     }
//   };

//   // Ensure years is always an array and remove any duplicates
//   const safeYears = Array.from(new Set(Array.isArray(years) ? years : []));
  
//   const handleYearChange = (index, newYear) => {
//     if (!yearReadOnly) {
//       onYearChange(index, newYear);
//     }
//   };

//   const handleValueChange = (index, value) => {
//     const year = safeYears[index] || `temp_${index}`;
//     // Use the base year without index suffix
//     onValueChange(year, value);
//   };

//   return (
//     <div className="mb-6">
//       {showLabel && label && (
//         <div className="flex items-center justify-between mb-2">
//           <div className="flex items-center gap-2">
//             <span className="text-sm font-medium">{label}</span>
//           </div>
//         </div>
//       )}
//       <div className="grid grid-cols-5 gap-4">
//         {safeYears.map((year, index) => (
//           <div key={index} className="flex flex-col">
//             <input
//               type="text"
//               value={year}
//               onChange={(e) => handleYearChange(index, e.target.value)}
//               className="w-full p-2 border rounded text-sm mb-1 bg-gray-300 font-bold"
//               placeholder={yearPlaceholder(index)}
//               disabled={yearReadOnly || disabled}
//             />
//             <input
//               type="text"
//               value={cleanedValues[year] || ''}
//               onChange={(e) => handleValueChange(index, e.target.value)}
//               className={`w-full p-2 border rounded text-sm ${
//                 disabled ? 'bg-gray-50 cursor-not-allowed' : ''
//               }`}
//               placeholder="INR 10,00,000"
//               disabled={disabled}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ValuationInput;




import React, { useEffect, useState } from 'react';

const ValuationInput = ({ 
  label, 
  years, 
  values, 
  onValueChange, 
  onYearChange,
  infoText,
  disabled = false,
  valuationType = 'ebitda',
  yearReadOnly = false,
  showLabel = true
}) => {
  // Initialize cleanedValues by removing the index suffixes
  const [cleanedValues, setCleanedValues] = useState({});

  // Determine the number of fields based on valuation type
  const numberOfFields = valuationType === 'ebitda' ? 4 : 5;

  // Create initial years array if none provided
  const initialYears = Array(numberOfFields).fill('');
  const safeYears = Array.isArray(years) && years.length > 0 
    ? Array.from(new Set(years)) 
    : initialYears;

  useEffect(() => {
    // Clean up the values object by removing index suffixes
    const cleaned = {};
    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        // Remove any _0, _1, etc. suffixes from the year
        const baseYear = key.split('_')[0];
        if (!cleaned[baseYear] || key === baseYear) {
          cleaned[baseYear] = value;
        }
      });
    }
    setCleanedValues(cleaned);
  }, [values]);

  const yearPlaceholder = (index) => {
    const currentYear = new Date().getFullYear();
    
    if (valuationType === 'ebitda') {
      return `03-${currentYear - (3 - index)}`;
    } else {
      const nextYear = currentYear + 1;
      return `03-${nextYear + index}`;   
    }
  };

  const handleYearChange = (index, newYear) => {
    if (!yearReadOnly) {
      onYearChange(index, newYear);
    }
  };

  const handleValueChange = (index, value) => {
    const year = safeYears[index] || `temp_${index}`;
    // Use the base year without index suffix
    onValueChange(year, value);
  };

  // Create an array of indices based on the number of fields
  const fieldIndices = Array.from({ length: numberOfFields }, (_, i) => i);

  return (
    <div className="mb-6">
      {showLabel && label && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
          </div>
        </div>
      )}
      <div className={`grid grid-cols-${numberOfFields} gap-4`}>
        {fieldIndices.map((index) => (
          <div key={index} className="flex flex-col">
            <input
              type="text"
              value={safeYears[index] || ''}
              onChange={(e) => handleYearChange(index, e.target.value)}
              className="w-full p-2 border rounded text-sm mb-1 bg-gray-300 font-bold"
              placeholder={yearPlaceholder(index)}
              disabled={yearReadOnly || disabled}
            />
            <input
              type="text"
              value={cleanedValues[safeYears[index]] || ''}
              onChange={(e) => handleValueChange(index, e.target.value)}
              className={`w-full p-2 border rounded text-sm ${
                disabled ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              placeholder="INR 10,00,000"
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValuationInput;
// import React, { useEffect, useState } from 'react';

// const ValuationInput = ({ 
//   label, 
//   years, 
//   values, 
//   onValueChange, 
//   onYearChange,
//   infoText,
//   disabled = false,
//   valuationType = 'ebitda',
//   yearReadOnly = false,
//   showLabel = true
// }) => {
//   // Initialize cleanedValues by removing the index suffixes and maintaining a single value per year
//   const [cleanedValues, setCleanedValues] = useState({});
//   const [previousYears, setPreviousYears] = useState([]);

//   // Determine the number of fields based on valuation type
//   const numberOfFields = valuationType === 'ebitda' ? 4 : 5;

//   // Create initial years array if none provided
//   const initialYears = Array(numberOfFields).fill('');
//   const safeYears = Array.isArray(years) && years.length > 0 
//     ? Array.from(new Set(years)) 
//     : initialYears;

//   useEffect(() => {
//     // Keep track of previous years for comparison
//     setPreviousYears(safeYears);

//     // Clean up the values object by removing index suffixes and handling year changes
//     const cleaned = {};
//     if (values) {
//       Object.entries(values).forEach(([key, value]) => {
//         const baseYear = key.split('_')[0];
//         // Only keep the latest value for each base year
//         cleaned[baseYear] = value;
//       });
//     }
//     setCleanedValues(cleaned);
//   }, [values]);

//   const yearPlaceholder = (index) => {
//     const currentYear = new Date().getFullYear();
    
//     if (valuationType === 'ebitda') {
//       return `03-${currentYear - (3 - index)}`;
//     } else {
//       const nextYear = currentYear + 1;
//       return `03-${nextYear + index}`;   
//     }
//   };

//   const handleYearChange = (index, newYear) => {
//     if (!yearReadOnly) {
//       const oldYear = previousYears[index];
      
//       // If there was a previous year and it's different from the new year
//       if (oldYear && oldYear !== newYear) {
//         // Move the value from old year to new year
//         const valueToMove = cleanedValues[oldYear];
//         const updatedValues = { ...cleanedValues };
        
//         // Remove old year's value
//         delete updatedValues[oldYear];
        
//         // Set value for new year if there was a previous value
//         if (valueToMove !== undefined) {
//           updatedValues[newYear] = valueToMove;
//           setCleanedValues(updatedValues);
          
//           // Notify parent of value change for new year
//           onValueChange(newYear, valueToMove);
          
//           // Set value to empty for old year to ensure it's cleared in parent
//           onValueChange(oldYear, '');
//         }
//       }
      
//       // Update the year in parent component
//       onYearChange(index, newYear);
      
//       // Update previous years
//       const newYears = [...previousYears];
//       newYears[index] = newYear;
//       setPreviousYears(newYears);
//     }
//   };

//   const handleValueChange = (index, value) => {
//     const year = safeYears[index] || `temp_${index}`;
//     const baseYear = year.split('_')[0];
    
//     // Update cleaned values
//     setCleanedValues(prev => ({
//       ...prev,
//       [baseYear]: value
//     }));
    
//     // Notify parent of value change
//     onValueChange(baseYear, value);
//   };

//   // Create an array of indices based on the number of fields
//   const fieldIndices = Array.from({ length: numberOfFields }, (_, i) => i);

//   return (
//     <div className="mb-6">
//       {showLabel && label && (
//         <div className="flex items-center justify-between mb-2">
//           <div className="flex items-center gap-2">
//             <span className="text-sm font-medium">{label}</span>
//           </div>
//         </div>
//       )}
//       <div className={`grid grid-cols-${numberOfFields} gap-4`}>
//         {fieldIndices.map((index) => (
//           <div key={index} className="flex flex-col">
//             <input
//               type="text"
//               value={safeYears[index] || ''}
//               onChange={(e) => handleYearChange(index, e.target.value)}
//               className="w-full p-2 border rounded text-sm mb-1 bg-gray-300 font-bold"
//               placeholder={yearPlaceholder(index)}
//               disabled={yearReadOnly || disabled}
//             />
//             <input
//               type="text"
//               value={cleanedValues[safeYears[index]] || ''}
//               onChange={(e) => handleValueChange(index, e.target.value)}
//               className={`w-full p-2 border rounded text-sm ${
//                 disabled ? 'bg-gray-50 cursor-not-allowed' : ''
//               }`}
//               placeholder="INR 10,00,000"
//               disabled={disabled}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ValuationInput;