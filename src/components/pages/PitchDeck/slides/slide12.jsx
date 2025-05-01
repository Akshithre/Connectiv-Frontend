

import React, { useState, useEffect, useMemo } from 'react';
import { Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { usePitchDeck } from '../context/PitchDeckContext';
const inputStyle = "w-16 py-0.5 px-1 border rounded text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
import { pitchDeckApi } from '../../../../services/pitchDeckApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const formatCurrency = (value) => {
  if (value === undefined || value === null || isNaN(value)) return 'INR 0';
  return `INR ${Number(value).toLocaleString('en-IN')}`;
};

const validateNumericInput = (value, min = 0) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min;
};

// Default values for the slide
const DEFAULT_VALUES = {
  ebitdaMultiple: '10',
  externalNetDebt: '1000',
  ebitda: '1000',
  adjustmentsPositive: '100',
  adjustmentsNegative: '50',
  shares: '1000',
  exitTransferPercent: '20',
  seriesANotes: '',
  positiveAdjustmentDetails: '',
  negativeAdjustmentDetails: '',
  previousYear: '10000'
};

const transformDataForBackend = (inputs, calculatedValues) => {
  return {
    proposalId: inputs.proposalId,
    ebitdaMultiple: parseFloat(inputs.ebitdaMultiple) || 0,
    externalNetDebt: parseFloat(inputs.externalNetDebt) || 0,
    ebitda_basedSchema: {
      categories: {
        "ebitda": inputs.ebitda?.toString() || "0",
        "+adjustments": inputs.adjustmentsPositive?.toString() || "0",
        "-adjustments": inputs.adjustmentsNegative?.toString() || "0",
        "ebitdaMultiple": inputs.ebitdaMultiple?.toString() || "0",
        "enterpriceVal": calculatedValues.enterpriseValue?.toString() || "0",
        "externalNetDebt": inputs.externalNetDebt?.toString() || "0",
        "equityVal": calculatedValues.equityValue?.toString() || "0",
        "shares": inputs.shares?.toString() || "0",
        "sharePrice": calculatedValues.sharePrice?.toString() || "0"
      },
      negativeAdjustments: inputs.negativeAdjustmentDetails || "",
      positiveAdjustments: inputs.positiveAdjustmentDetails || ""
    },
    existingStake: {
      "Valuation": calculatedValues.equityValue?.toString() || "0",
      "Shares": inputs.shares?.toString() || "0",
      "ShareP": calculatedValues.sharePrice?.toString() || "0",
      "Exit%": inputs.exitTransferPercent?.toString() || "0",
      "ExitTS": calculatedValues.exitTransferShares?.toString() || "0",
      "ExitTV": calculatedValues.exitTransferValue?.toString() || "0",
      "existingInvestors": "100",
      "newInvestors": inputs.exitTransferPercent?.toString() || "0"
    },
    seriesAnotes: inputs.seriesANotes || ""
  };
};
const Slide12 = () => {
  const { updateSlideData, getSlideData, proposalId } = usePitchDeck();
  const [expanded, setExpanded] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [editStates, setEditStates] = useState({
    ebitdaMultiple: false,
    externalNetDebt: false,
    ebitda: false,
    adjustmentsPositive: false,
    adjustmentsNegative: false,
    shares: false,
    exitTransferPercent: false,
    seriesAText: false
  });
  const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

const toastConfig = {
  position: "top-right",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

  // Initialize state from saved data or defaults
  const [inputs, setInputs] = useState(() => {
    const savedData = getSlideData(12);
    return savedData?.inputs || DEFAULT_VALUES;
  });

  // Memoize calculated values
  const calculatedValues = useMemo(() => {
    try {
      const adjustedEBITDA = Number(inputs.ebitda) + Number(inputs.adjustmentsPositive) - Number(inputs.adjustmentsNegative);
      const enterpriseValue = adjustedEBITDA * Number(inputs.ebitdaMultiple);
      const equityValue = enterpriseValue - Number(inputs.externalNetDebt);
      const sharePrice = equityValue / Number(inputs.shares);
      const exitTransferShares = (Number(inputs.exitTransferPercent) / 100) * Number(inputs.shares);
      const exitTransferValue = exitTransferShares * sharePrice;

      return {
        adjustedEBITDA,
        enterpriseValue,
        equityValue,
        sharePrice,
        exitTransferShares,
        exitTransferValue
      };
    } catch (error) {
      console.error('Calculation error:', error);
      return {
        adjustedEBITDA: 0,
        enterpriseValue: 0,
        equityValue: 0,
        sharePrice: 0,
        exitTransferShares: 0,
        exitTransferValue: 0
      };
    }
  }, [inputs]);
  useEffect(() => {
    const fetchData = async () => {
      if (!proposalId) {
        setIsLoading(false);
        return;
      }
  
      try {
        const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide12/${proposalId}`);
        const data = await response.json();
  
        if (!data.status) {
          throw new Error(data.message || 'Failed to fetch data');
        }
  
        if (data.data?.slide12) {
          const { slide12 } = data.data;
          
          // Transform the data to match your frontend structure
          const newInputs = {
            ...DEFAULT_VALUES,
            proposalId,
            ebitdaMultiple: slide12.ebitdaMultiple?.toString() || DEFAULT_VALUES.ebitdaMultiple,
            externalNetDebt: slide12.externalNetDebt?.toString() || DEFAULT_VALUES.externalNetDebt,
            ebitda: slide12.ebitda_basedSchema?.categories?.ebitda || DEFAULT_VALUES.ebitda,
            adjustmentsPositive: slide12.ebitda_basedSchema?.categories?.['+adjustments'] || DEFAULT_VALUES.adjustmentsPositive,
            adjustmentsNegative: slide12.ebitda_basedSchema?.categories?.['-adjustments'] || DEFAULT_VALUES.adjustmentsNegative,
            positiveAdjustmentDetails: slide12.ebitda_basedSchema?.positiveAdjustments || '',
            negativeAdjustmentDetails: slide12.ebitda_basedSchema?.negativeAdjustments || '',
            shares: slide12.ebitda_basedSchema?.categories?.shares || DEFAULT_VALUES.shares,
            exitTransferPercent: slide12.existingStake?.['Exit%'] || DEFAULT_VALUES.exitTransferPercent,
            seriesANotes: slide12.seriesAnotes || '',
            previousYear: DEFAULT_VALUES.previousYear
          };
  
          setInputs(newInputs);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [proposalId]);
  // Save data to context whenever inputs changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const transformedData = transformDataForBackend(inputs, calculatedValues);
      updateSlideData(12, transformedData);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputs, calculatedValues, updateSlideData]);

  const validateInput = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'ebitdaMultiple':
        if (!validateNumericInput(value, 1)) {
          newErrors[field] = 'Must be greater than 0';
        }
        break;
      case 'externalNetDebt':
      case 'ebitda':
      case 'shares':
      case 'adjustmentsPositive':
      case 'adjustmentsNegative':
        if (!validateNumericInput(value)) {
          newErrors[field] = 'Must be a positive number';
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleEdit = (field) => {
    setEditStates(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleInputChange = (field, value) => {
    if (validateInput(field, value)) {
      setInputs(prev => ({
        ...prev,
        [field]: value
      }));
      setIsDirty(true); // Set dirty when input changes
    }
  };

  const handleSave = async () => {
    if (!proposalId) return;
  
    try {
      const transformedData = transformDataForBackend(inputs, calculatedValues);
      
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide12`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData)
      });
  
      const data = await response.json();
  
      if (!data.status) {
        throw new Error(data.message || 'Failed to save data');
      }
  
      // Reset edit states
      setEditStates({
        ebitdaMultiple: false,
        externalNetDebt: false,
        ebitda: false,
        adjustmentsPositive: false,
        adjustmentsNegative: false,
        shares: false,
        exitTransferPercent: false,
        seriesAText: false
      });
      setIsDirty(false); // Reset dirty state after successful save
  
      // Clear existing toasts and show success
      toast.dismiss();
      toast.success('Changes saved successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        toastId: 'save-success',
        style: {
          background: '#17843f',
          color: 'white',
          fontWeight: '500',
        }
      });
  
    } catch (error) {
      console.error('Error saving data:', error);
      
      // Clear existing toasts and show error
      toast.dismiss();
      toast.error('Failed to save changes', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        toastId: 'save-error'
      });
      setIsDirty(true); // Keep dirty state if save fails
    }finally {
      setIsLoading(false);
    }
  };
  // Your existing JSX render code remains the same
  return (
    // Your existing JSX remains the same...
    <div className="max-w-7xl mx-auto p-2 relative">
      {isLoading && (
  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <div className="text-lg font-medium text-gray-600">Loading...</div>
  </div>
)}

{error && (
  <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
    <div className="flex items-center">
      <span className="mr-2">{error}</span>
      <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">×</button>
    </div>
  </div>
)}
      <div className="grid grid-cols-3 gap-4">
        {/* EBITDA Valuation Section */}
        <div className="col-span-2 border-4 border-green-700 rounded-lg p-2">
          <h2 className="text-lg font-bold text-green-700 mb-1">EBITDA-based Valuation Basis</h2>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-gray-200 py-0.5 px-1">
              <div className="flex justify-between items-center h-6">
                <span className="text-sm">EBITDA Multiple</span>
                <div className="flex items-center">
                  {editStates.ebitdaMultiple ? (
                    <div className="flex flex-col">
                      <input
                        type="number"
                        value={inputs.ebitdaMultiple}
                        onChange={(e) => handleInputChange('ebitdaMultiple', e.target.value)}
                        className="w-16 py-0.5 px-1 border rounded text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.ebitdaMultiple && (
                        <span className="text-xs text-red-500">{errors.ebitdaMultiple}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm">x {inputs.ebitdaMultiple}</span>
                  )}
                  <Edit
                    className="w-3.5 h-3.5 ml-1 cursor-pointer"
                    onClick={() => toggleEdit('ebitdaMultiple')}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-200 py-0.5 px-1">
              <div className="flex justify-between items-center h-6">
                <span className="text-sm">External Net Debt</span>
                <div className="flex items-center">
                  {editStates.externalNetDebt ? (
                    <div className="flex flex-col">
                      <input
                        type="number"
                        value={inputs.externalNetDebt}
                        onChange={(e) => handleInputChange('externalNetDebt', e.target.value)}
                        className="w-20 py-0.5 px-1 border rounded text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {errors.externalNetDebt && (
                        <span className="text-xs text-red-500">{errors.externalNetDebt}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm">{formatCurrency(inputs.externalNetDebt)}</span>
                  )}
                  <Edit
                    className="w-3.5 h-3.5 ml-1 cursor-pointer"
                    onClick={() => toggleEdit('externalNetDebt')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Main calculation table */}
            <div className="border rounded">
              <table className="w-full border-collapse">
                <tbody>
                  {/* Previous Year Row */}
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm"></td>
                    <td className="border py-0.5 px-1 text-sm text-center font-bold">Previous Year</td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm"></td>
                    <td className="border py-0.5 px-1 text-sm text-center">
                      {formatCurrency(inputs.previousYear)}
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">EBITDA</td>
                    <td className="border py-0.5 px-1">
                      <div className="flex justify-between items-center">
                        {editStates.ebitda ? (
                          <input
                            type="number"
                            value={inputs.ebitda}
                            onChange={(e) => handleInputChange('ebitda', e.target.value)}
                            className="w-20 py-0.5 px-1 border rounded text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        ) : (
                          <span className="text-sm">{formatCurrency(inputs.ebitda)}</span>
                        )}
                        <Edit
                          className="w-3.5 h-3.5 ml-1 cursor-pointer"
                          onClick={() => toggleEdit('ebitda')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">(+) Adjustments</td>
                    <td className="border py-0.5 px-1">
                      <div className="flex justify-between items-center">
                        {editStates.adjustmentsPositive ? (
                          <input
                            type="number"
                            value={inputs.adjustmentsPositive}
                            onChange={(e) => handleInputChange('adjustmentsPositive', e.target.value)}
                            className="w-20 py-0.5 px-1 border rounded text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        ) : (
                          <span className="text-sm">{formatCurrency(inputs.adjustmentsPositive)}</span>
                        )}
                        <Edit
                          className="w-3.5 h-3.5 ml-1 cursor-pointer"
                          onClick={() => toggleEdit('adjustmentsPositive')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">(-) Adjustments</td>
                    <td className="border py-0.5 px-1">
                      <div className="flex justify-between items-center">
                        {editStates.adjustmentsNegative ? (
                          <input
                            type="number"
                            value={inputs.adjustmentsNegative}
                            onChange={(e) => handleInputChange('adjustmentsNegative', e.target.value)}
                            className="w-20 py-0.5 px-1 border rounded text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        ) : (
                          <span className="text-sm">{formatCurrency(inputs.adjustmentsNegative)}</span>
                        )}
                        <Edit
                          className="w-3.5 h-3.5 ml-1 cursor-pointer"
                          onClick={() => toggleEdit('adjustmentsNegative')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">Adjusted EBITDA</td>
                    <td className="border py-0.5 px-1 text-sm text-center">
                      {formatCurrency(calculatedValues.adjustedEBITDA)}
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">EBITDA Multiple</td>
                    <td className="border py-0.5 px-1 text-sm text-center">x {inputs.ebitdaMultiple}</td>
                  </tr>
                  <tr className="h-6 bg-blue-50">
                    <td className="border py-0.5 px-1 text-sm">EV</td>
                    <td className="border py-0.5 px-1 text-sm text-center">
                      {formatCurrency(calculatedValues.enterpriseValue)}
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">(-) External Net Debt</td>
                    <td className="border py-0.5 px-1 text-sm text-center">
                      {formatCurrency(inputs.externalNetDebt)}
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">Equity Value</td>
                    <td className="border py-0.5 px-1 text-sm text-center">
                      {formatCurrency(calculatedValues.equityValue)}
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm"># Shares</td>
                    <td className="border py-0.5 px-1">
                      <div className="flex justify-between items-center">
                        {editStates.shares ? (
                          <input
                            type="number"
                            value={inputs.shares}
                            onChange={(e) => handleInputChange('shares', e.target.value)}
                            className="w-20 py-0.5 px-1 border rounded text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        ) : (
                          <span className="text-sm text-center w-full">
                            {Number(inputs.shares).toLocaleString()}
                          </span>
                        )}
                        <Edit
                          className="w-3.5 h-3.5 ml-1 cursor-pointer"
                          onClick={() => toggleEdit('shares')}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">Share Price</td>
                    <td className="border py-0.5 px-1 text-sm text-center">
                      {formatCurrency(calculatedValues.sharePrice)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Adjustments Details Section */}
            <div className="space-y-2">
              <div className="border rounded p-2">
                <h3 className="font-bold text-sm mb-1">
                  (+) Adjustments: {formatCurrency(inputs.adjustmentsPositive)}
                </h3>
                <textarea
                  value={inputs.positiveAdjustmentDetails}
                  onChange={(e) => handleInputChange('positiveAdjustmentDetails', e.target.value)}
                  className="w-full h-28 p-2 border rounded text-sm"
                  placeholder="Enter positive adjustment details..."
                />
              </div>

              <div className="border rounded p-2">
                <h3 className="font-bold text-sm mb-1">
                  (-) Adjustments: {formatCurrency(inputs.adjustmentsNegative)}
                </h3>
                <textarea
                  value={inputs.negativeAdjustmentDetails}
                  onChange={(e) => handleInputChange('negativeAdjustmentDetails', e.target.value)}
                  className="w-full h-28 p-2 border rounded text-sm"
                  placeholder="Enter negative adjustment details..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 space-y-2">
          {/* Exit Section */}
          <div className="border-4 border-green-700 rounded-lg">
            <div className="bg-green-700 text-white py-0.5 px-1 text-center">
              <h2 className="text-base font-bold">Existing Stake - Exit</h2>
              <p className="text-xs">Valuation and Shareholding</p>
            </div>

            <div className="p-1.5 space-y-1">
              {/* Valuation Row */}
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm">Valuation</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {formatCurrency(calculatedValues.equityValue)}
                </div>
              </div>

              {/* # Shares Row */}
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm"># Shares</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {Number(inputs.shares).toLocaleString()}
                </div>
              </div>

              {/* Share Price Row */}
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm">Share Price</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {formatCurrency(calculatedValues.sharePrice)}
                </div>
              </div>

              {/* Exit Transfer % Row */}
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-blue-600 text-white py-0.5 px-1 text-sm">Exit / Transfer %</div>
                <div className="bg-gray-200 py-0.5 px-1">
                  <div className="flex items-center justify-between">
                    {editStates.exitTransferPercent ? (
                      <input
                        type="number"
                        value={inputs.exitTransferPercent}
                        onChange={(e) => handleInputChange('exitTransferPercent', e.target.value)}
                        className="w-16 py-0.5 px-1 border rounded text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="0"
                        max="100"
                      />
                    ) : (
                      <span className="text-sm text-center w-full">{inputs.exitTransferPercent}%</span>
                    )}
                    <Edit
                      className="w-3.5 h-3.5 ml-1 cursor-pointer"
                      onClick={() => toggleEdit('exitTransferPercent')}
                    />
                  </div>
                </div>
              </div>

              {/* Exit Transfer Shares Row */}
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-blue-600 text-white py-0.5 px-1 text-sm">Exit / Transfer Shares</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {Math.round(calculatedValues.exitTransferShares).toLocaleString()}
                </div>
              </div>

              {/* Exit Transfer Value Row */}
              <div className="grid grid-cols-2 gap-1">
                <div className="bg-blue-600 text-white py-0.5 px-1 text-sm">Exit / Transfer Value</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {formatCurrency(calculatedValues.exitTransferValue)}
                </div>
              </div>

              {/* Investors Table */}
              <table className="w-full border-collapse mt-1">
                <tbody>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">Existing Investors</td>
                    <td className="border py-0.5 px-1 text-center text-sm">100%</td>
                    <td className="border py-0.5 px-1 text-center text-sm">
                      {(100 - Number(inputs.exitTransferPercent)).toFixed(1)}%
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">New Investors</td>
                    <td className="border py-0.5 px-1 text-center text-sm">-</td>
                    <td className="border py-0.5 px-1 text-center text-sm">
                      {Number(inputs.exitTransferPercent).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Series A Notes Section */}
          <div className="mt-2 w-full">
            <div className="border-4 border-green-700 rounded-lg p-1.5">
              <h3 className="font-bold mb-1 text-sm">Series A Notes</h3>
              <textarea
                value={inputs.seriesANotes}
                onChange={(e) => handleInputChange('seriesANotes', e.target.value)}
                className="w-full h-32 resize-none text-sm focus:outline-none"
                placeholder="Enter notes about Series A funding..."
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
  {isDirty && (
    <button
      onClick={handleSave}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Save
    </button>
  )}
</div>
    <ToastContainer
      position="top-right"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      limit={1}
      style={{ zIndex: 9999 }}  // Ensure the toast appears above other elements
    />
    </div>
  );
};

export default Slide12;