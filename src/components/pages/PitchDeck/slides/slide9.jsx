

import React, { useState, useEffect, useMemo } from 'react';
import { Edit } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useLocation } from 'react-router-dom';
import { usePitchDeck } from '../context/PitchDeckContext';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Constants
const COLORS = ['#22c55e', '#0ea5e9', '#22c55e', '#15803d', '#0369a1'];
const inputStyle = "w-16 py-0.5 px-1 border rounded text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

const DEFAULT_VALUES = {
  discountRate: '12',
  perpetualGrowth: '5',
  netDebt: Array(6).fill('1000'),
  shares: Array(6).fill('1000'),
  seriesA: 'Series A',
  newFunds: '3000',
  seriesANotes: '',
  spendData: [
    { name: 'Brand', value: 20 },
    { name: 'Customer Acq.', value: 30 },
    { name: 'Prod.Dev', value: 50 }
  ]
};

// Transform new issue data

const Slide9 = () => {
  const location = useLocation();
  const proposalId = location.state?.proposalId;

  const { updateSlideData, getSlideData } = usePitchDeck();
  const [yearHeaders, setYearHeaders] = useState(['Current']);
  // State declarations
  const [inputs, setInputs] = useState(() => {
    const savedData = getSlideData(8);
    return {
      ...(savedData?.inputs || DEFAULT_VALUES),
      spendData: savedData?.inputs?.spendData || DEFAULT_VALUES.spendData
    };
  });


  const [editStates, setEditStates] = useState({
    discountRate: false,
    perpetualGrowth: false,
    netDebt: Array(6).fill(false),
    shares: Array(6).fill(false),
    seriesA: false,
    newFunds: false
  });


  const [spendData, setSpendData] = useState(() => {
    const savedData = getSlideData(8);
    return savedData?.spendData || DEFAULT_VALUES.spendData;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  const [fcfData, setFcfData] = useState(Array(6).fill(''));
  const calculateValues = useMemo(() => {
    try {
      const dr = parseFloat(inputs.discountRate) / 100;
      const pg = parseFloat(inputs.perpetualGrowth) / 100;
      const newFunds = parseFloat(inputs.newFunds) || 0;

      let fcf = Array(6).fill('');
      fcf[0] = '';
      for (let i = 1; i < 6; i++) {
        fcf[i] = fcfData[i] || '0';
      }

      // Calculate PV Factors
      const pvFactor = Array(6).fill('');
      pvFactor[0] = '';
      const basePVFactor = dr !== 0 ? (1 / dr).toFixed(4) : '0.0000';
      for (let i = 1; i < 6; i++) {
        pvFactor[i] = basePVFactor;
      }

      // Calculate PV of FCF
      const pvOfFCF = Array(6).fill('');
      pvOfFCF[0] = '';
      for (let i = 1; i < 6; i++) {
        const fcfVal = parseFloat(fcf[i]) || 0;
        const pvFactorVal = parseFloat(pvFactor[i]);
        pvOfFCF[i] = (fcfVal * pvFactorVal).toFixed(0);
      }

      // Calculate Terminal FCF
      const terminalFCF = Array(6).fill('');
      const year5FCF = parseFloat(fcf[5]) || 0;
      terminalFCF[5] = (year5FCF * pg).toFixed(0);

      // Calculate Enterprise Value
      const ev = Array(6).fill('');
      for (let i = 1; i < 6; i++) {
        const pvFcfVal = parseFloat(pvOfFCF[i]) || 0;
        const terminalVal = i === 5 ? parseFloat(terminalFCF[5]) || 0 : 0;
        ev[i] = (pvFcfVal + terminalVal).toFixed(0);
      }

      // Calculate Equity Value
      const equityValue = Array(6).fill('');
      for (let i = 1; i < 6; i++) {
        const evVal = parseFloat(ev[i]) || 0;
        const netDebtVal = parseFloat(inputs.netDebt[i]) || 0;
        equityValue[i] = (evVal - netDebtVal).toFixed(0);
      }
      const sharePrice = Array(6).fill('');
      sharePrice[0] = '';
      for (let i = 1; i < 6; i++) {
        const eqVal = parseFloat(equityValue[i]); const sharesVal = parseFloat(inputs.shares[i]) || 1;
        if (sharesVal > 0) {
          sharePrice[i] = (eqVal / sharesVal).toFixed(2);
        } else {
          sharePrice[i] = '0.00';
        }
      }

      // Valuation calculations
      const currentEquityValue = parseFloat(equityValue[1]) || 0;
      const preMoney = Math.max(0, currentEquityValue);
      const postMoney = preMoney + newFunds;

      const currentShares = parseFloat(inputs.shares[0]) || 1;
      const preMoneySharePrice = parseFloat(sharePrice[1]) || 0;
      const newIssueShares = Math.round(newFunds / preMoneySharePrice);
      const totalPostShares = currentShares + newIssueShares;

      const newInvestorPct = ((newFunds / postMoney) * 100).toFixed(1);
      const existingInvestorPct = (100 - parseFloat(newInvestorPct)).toFixed(1);
      return {
        fcf,
        pvFactor,
        pvOfFCF,
        terminalFCF,
        ev,
        netDebtRow: inputs.netDebt,
        equityValue,
        sharePrice,
        preMoneyValuation: `INR ${preMoney.toLocaleString()}`,
        postMoneyValuation: `INR ${postMoney.toLocaleString()}`,
        newFundsValue: `INR ${newFunds.toLocaleString()}`,
        equityValuePre: `INR ${preMoney.toLocaleString()}`,
        equityValuePost: `INR ${postMoney.toLocaleString()}`,
        sharesExisting: currentShares.toLocaleString(),
        sharesNew: newIssueShares.toLocaleString(),
        totalShares: totalPostShares.toLocaleString(),
        sharePriceInfo: {
          pre: preMoneySharePrice.toFixed(2),
          post: preMoneySharePrice.toFixed(2)
        },
        existingInvestors: {
          current: '100',
          exit: existingInvestorPct.toString()
        },
        newInvestors: {
          current: '-',
          exit: newInvestorPct.toString()
        }
      };
    } catch (error) {
      console.error('Calculation error:', error);
      return {
        fcf: Array(6).fill('-'),
        pvFactor: Array(6).fill('-'),
        pvOfFCF: Array(6).fill('-'),
        terminalFCF: Array(6).fill('-'),
        ev: Array(6).fill('-'),
        netDebtRow: Array(6).fill('-'),
        equityValue: Array(6).fill('-'),
        sharePrice: Array(6).fill('-'),
        preMoneyValuation: 'INR 0',
        postMoneyValuation: 'INR 0',
        newFundsValue: 'INR 0',
        equityValuePre: 'INR 0',
        equityValuePost: 'INR 0',
        sharesExisting: '0',
        sharesNew: '0',
        totalShares: '0',
        existingInvestors: { current: '100.0', exit: '0.0' },
        newInvestors: { current: '-', exit: '0.0' }
      };
    }
  }, [inputs, fcfData]);
  const fetchSlide8Data = async () => {
    try {
      // First fetch Slide 5 data directly from backend
      try {
        const slide5Response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide5/${proposalId}`);
        const slide5Data = await slide5Response.json();

        if (slide5Data.status && slide5Data.data?.slide5) {
          const { revenueStartYear, revenueStartMonth, revenueTargetYear } = slide5Data.data.slide5;

          if (revenueStartYear && revenueTargetYear) {
            const years = ['Current'];
            for (let year = revenueStartYear; year <= revenueTargetYear; year++) {
              const monthPrefix = revenueStartMonth ?
                String(revenueStartMonth).padStart(2, '0') + '-' : '';
              years.push(`${monthPrefix}${year}`);
            }
            setYearHeaders(years);
          }
        }
      } catch (error) {
        console.error('Error fetching Slide 5 data:', error);
        // Fallback to default headers if Slide 5 fetch fails
        setYearHeaders(['Current', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5']);
      }

      // Fetch Slide 8 data
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide8/${proposalId}`);
      const data = await response.json();

      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch FCF data');
      }

      if (data.data?.slide8?.cashEstimates) {
        const fcfRow = data.data.slide8.cashEstimates.find(row => row.name === 'FCF');
        if (fcfRow) {
          const fcfValues = Array(6).fill('');
          Object.entries(fcfRow.values).forEach(([key, value]) => {
            const yearIndex = parseInt(key.slice(1));
            if (!isNaN(yearIndex) && yearIndex >= 1 && yearIndex <= 5) {
              fcfValues[yearIndex] = value;
            }
          });
          setFcfData(fcfValues);
        }
        await updateSlideData(8, data.data.slide8);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  const fetchSlide9Data = async () => {
    try {
      const slide9FromContext = getSlideData(9);

      if (Object.keys(slide9FromContext || {}).length > 0) {
        processSlide9Data(slide9FromContext);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide9/${proposalId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message || 'Failed to fetch data');
      }

      if (data.data?.slide9) {
        // Log the received data for debugging
        console.log('Received slide9 data:', data.data.slide9);

        processSlide9Data(data.data.slide9);
        await updateSlideData(9, data.data.slide9);
      }
    } catch (error) {
      console.error('Error fetching Slide 9 data:', error);
      throw error;
    }
  };

  const processSlide9Data = (slide9) => {
    const newInputs = {
      discountRate: slide9.dcfBased?.discountRate?.toString() || DEFAULT_VALUES.discountRate,
      perpetualGrowth: slide9.dcfBased?.perpetualGrowthRate?.toString() || DEFAULT_VALUES.perpetualGrowth,
      netDebt: [...DEFAULT_VALUES.netDebt],
      shares: Array(6).fill(DEFAULT_VALUES.shares[0]),
      seriesA: DEFAULT_VALUES.seriesA,
      newFunds: DEFAULT_VALUES.newFunds,
      seriesANotes: slide9.seriesAnotes || DEFAULT_VALUES.seriesANotes
    };
    if (slide9.dcfBased?.netDebt !== undefined) {
      newInputs.netDebt[0] = slide9.dcfBased.netDebt.toString();
    }

    // Process shares from tableData
    if (slide9.dcfBased?.tableData) {
      const sharesRow = slide9.dcfBased.tableData.find(row => row.name === "Shares");
      if (sharesRow?.values) {
        newInputs.shares[0] = sharesRow.values.Current?.toString() || DEFAULT_VALUES.shares[0];
        newInputs.shares[1] = sharesRow.values.Y1?.toString() || DEFAULT_VALUES.shares[1];
        newInputs.shares[2] = sharesRow.values.Y2?.toString() || DEFAULT_VALUES.shares[2];
        newInputs.shares[3] = sharesRow.values.Y3?.toString() || DEFAULT_VALUES.shares[3];
        newInputs.shares[4] = sharesRow.values.Y4?.toString() || DEFAULT_VALUES.shares[4];
        newInputs.shares[5] = sharesRow.values.Y5?.toString() || DEFAULT_VALUES.shares[5];
      }


      // Process Net Debt from tableData
      const netDebtRow = slide9.dcfBased.tableData.find(row => row.name === "Net Debt");
      if (netDebtRow?.values) {
        // Preserve the current year value we just set
        const currentNetDebt = newInputs.netDebt[0];

        // Map the values to the array indices
        newInputs.netDebt = [
          currentNetDebt,                                    // Keep the current year value
          netDebtRow.values.Y1?.toString() || DEFAULT_VALUES.netDebt[1],
          netDebtRow.values.Y2?.toString() || DEFAULT_VALUES.netDebt[2],
          netDebtRow.values.Y3?.toString() || DEFAULT_VALUES.netDebt[3],
          netDebtRow.values.Y4?.toString() || DEFAULT_VALUES.netDebt[4],
          netDebtRow.values.Y5?.toString() || DEFAULT_VALUES.netDebt[5]
        ];
      }
    }

    // Process new funds from newIssue
    if (slide9.newIssue?.tableData) {
      const newFundsRow = slide9.newIssue.tableData.find(row => row.name === "New Funds");
      if (newFundsRow?.values) {
        newInputs.newFunds = newFundsRow.values.after?.toString() || DEFAULT_VALUES.newFunds;
      }
    }
    setInputs(prevInputs => ({
      ...prevInputs,
      ...newInputs,
      netDebt: newInputs.netDebt // Ensure the netDebt array is properly updated
    }));
    // Process spend data
    if (slide9.spend?.categories) {
      const spendDataArray = Object.entries(slide9.spend.categories)
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1)
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .trim(), // Remove extra spaces
          value: Number(value)
        }));
      setSpendData(spendDataArray);
    }
  };

  // Update the transformDataForBackend function
  const transformDataForBackend = (currentData, calculatedValues) => {
    return {
      dcfBased: {
        discountRate: parseFloat(currentData.discountRate) || 0,
        perpetualGrowthRate: parseFloat(currentData.perpetualGrowth) || 0,
        netDebt: parseFloat(currentData.netDebt[0]) || 0,
        tableData: [
          {
            name: "Free Cash Flow",
            values: {
              Current: "-",
              Y1: calculatedValues.fcf[1] || "-",
              Y2: calculatedValues.fcf[2] || "-",
              Y3: calculatedValues.fcf[3] || "-",
              Y4: calculatedValues.fcf[4] || "-",
              Y5: calculatedValues.fcf[5] || "-"
            }
          },
          {
            name: "PV Factor",
            values: {
              Current: "-",
              Y1: calculatedValues.pvFactor[1] || "-",
              Y2: calculatedValues.pvFactor[2] || "-",
              Y3: calculatedValues.pvFactor[3] || "-",
              Y4: calculatedValues.pvFactor[4] || "-",
              Y5: calculatedValues.pvFactor[5] || "-"
            }
          },
          {
            name: "PV of FCF",
            values: {
              Current: "-",
              Y1: calculatedValues.pvOfFCF[1] || "-",
              Y2: calculatedValues.pvOfFCF[2] || "-",
              Y3: calculatedValues.pvOfFCF[3] || "-",
              Y4: calculatedValues.pvOfFCF[4] || "-",
              Y5: calculatedValues.pvOfFCF[5] || "-"
            }
          },
          {
            name: "Terminal FCF",
            values: {
              Current: "-",
              Y1: calculatedValues.terminalFCF[1] || "-",
              Y2: calculatedValues.terminalFCF[2] || "-",
              Y3: calculatedValues.terminalFCF[3] || "-",
              Y4: calculatedValues.terminalFCF[4] || "-",
              Y5: calculatedValues.terminalFCF[5] || "-"
            }
          },
          {
            name: "EV",
            values: {
              Current: "-",
              Y1: calculatedValues.ev[1] || "-",
              Y2: calculatedValues.ev[2] || "-",
              Y3: calculatedValues.ev[3] || "-",
              Y4: calculatedValues.ev[4] || "-",
              Y5: calculatedValues.ev[5] || "-"
            }
          },
          {
            name: "Net Debt",
            values: {
              Current: currentData.netDebt[0],
              Y1: currentData.netDebt[1],
              Y2: currentData.netDebt[2],
              Y3: currentData.netDebt[3],
              Y4: currentData.netDebt[4],
              Y5: currentData.netDebt[5]
            }
          },
          {
            name: "Equity Value",
            values: {
              Current: "-",
              Y1: calculatedValues.equityValue[1] || "-",
              Y2: calculatedValues.equityValue[2] || "-",
              Y3: calculatedValues.equityValue[3] || "-",
              Y4: calculatedValues.equityValue[4] || "-",
              Y5: calculatedValues.equityValue[5] || "-"
            }
          },
          {
            name: "Shares",
            values: {
              Current: currentData.shares[0],
              Y1: currentData.shares[1] || "-",
              Y2: currentData.shares[2] || "-",
              Y3: currentData.shares[3] || "-",
              Y4: currentData.shares[4] || "-",
              Y5: currentData.shares[5] || "-"
            }
          },
          {
            name: "Share Price",
            values: {
              Current: "-",
              Y1: calculatedValues.sharePrice[1] || "-",
              Y2: calculatedValues.sharePrice[2] || "-",
              Y3: calculatedValues.sharePrice[3] || "-",
              Y4: calculatedValues.sharePrice[4] || "-",
              Y5: calculatedValues.sharePrice[5] || "-"
            }
          }
        ]
      },
      newIssue: {
        existingInvestors: `${calculatedValues.existingInvestors.exit}%`,
        newInvestors: `${calculatedValues.newInvestors.exit}%`,
        tableData: [
          {
            name: "Valuation",
            values: {
              before: calculatedValues.preMoneyValuation.replace('INR ', ''),
              after: calculatedValues.postMoneyValuation.replace('INR ', '')
            }
          },
          {
            name: "New Funds",
            values: {
              before: "-",
              after: currentData.newFunds
            }
          },
          {
            name: "Equity Value",
            values: {
              before: calculatedValues.equityValuePre.replace('INR ', ''),
              after: calculatedValues.equityValuePost.replace('INR ', '')
            }
          },
          {
            name: "Shares Existing",
            values: {
              before: calculatedValues.sharesExisting,
              after: calculatedValues.sharesExisting
            }
          },
          {
            name: "New Issue",
            values: {
              before: "-",
              after: calculatedValues.sharesNew
            }
          },
          {
            name: "#Shares",
            values: {
              before: calculatedValues.sharesExisting,
              after: calculatedValues.totalShares
            }
          },
          {
            name: "Share Price",
            values: {
              before: calculatedValues.sharePriceInfo.pre,
              after: calculatedValues.sharePriceInfo.post
            }
          }
        ]
      },
      spend: {
        categories: spendData.reduce((acc, item) => ({
          ...acc,
          [item.name.toLowerCase().replace(/[^a-z0-9]/g, '')]: item.value
        }), {})
      },
      seriesAnotes: currentData.seriesANotes || ''
    };
  };

  // Update the row definitions in the table to include edit functionality
  const tableRows = [
    { label: 'FCF', key: 'fcf' },
    { label: 'PV Factor', key: 'pvFactor' },
    { label: 'PV of FCF', key: 'pvOfFCF' },
    { label: 'Terminal FCF', key: 'terminalFCF' },
    { label: 'EV', key: 'ev' },
    { label: '(-) Net Debt', key: 'netDebtRow', editable: true },
    { label: 'Equity Value', key: 'equityValue' },
    { label: '# Shares', key: 'shares', editable: true },
    { label: 'Share Price', key: 'sharePrice' }
  ];

  // Add helper functions for handling edits
  const updateNetDebtValue = (col, value) => {
    setInputs(prev => {
      const newNetDebt = [...prev.netDebt];
      newNetDebt[col] = value;
      return { ...prev, netDebt: newNetDebt };
    });
    setIsDirty(true);
  };

  const updateShareValue = (col, value) => {
    setInputs(prev => {
      const newShares = [...prev.shares];
      newShares[col] = value;
      return { ...prev, shares: newShares };
    });
    setIsDirty(true);
  };

  // Save handler
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const transformedData = transformDataForBackend(inputs, calculateValues);

      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide9`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId,
          ...transformedData
        })
      });

      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message || 'Failed to save data');
      }

      await updateSlideData(9, transformedData);
      setIsDirty(false);
      setIsGlobalEditing(false);
      setEditStates({
        discountRate: false,
        perpetualGrowth: false,
        netDebt: Array(6).fill(false),
        shares: Array(6).fill(false),
        seriesA: false,
        newFunds: false
      });

      toast.dismiss();
      toast.success('Changes saved successfully!', {
        toastId: 'save-success',
        position: "top-right",
        autoClose: 2000,
        theme: "light",
        style: {
          background: '#17843f',
          color: 'white',
          fontWeight: '500',
        },
      });

    } catch (error) {
      console.error('Error saving data:', error);
      setError(error.message || 'Failed to save changes');
      toast.dismiss();
      toast.error('Failed to save changes', {
        toastId: 'save-error',
        position: "top-right",
        autoClose: 3000,
        theme: "light",
      });
      setIsDirty(true);  // Keep the button visible if save fails
    } finally {
      setIsLoading(false);
    }
  };

  
  // Effects
  useEffect(() => {
    const loadData = async () => {
      if (!proposalId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await Promise.all([
          fetchSlide8Data(),
          fetchSlide9Data()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [proposalId]);

  useEffect(() => {
    if (isDirty) {
      const timeoutId = setTimeout(() => {
        const transformedData = transformDataForBackend(inputs, calculateValues);
        updateSlideData(9, transformedData);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [inputs, spendData, calculateValues, updateSlideData]);

  // Your existing calculateValues function with fcfData


  // Input handlers
  const handleInputChange = (field, value, index = null) => {
    setInputs(prev => {
      if (field === 'spendData') {
        return { ...prev, spendData: value };
      }
      if (index !== null) {
        const newArray = [...prev[field]];
        newArray[index] = value;
        return { ...prev, [field]: newArray };
      }
      return { ...prev, [field]: value };
    });
    setIsDirty(true);
  };

  const toggleEdit = (field, index = null) => {
    setEditStates(prev => {
      if (index !== null) {
        const newArray = [...prev[field]];
        newArray[index] = !newArray[index];
        return { ...prev, [field]: newArray };
      }
      return { ...prev, [field]: !prev[field] };
    });
  };

  const handleSpendChange = (index, field, value) => {
    setSpendData(prev => {
      const newData = [...prev];
      newData[index] = {
        ...newData[index],
        [field]: field === 'value' ? Number(value) : value
      };
      return newData;
    });
    setIsDirty(true);
  };

  const addSpendCategory = () => {
    if (spendData.length < 5) {
      setSpendData(prev => [...prev, { name: 'New Category', value: 0 }]);
      setIsDirty(true);
    }
  };

  const removeSpendCategory = (index) => {
    setSpendData(prev => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };
  const updateSpendCategory = (index, field, value) => {
    setSpendData(prev => {
      const newData = [...prev];
      newData[index] = {
        ...newData[index],
        [field]: field === 'value' ? Number(value) : value
      };
      return newData;
    });
    setIsDirty(true);
  };

  const processSpendData = (data) => {
    if (data.spend?.categories) {
      const spendDataArray = Object.entries(data.spend.categories).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Number(value)
      }));
      setSpendData(spendDataArray);
    }
  };
  const renderDCFTable = () => (
    <table className="w-full border-collapse">
      <thead>
        <tr className="h-6">
          <th className="border py-0.5 px-1 text-sm"></th>
          {yearHeaders.map((year, index) => (
            <th key={index} className="border py-0.5 px-1 text-center text-sm">{year}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[
          { label: 'FCF', key: 'fcf' },
          { label: 'PV Factor', key: 'pvFactor' },
          { label: 'PV of FCF', key: 'pvOfFCF' },
          { label: 'Terminal FCF', key: 'terminalFCF' },
          { label: 'EV', key: 'ev' },
          { label: '(-) Net Debt', key: 'netDebtRow', editable: true },
          { label: 'Equity Value', key: 'equityValue' },
          { label: '# Shares', key: 'shares', editable: true },
          { label: 'Share Price', key: 'sharePrice' }
        ].map((row) => (
          <tr key={row.key} className={`h-6 ${row.key === 'ev' ? 'bg-blue-50' : ''}`}>
            <td className="border py-0.5 px-1 font-medium text-sm">{row.label}</td>
            {[0, 1, 2, 3, 4, 5].map((col) => (
              <td key={col} className="border py-0.5 px-1 text-center">
                {row.key === 'shares' ? (
                  <div className="flex items-center justify-center text-sm">
                    {col === 0 && editStates.shares[col] ? (
                      <input
                        type="number"
                        value={inputs.shares[col]}
                        onChange={(e) => updateShareValue(col, e.target.value)}
                        className={inputStyle}
                      />
                    ) : col === 0 ? (
                      <span className="text-sm">{inputs.shares[col]}</span>
                    ) : (
                      <span className="text-sm">-</span>
                    )}
                  </div>
                ) : row.key === 'netDebtRow' ? (
                  <div className="flex items-center justify-center text-sm">
                    {col === 0 ? (
                      <span className="text-sm">{inputs.netDebt[0]}</span>
                    ) : editStates.netDebt[col] ? (
                      <input
                        type="number"
                        value={inputs.netDebt[col]}
                        onChange={(e) => updateNetDebtValue(col, e.target.value)}
                        className={inputStyle}
                      />
                    ) : (
                      <span className="text-sm">{inputs.netDebt[col]}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm">{calculateValues[row.key][col]}</span>
                )}
              </td>
            ))}
          </tr>
        ))}

        {/* Continue with the remaining rows */}
        {[
          { label: 'Equity Value', key: 'equityValue' },
          { label: '# Shares', key: 'shares', editable: true },
          { label: 'Share Price', key: 'sharePrice' }
        ].map((row) => (
          <tr key={row.key}>
            {/* ... existing row rendering ... */}
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <div className="max-w-7xl mx-auto p-2 relative">

      <div className="grid grid-cols-3 gap-4">
        {/* DCF Valuation Section */}
        <div className="col-span-2 border-4 border-green-700 rounded-lg p-2">
          <h2 className="text-lg font-bold text-green-700 mb-1">DCF Valuation Basis</h2>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="col-span-3 flex justify-end mb-2">
              <button
                onClick={() => {
                  setIsGlobalEditing(!isGlobalEditing);
                  setEditStates({
                    discountRate: !isGlobalEditing,
                    perpetualGrowth: !isGlobalEditing,
                    netDebt: Array(6).fill(!isGlobalEditing),
                    shares: Array(6).fill(!isGlobalEditing),
                    seriesA: !isGlobalEditing,
                    newFunds: !isGlobalEditing
                  });
                }}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <Edit className="w-4 h-4 mr-1" />
                <span className="text-sm">{isGlobalEditing ? 'Done' : 'Edit'}</span>
              </button>
            </div>

            <div className="bg-gray-200 py-0.5 px-1">
              <div className="flex justify-between items-center h-6">
                <span className="text-sm">Discount Rate</span>
                <div className="flex items-center">
                  {editStates.discountRate ? (
                    <input
                      type="number"
                      value={inputs.discountRate}
                      onChange={(e) => handleInputChange('discountRate', e.target.value)}
                      className={inputStyle}
                    />
                  ) : (
                    <span className="text-sm">{inputs.discountRate}%</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-200 py-0.5 px-1">
              <div className="flex justify-between items-center h-6">
                <span className="text-sm">Perpetual Growth</span>
                <div className="flex items-center">
                  {editStates.perpetualGrowth ? (
                    <input
                      type="number"
                      value={inputs.perpetualGrowth}
                      onChange={(e) => handleInputChange('perpetualGrowth', e.target.value)}
                      className={inputStyle}
                    />
                  ) : (
                    <span className="text-sm">{inputs.perpetualGrowth}%</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-200 py-0.5 px-1">
              <div className="flex justify-between items-center h-6">
                <span className="text-sm">Net Debt</span>
                <div className="flex items-center">
                  {editStates.netDebt[0] ? (
                    <input
                      type="number"
                      value={inputs.netDebt[0]}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setInputs(prev => ({
                          ...prev,
                          netDebt: prev.netDebt.map((_, index) =>
                            index === 0 ? newValue : prev.netDebt[index]
                          )
                        }));
                      }}
                      className={inputStyle}
                    />
                  ) : (
                    <span className="text-sm">{inputs.netDebt[0]}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {renderDCFTable()}
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
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">{calculateValues.preMoneyValuation}</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">{calculateValues.postMoneyValuation}</div>
              </div>

              {/* New Funds Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-blue-600 text-white py-0.5 px-1 text-sm">New Funds</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">-</div>
                <div className="bg-gray-200 py-0.5 px-1">
                  <div className="flex items-center justify-between">
                    {editStates.newFunds ? (
                      <input
                        type="number"
                        value={inputs.newFunds}
                        onChange={(e) => handleInputChange('newFunds', e.target.value)}
                        className={inputStyle}
                      />
                    ) : (
                      <span className="text-center text-sm w-full">{calculateValues.newFundsValue}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Equity Value Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm">Equity Value</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">{calculateValues.equityValuePre}</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">{calculateValues.equityValuePost}</div>
              </div>

              {/* Shares Existing Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm">Shares Existing</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">{calculateValues.sharesExisting}</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">{calculateValues.sharesExisting}</div>
              </div>

              {/* New Issue Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm">New Issue</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">-</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">{calculateValues.sharesNew}</div>
              </div>

              {/* Total Shares Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm"># Shares</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">{calculateValues.sharesExisting}</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                  {(parseInt(calculateValues.sharesExisting) + parseInt(calculateValues.sharesNew)).toLocaleString()}
                </div>
              </div>

              {/* Share Price Row */}
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-green-600 text-white py-0.5 px-1 text-sm">Share Price</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">INR {calculateValues.sharePriceInfo.pre}</div>
                <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">INR {calculateValues.sharePriceInfo.post}</div>
              </div>

              {/* Investors Table */}
              <table className="w-full border-collapse mt-1">
                <tbody>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">Existing Investors</td>
                    <td className="border py-0.5 px-1 text-center text-sm">{calculateValues.existingInvestors.current}%</td>
                    <td className="border py-0.5 px-1 text-center text-sm">{calculateValues.existingInvestors.post}%</td>
                  </tr>
                  <tr className="h-6">
                    <td className="border py-0.5 px-1 text-sm">New Investors</td>
                    <td className="border py-0.5 px-1 text-center text-sm">{calculateValues.newInvestors.current}</td>
                    <td className="border py-0.5 px-1 text-center text-sm">{calculateValues.newInvestors.post}%</td>
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
                      <th className="border py-0.5 px-1 text-center text-sm">Value</th>
                      <th className="border py-0.5 px-1 text-center text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendData.map((item, index) => (
                      <tr key={index} className="h-6">
                        <td className="border py-0.5 px-1">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateSpendCategory(index, 'name', e.target.value)}
                            className="w-full py-0.5 px-1 rounded text-center text-sm"
                          />
                        </td>
                        <td className="border py-0.5 px-1">
                          <input
                            type="number"
                            value={item.value}
                            onChange={(e) => updateSpendCategory(index, 'value', e.target.value)}
                            className="w-full py-0.5 px-1 rounded text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={1}
      />
   </div>
  );
};

export default Slide9;