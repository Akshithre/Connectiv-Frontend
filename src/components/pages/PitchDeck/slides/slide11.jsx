
import React, { useState, useEffect, useMemo } from 'react';
import { Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { usePitchDeck } from '../context/PitchDeckContext';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const COLORS = ['#22c55e', '#0ea5e9', '#22c55e', '#15803d', '#0369a1'];

const baseInputStyle = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const inputStyle = `w-full py-0.5 px-1 border rounded text-center text-sm ${baseInputStyle}`;
const narrowInputStyle = `w-16 py-0.5 px-1 border rounded text-center text-sm ${baseInputStyle}`;
const mediumInputStyle = `w-20 py-0.5 px-1 border rounded text-center text-sm ${baseInputStyle}`;

const formatCurrency = (value) => {
  if (value === undefined || value === null || isNaN(value)) return 'INR 0';
  return `INR ${Number(value).toLocaleString('en-IN')}`;
};

const DEFAULT_VALUES = {
  ebitdaMultiple: '10',
  externalNetDebt: '1000',
  ebitda: '1000',
  adjustmentsPositive: '0',
  adjustmentsNegative: '0',
  adjustmentsPositiveDetails: '',
  adjustmentsNegativeDetails: '',
  shares: '1000',
  newFunds: '3000',
  seriesA: 'Series A',
  seriesANotes: '',
  previousYear: '10000'
};

const DEFAULT_SPEND_DATA = [
  { name: 'Brand', value: 20 },
  { name: 'Customer Acq.', value: 30 },
  { name: 'Prod.Dev', value: 50 }
];

const transformDataForBackend = (inputs, calculatedValues, spendData) => {
  // Transform ebitda_basedSchema categories
  const categories = {
    ebitda: calculatedValues.ebitda?.toString() || "0",
    "+adjustments": calculatedValues.adjustmentsPos?.toString() || "0",
    "-adjustments": calculatedValues.adjustmentsNeg?.toString() || "0",
    "ebitdaMultiple": calculatedValues.ebitdaMultiple?.toString() || "0",
    "enterpriceVal": calculatedValues.ev?.toString() || "0",
    "externalNetDebt": inputs.externalNetDebt?.toString() || "0",
    "equityVal": calculatedValues.equityValue?.toString() || "0",
    "shares": calculatedValues.shares?.toString() || "0",
    "sharePrice": calculatedValues.sharePrice?.toString() || "0"
  };

  // Transform spend categories
  const spendCategories = {};
  spendData.forEach(item => {
    if (item && item.name) {
      // Create a valid key by removing spaces and special characters
      const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      spendCategories[key] = parseFloat(item.value) || 0;
    }
  });

  // Transform table data for new issue
  const tableData = [
    {
      name: "Valuation",
      values: {
        preM: calculatedValues.preMoneyValuation?.toString() || "0",
        postM: calculatedValues.postMoneyValuation?.toString() || "0"
      }
    },
    {
      name: "NewFunds",
      values: {
        preM: "-",
        postM: inputs.newFunds?.toString() || "0"
      }
    },
    {
      name: "EquityVal",
      values: {
        preM: calculatedValues.equityValue?.toString() || "0",
        postM: calculatedValues.postMoneyValuation?.toString() || "0"
      }
    },
    {
      name: "SharesExisting",
      values: {
        preM: calculatedValues.shares?.toString() || "0",
        postM: calculatedValues.shares?.toString() || "0"
      }
    },
    {
      name: "New Issue",
      values: {
        preM: "-",
        postM: calculatedValues.newIssueShares?.toString() || "0"
      }
    },
    {
      name: "Shares",
      values: {
        preM: calculatedValues.shares?.toString() || "0",
        postM: calculatedValues.totalShares?.toString() || "0"
      }
    },
    {
      name: "ShareP",
      values: {
        preM: calculatedValues.sharePrice?.toString() || "0",
        postM: calculatedValues.sharePrice?.toString() || "0"
      }
    }
  ];

  return {
    proposalId: inputs.proposalId,
    ebitdaMultiple: parseFloat(inputs.ebitdaMultiple) || 0,
    externalNetDebt: parseFloat(inputs.externalNetDebt) || 0,
    ebitda_basedSchema: {
      categories,
      negativeAdjustments: inputs.adjustmentsNegativeDetails || "",
      positiveAdjustments: inputs.adjustmentsPositiveDetails || ""
    },
    newIssue: {
      existingInvestors: calculatedValues.existingInvestorsPost?.toString() || "0",
      newInvestors: calculatedValues.newInvestorsPost?.toString() || "0",
      tableData
    },
    spend: {
      categories: spendCategories
    },
    seriesAnotes: inputs.seriesANotes || ""
  };
};

const Slide11 = () => {
  const { proposalId } = usePitchDeck();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);

  const [inputs, setInputs] = useState(DEFAULT_VALUES);
  const [spendData, setSpendData] = useState(DEFAULT_SPEND_DATA);
  const [editStates, setEditStates] = useState({
    ebitdaMultiple: false,
    externalNetDebt: false,
    ebitda: false,
    adjustmentsPositive: false,
    adjustmentsNegative: false,
    adjustmentsPositiveDetails: false,
    adjustmentsNegativeDetails: false,
    shares: false,
    newFunds: false,
    seriesA: false,
    spendCategories: Array(5).fill(false)
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!proposalId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide11/${proposalId}`);
        const data = await response.json();

        if (!data.status) {
          throw new Error(data.message || 'Failed to fetch data');
        }

        if (data.data?.slide11) {
          const { slide11 } = data.data;

          // Transform the data to match your frontend structure
          const newInputs = {
            ...DEFAULT_VALUES,
            proposalId,
            ebitdaMultiple: slide11.ebitdaMultiple?.toString() || DEFAULT_VALUES.ebitdaMultiple,
            externalNetDebt: slide11.externalNetDebt?.toString() || DEFAULT_VALUES.externalNetDebt,
            ebitda: slide11.ebitda_basedSchema?.categories?.ebitda || DEFAULT_VALUES.ebitda,
            adjustmentsPositive: slide11.ebitda_basedSchema?.categories?.['+adjustments'] || DEFAULT_VALUES.adjustmentsPositive,
            adjustmentsNegative: slide11.ebitda_basedSchema?.categories?.['-adjustments'] || DEFAULT_VALUES.adjustmentsNegative,
            adjustmentsPositiveDetails: slide11.ebitda_basedSchema?.positiveAdjustments || '',
            adjustmentsNegativeDetails: slide11.ebitda_basedSchema?.negativeAdjustments || '',
            shares: slide11.ebitda_basedSchema?.categories?.shares || DEFAULT_VALUES.shares,
            newFunds: slide11.newIssue?.tableData?.find(row => row.name === "NewFunds")?.values?.postM || DEFAULT_VALUES.newFunds,
            seriesANotes: slide11.seriesAnotes || '',
            previousYear: DEFAULT_VALUES.previousYear
          };

          setInputs(newInputs);

          // Transform spend categories if available
          if (slide11.spend?.categories) {
            const categories = Object.entries(slide11.spend.categories).map(([name, value]) => ({
              name: name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
              value: Number(value)
            }));

            if (categories.length > 0) {
              setSpendData(categories);
            }
          }
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

  // Save data
  const handleSave = async () => {
    if (!proposalId) return;

    setIsLoading(true);
    try {
      const transformedData = transformDataForBackend(inputs, calculatedValues, spendData);

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide11`, {
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

      setIsDirty(false);
      setIsGlobalEditing(false);
    } catch (error) {
      console.error('Error saving data:', error);
      setError(error.message || 'Failed to save data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate derived values
  const calculatedValues = useMemo(() => {
    try {
      const ebitdaVal = parseFloat(inputs.ebitda) || 0;
      const adjustmentsPos = parseFloat(inputs.adjustmentsPositive) || 0;
      const adjustmentsNeg = parseFloat(inputs.adjustmentsNegative) || 0;
      const adjustedEBITDA = ebitdaVal + adjustmentsPos - adjustmentsNeg;
      const multiple = parseFloat(inputs.ebitdaMultiple) || 0;
      const ev = adjustedEBITDA * multiple;
      const netDebt = parseFloat(inputs.externalNetDebt) || 0;
      const equityValue = ev - netDebt;
      const shares = parseFloat(inputs.shares) || 1;
      const sharePrice = equityValue / shares;
      const newFunds = parseFloat(inputs.newFunds) || 0;
      const postMoneyValue = equityValue + newFunds;
      const newIssueShares = Math.round(newFunds / sharePrice);
      const totalShares = shares + newIssueShares;
      const existingInvestorsPost = ((shares / totalShares) * 100).toFixed(2);
      const newInvestorsPost = (100 - parseFloat(existingInvestorsPost)).toFixed(2);

      return {
        ebitda: ebitdaVal,
        adjustmentsPos,
        adjustmentsNeg,
        adjustedEBITDA,
        ebitdaMultiple: multiple,
        ev,
        externalNetDebt: netDebt,
        equityValue,
        shares,
        sharePrice,
        preMoneyValuation: equityValue,
        postMoneyValuation: postMoneyValue,
        newIssueShares,
        totalShares,
        existingInvestorsPost,
        newInvestorsPost
      };
    } catch (error) {
      console.error('Calculation error:', error);
      return {
        ebitda: 0,
        adjustmentsPos: 0,
        adjustmentsNeg: 0,
        adjustedEBITDA: 0,
        ebitdaMultiple: 0,
        ev: 0,
        externalNetDebt: 0,
        equityValue: 0,
        shares: 0,
        sharePrice: 0,
        preMoneyValuation: 0,
        postMoneyValuation: 0,
        newIssueShares: 0,
        totalShares: 0,
        existingInvestorsPost: '0',
        newInvestorsPost: '0'
      };
    }
  }, [inputs]);

  // Event handlers
  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true); // Set dirty when input changes
  };

  const updateSpendCategory = (index, field, value) => {
    const newData = [...spendData];
    if (field === 'value') {
      const numValue = parseFloat(value);
      // Only check if it's a valid number and not negative
      if (isNaN(numValue) || numValue < 0) return;
      newData[index][field] = numValue;
    } else {
      newData[index][field] = value;
    }
    setSpendData(newData);
    setIsDirty(true);
  };

  const addSpendCategory = () => {
    if (spendData.length < 5) {
      setSpendData(prev => [...prev, { name: 'New Category', value: 0 }]);
      setIsDirty(true); // Set dirty when adding category
    }
  };

  const removeSpendCategory = (index) => {
    setSpendData(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true); // Set dirty when removing category
  };

  // Rest of your component remains the same...
  return (
    <div className="max-w-7xl mx-auto p-2">

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3 flex justify-end mb-2">
          <button
            onClick={() => {
              setIsGlobalEditing(!isGlobalEditing);
              setEditStates({
                ebitdaMultiple: !isGlobalEditing,
                externalNetDebt: !isGlobalEditing,
                ebitda: !isGlobalEditing,
                adjustmentsPositive: !isGlobalEditing,
                adjustmentsNegative: !isGlobalEditing,
                adjustmentsPositiveDetails: !isGlobalEditing,
                adjustmentsNegativeDetails: !isGlobalEditing,
                shares: !isGlobalEditing,
                newFunds: !isGlobalEditing,
                seriesA: !isGlobalEditing,
                spendCategories: Array(5).fill(!isGlobalEditing)
              });
            }}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <Edit className="w-4 h-4 mr-1" />
            <span className="text-sm">{isGlobalEditing ? 'Done' : 'Edit'}</span>
          </button>
        </div>
        {/* EBITDA Valuation Section */}
        <div className="col-span-2 border-4 border-green-700 rounded-lg p-2">
          <h2 className="text-lg font-bold text-green-700 mb-1">EBITDA-based Valuation Basis</h2>

          <div className="bg-gray-200 py-0.5 px-1">
            <div className="flex justify-between items-center h-6">
              <span className="text-sm">EBITDA Multiple</span>
              <div className="flex items-center">
                {isGlobalEditing ? (
                  <input
                    type="number"
                    value={inputs.ebitdaMultiple}
                    onChange={(e) => handleInputChange('ebitdaMultiple', e.target.value)}
                    className={inputStyle}
                  />
                ) : (
                  <span className="text-sm">x {inputs.ebitdaMultiple}</span>
                )}
              </div>
            </div>

            {/* External Net Debt */}
            <div className="bg-gray-200 py-0.5 px-1">
              <div className="flex justify-between items-center h-6">
                <span className="text-sm">External Net Debt</span>
                <div className="flex items-center">
                  {isGlobalEditing ? (
                    <input
                      type="number"
                      value={inputs.externalNetDebt}
                      onChange={(e) => handleInputChange('externalNetDebt', e.target.value)}
                      className={mediumInputStyle}
                    />
                  ) : (
                    <span className="text-sm">{formatCurrency(inputs.externalNetDebt)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Left table */}
            <div className="border rounded">
              <table className="w-full">
                <tbody>
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
                            className={mediumInputStyle}
                          />
                        ) : (
                          <span className="text-sm">{formatCurrency(calculatedValues.ebitda)}</span>
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
                            className={mediumInputStyle}
                          />
                        ) : (
                          <span className="text-sm">{formatCurrency(calculatedValues.adjustmentsPos)}</span>
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
                            className={mediumInputStyle}
                          />
                        ) : (
                          <span className="text-sm">{formatCurrency(calculatedValues.adjustmentsNeg)}</span>
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
                    <td className="border py-0.5 px-1 text-sm text-center">
                      x {calculatedValues.ebitdaMultiple}
                    </td>
                  </tr>
                  <tr className="h-6 bg-blue-50">
                    <td className="border py-0.5 px-1 text-sm">Enterprise Value</td>
                    <td className="border py-0.5 px-1 text-sm text-center">
                      {formatCurrency(calculatedValues.ev)}
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">(-) External Net Debt</td>
                    <td className="border py-0.5 px-1 text-sm text-center">
                      {formatCurrency(calculatedValues.externalNetDebt)}
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
                            className={mediumInputStyle}
                          />
                        ) : (
                          <span className="text-sm text-center w-full">
                            {calculatedValues.shares.toLocaleString()}
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

            {/* Right adjustments section */}
            <div className="space-y-2">
              <div className="border rounded p-2">
                <h3 className="font-bold text-sm mb-1">
                  (+) Adjustments: {formatCurrency(inputs.adjustmentsPositive)}
                </h3>
                <textarea
                  value={inputs.adjustmentsPositiveDetails}
                  onChange={(e) => handleInputChange('adjustmentsPositiveDetails', e.target.value)}
                  className="w-full h-28 p-2 border rounded text-sm"
                  placeholder="Enter positive adjustment details..."
                />
              </div>

              <div className="border rounded p-2">
                <h3 className="font-bold text-sm mb-1">
                  (-) Adjustments: {formatCurrency(inputs.adjustmentsNegative)}
                </h3>
                <textarea
                  value={inputs.adjustmentsNegativeDetails}
                  onChange={(e) => handleInputChange('adjustmentsNegativeDetails', e.target.value)}
                  className="w-full h-28 p-2 border rounded text-sm"
                  placeholder="Enter negative adjustment details..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 space-y-2">
          {/* New Issue Section */}
          <div className="border-4 border-green-700 rounded-lg">
            <div className="bg-green-700 text-white py-0.5 px-1 text-center">
              <h2 className="text-base font-bold">New Issue</h2>
              <p className="text-xs">Valuation and Shareholding</p>
            </div>

            <div className="p-1.5 space-y-1">
              {/* Header Row */}
              <div className="grid grid-cols-3 gap-1">
                <div></div>
                <div className="bg-gray-100 py-0.5 px-1 text-center text-sm font-bold">Pre Money</div>
                <div className="bg-gray-100 py-0.5 px-1 text-center text-sm font-bold">Post Money</div>
              </div>

              {/* Valuation Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm">Valuation</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {formatCurrency(calculatedValues.preMoneyValuation)}
                </div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {formatCurrency(calculatedValues.postMoneyValuation)}
                </div>
              </div>

              {/* New Funds Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-blue-600 text-white py-0.5 px-1 text-sm">New Funds</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm text-gray-400">-</div>
                <div className="bg-gray-200 py-0.5 px-1">
                  <div className="flex items-center justify-between">
                    {editStates.newFunds ? (
                      <input
                        type="number"
                        value={inputs.newFunds}
                        onChange={(e) => handleInputChange('newFunds', e.target.value)}
                        className={narrowInputStyle}
                      />
                    ) : (
                      <span className="text-center text-sm w-full">
                        {formatCurrency(inputs.newFunds)}
                      </span>
                    )}
                    <Edit
                      className="w-3.5 h-3.5 ml-1 cursor-pointer"
                      onClick={() => toggleEdit('newFunds')}
                    />
                  </div>
                </div>
              </div>

              {/* Equity Value Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm">Equity Value</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {formatCurrency(calculatedValues.equityValue)}
                </div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {formatCurrency(calculatedValues.postMoneyValuation)}
                </div>
              </div>

              {/* Shares Existing Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm">Shares Existing</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {calculatedValues.shares.toLocaleString()}
                </div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {calculatedValues.shares.toLocaleString()}
                </div>
              </div>

              {/* New Issue Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm">New Issue</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">-</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {calculatedValues.newIssueShares.toLocaleString()}
                </div>
              </div>

              {/* Total Shares Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm"># Shares</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {calculatedValues.shares.toLocaleString()}
                </div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {calculatedValues.totalShares.toLocaleString()}
                </div>
              </div>

              {/* Share Price Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm">Share Price</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {formatCurrency(calculatedValues.sharePrice)}
                </div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {formatCurrency(calculatedValues.sharePrice)}
                </div>
              </div>

              {/* Investors Table */}
              <table className="w-full border-collapse mt-1">
                <tbody>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">Existing Investors</td>
                    <td className="border py-0.5 px-1 text-center text-sm">100%</td>
                    <td className="border py-0.5 px-1 text-center text-sm">
                      {calculatedValues.existingInvestorsPost}%
                    </td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">New Investors</td>
                    <td className="border py-0.5 px-1 text-center text-sm">-</td>
                    <td className="border py-0.5 px-1 text-center text-sm">
                      {calculatedValues.newInvestorsPost}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Spend Section */}
          <div className="border-4 border-green-700 rounded-lg p-1.5">
            <h3 className="font-bold mb-1 text-sm">Spend</h3>
            <div className="flex flex-col space-y-2">
              <div className="w-full">
                <table className="w-full mb-1">
                  <thead>
                    <tr className="h-6">
                      <th className="border py-0.5 px-1 text-center text-sm">Category</th>
                      <th className="border py-0.5 px-1 text-center text-sm">Value (%)</th>
                      <th className="border py-0.5 px-1 text-center text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendData.map((item, index) => (
                      <tr key={index} className="h-6">
                        <td className="border py-0.5 px-1">
                          <input
                            type="text"  // Changed from number to text for category name
                            value={item.name}
                            onChange={(e) => updateSpendCategory(index, 'name', e.target.value)}
                            className={inputStyle}
                          />
                        </td>
                        <td className="border py-0.5 px-1">
                          <input
                            type="number"
                            value={item.value}
                            onChange={(e) => updateSpendCategory(index, 'value', e.target.value)}
                            className={inputStyle}
                          />
                        </td>
                        <td className="border py-0.5 px-1 text-center">
                          <button
                            onClick={() => removeSpendCategory(index)}
                            className="text-red-600 text-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {spendData.length < 5 && (
                  <button
                    onClick={addSpendCategory}
                    className="bg-green-600 text-white px-2 py-0.5 rounded text-sm"
                  >
                    Add Category
                  </button>
                )}
              </div>
              <div className="w-full flex justify-center">
                <PieChart width={120} height={120}>
                  <Pie
                    data={spendData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={50}
                    label={false}
                  >
                    {spendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Series A Notes Section */}
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
      <div className="flex justify-end mt-4">
        {isDirty && (  // Only show button when isDirty is true
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default Slide11;