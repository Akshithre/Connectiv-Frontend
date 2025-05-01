
import React, { useState, useEffect, useMemo } from 'react';
import { Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { usePitchDeck } from '../context/PitchDeckContext';
import { pitchDeckApi } from '../../../../services/pitchDeckApi';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
const COLORS = ['#22c55e', '#0ea5e9', '#22c55e', '#15803d', '#0369a1'];
const inputStyle = "w-16 py-0.5 px-1 border rounded text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
// const editableFieldStyle = "transition-colors duration-200 outline outline-2 outline-offset-1 outline-green-500";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const formatCurrency = (value) => {
  if (value === undefined || value === null || value === '' || isNaN(value)) return '';
  return Number(value).toLocaleString('en-IN');
};

const validateNumericInput = (value, min = 0) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min;
};

const DEFAULT_VALUES = {
  discountRate: '12',
  perpetualGrowth: '5',
  netDebt: '1000',
  shares: ['1000', '1000', '1000', '1000', '1000', '1000'],
  exitTransferPercent: 'X',
  seriesANotes: ''
};

const transformDataForBackend = (inputs, calculatedValues, yearHeaders, netDebtValues) => {
  const yearKeys = yearHeaders.slice(1); // Remove "Current" from the start
  // Transform table data for DCF Based section
  const tableData = [
    {
      name: "FCF",
      values: {
        Current: "-",
        ...yearKeys.reduce((acc, year, index) => ({
          ...acc,
          [year]: calculatedValues.fcf[index + 1] || "-"
        }), {})
      }
    },
    {
      name: "PV Factor",
      values: {
        Current: "-",
        ...yearKeys.reduce((acc, year, index) => ({
          ...acc,
          [year]: calculatedValues.pvFactor[index + 1] || "-"
        }), {})
      }
    },
    {
      name: "PV of FCF",
      values: {
        Current: calculatedValues.pvOfFCF[0] || "-",
        ...yearKeys.reduce((acc, year, index) => ({
          ...acc,
          [year]: calculatedValues.pvOfFCF[index + 1] || "-"
        }), {})
      }
    },
    {
      name: "Terminal FCF",
      values: {
        Current: "-",
        ...yearKeys.reduce((acc, year, index) => ({
          ...acc,
          [year]: calculatedValues.terminalFCF[index + 1] || "-"
        }), {})
      }
    },
    {
      name: "EV",
      values: {
        Current: calculatedValues.ev[0] || "-",
        ...yearKeys.reduce((acc, year, index) => ({
          ...acc,
          [year]: calculatedValues.ev[index + 1] || "-"
        }), {})
      }
    },
    {
      name: "Net Debt",
      values: {
        Current: inputs.netDebt || "-", // Use inputs.netDebt for Current
        ...yearKeys.reduce((acc, year, index) => ({
          ...acc,
          [year]: netDebtValues[index + 1]?.toString() || "-" // Use netDebtValues for subsequent years
        }), {})
      }
    },
    {
      name: "Equity Value",
      values: {
        Current: calculatedValues.equityValue[0] || "-",
        ...yearKeys.reduce((acc, year, index) => ({
          ...acc,
          [year]: calculatedValues.equityValue[index + 1] || "-"
        }), {})
      }
    },
    {
      name: "Shares",
      values: {
        Current: inputs.shares[0] || "-",
        ...yearKeys.reduce((acc, year, index) => ({
          ...acc,
          [year]: inputs.shares[index + 1] || "-"
        }), {})
      }
    },
    {
      name: "Share Price",
      values: {
        Current: calculatedValues.sharePrice[0] || "-",
        ...yearKeys.reduce((acc, year, index) => ({
          ...acc,
          [year]: calculatedValues.sharePrice[index + 1] || "-"
        }), {})
      }
    }
  ];

  // Transform data into the required backend format
  return {
    dcfBased: {
      discountRate: parseFloat(inputs.discountRate) || 0,
      perpetualGrowthRate: parseFloat(inputs.perpetualGrowth) || 0,
      netDebt: parseFloat(inputs.netDebt) || 0,
      tableData,
      netDebtValues// Add this to persist netDebtValues
    },
    existingStake: {
      Valuation: calculatedValues.exitValuation?.toString() || "0",
      Shares: calculatedValues.totalShares?.toString() || "0",
      SharePrice: calculatedValues.exitSharePrice?.toString() || "0",
      ExitTransferPercent: inputs.exitTransferPercent?.toString() || "0",
      ExitTransferShares: calculatedValues.exitTransferShares?.toString() || "0",
      ExitTransferValue: calculatedValues.exitTransferValue?.replace('INR ', '') || "0",
      ExistingInvestorsCurrent: calculatedValues.existingInvestors?.current?.toString() || "100",
      ExistingInvestorsExit: calculatedValues.existingInvestors?.exit?.toString() || "0",
      NewInvestorsCurrent: calculatedValues.newInvestors?.current?.toString() || "-",
      NewInvestorsExit: calculatedValues.newInvestors?.exit?.toString() || "0"
    },
    inputs: {
      discountRate: inputs.discountRate?.toString(),
      perpetualGrowth: inputs.perpetualGrowth?.toString(),
      netDebt: inputs.netDebt?.toString(),
      netDebtValues: netDebtValues, // Add this to persist netDebtValues in inputs
      shares: inputs.shares.map(share => share?.toString()),
      exitTransferPercent: inputs.exitTransferPercent?.toString(),
      yearHeaders: yearHeaders // Add this to preserve year headers
    },
    exit_ofs: inputs.seriesANotes || ""
  };
};

const Slide10 = () => {
  const location = useLocation();
  const proposalId = location.state?.proposalId;
  const { updateSlideData, getSlideData } = usePitchDeck();
  const [isGlobalEditing, setIsGlobalEditing] = useState(false);
  const [yearHeaders, setYearHeaders] = useState(['Current']);
  const [fcfValues, setFcfValues] = useState(Array(5).fill('0'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

   // Add this state declaration here
   const [netDebtValues, setNetDebtValues] = useState(() => {
    const savedData = getSlideData(10);
    if (savedData?.dcfBased?.tableData) {
      const netDebtRow = savedData.dcfBased.tableData.find(row => row.name === "Net Debt");
      if (netDebtRow?.values) {
        const yearKeys = savedData.inputs?.yearHeaders?.slice(1) || ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'];
        return [
          netDebtRow.values.Current || DEFAULT_VALUES.netDebt,
          ...yearKeys.map(year => netDebtRow.values[year] || DEFAULT_VALUES.netDebt)
        ];
      }
    }
    return Array(6).fill(DEFAULT_VALUES.netDebt);
  });

  const [inputs, setInputs] = useState(() => {
    const savedData = getSlideData(10);
    return savedData?.inputs || DEFAULT_VALUES;
  });


  const [editStates, setEditStates] = useState({
    discountRate: false,
    perpetualGrowth: false,
    netDebt: false,
    shares: Array(6).fill(false),
    exitPercent: false,
    exitShares: false,
    seriesA: false
  });

  // Replace your existing fetchSlide5Data function with this updated version
  const fetchSlide5Data = async () => {
    if (!proposalId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide5/${proposalId}`);
      const data = await response.json();

      if (data.status && data.data?.slide5) {
        const { revenueStartYear, revenueStartMonth, revenueTargetYear } = data.data.slide5;

        if (revenueStartYear && revenueTargetYear) {
          const years = ['Current'];
          const month = revenueStartMonth?.toString().padStart(2, '0');

          for (let year = revenueStartYear; year <= revenueTargetYear; year++) {
            years.push(`${month}-${year}`);
          }
          setYearHeaders(years);
        }
      }
    } catch (error) {
      console.error('Error fetching Slide 5 data:', error);
      setYearHeaders(['Current', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5']);
    }
  };

  // Then in your useEffect:
  useEffect(() => {
    const loadData = async () => {
      if (!proposalId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // First load the year headers from saved data if available
        const savedData = getSlideData(10);
        if (savedData?.inputs?.yearHeaders) {
          setYearHeaders(savedData.inputs.yearHeaders);
        } else {
          // If no saved headers, fetch from Slide 5
          await fetchSlide5Data();
        }

        // Then fetch the slide data
        const slideData = await pitchDeckApi.getSlide(10, proposalId);
        const fcfData = await fetchSlide8FCF();

        if (slideData) {
          // Transform backend data to frontend structure
          const newInputs = {
            discountRate: slideData.dcfBased?.discountRate?.toString() || DEFAULT_VALUES.discountRate,
            perpetualGrowth: slideData.dcfBased?.perpetualGrowthRate?.toString() || DEFAULT_VALUES.perpetualGrowth,
            netDebt: slideData.dcfBased?.netDebt?.toString() || DEFAULT_VALUES.netDebt,
            shares: DEFAULT_VALUES.shares,
            exitTransferPercent: slideData.existingStake?.ExitTransferPercent || DEFAULT_VALUES.exitTransferPercent,
            seriesANotes: slideData.exit_ofs || DEFAULT_VALUES.seriesANotes
          };

          if (slideData.dcfBased?.tableData) {
            const sharesRow = slideData.dcfBased.tableData.find(row => row.name === "Shares");
            if (sharesRow?.values) {
              // Use year headers to get values in correct order
              newInputs.shares = [
                sharesRow.values.Current || DEFAULT_VALUES.shares[0],
                ...yearHeaders.slice(1).map(year => sharesRow.values[year] || DEFAULT_VALUES.shares[1])
              ];
            }
          }

          setInputs(newInputs);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [proposalId]);

  const fetchSlide8FCF = async () => {
    if (!proposalId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide8/${proposalId}`);
      const data = await response.json();

      if (!data.status || !data.data?.slide8) return;

      const fcfData = data.data.slide8.cashEstimates?.find(
        item => item.name === 'FCF'
      )?.values || {};

      const fcfArray = Array(5).fill('0').map((defaultValue, index) => {
        const yearKey = `Y${index + 1}`;
        return fcfData[yearKey] || defaultValue;
      });

      setFcfValues(fcfArray);
    } catch (error) {
      console.error('Error fetching Slide 8 FCF:', error);
      setFcfValues(Array(5).fill('0'));
    }
  };




  // useEffect(() => {
  //   const fetchData = async () => {
  //     if (!proposalId) return;

  //     try {
  //       const slideData = await pitchDeckApi.getSlide(10, proposalId);
  //       const fcfData = await fetchSlide8FCF(); // Fetch FCF data

  //       if (slideData) {
  //         // Transform backend data to frontend structure
  //         const newInputs = {
  //           discountRate: slideData.dcfBased?.discountRate?.toString() || DEFAULT_VALUES.discountRate,
  //           perpetualGrowth: slideData.dcfBased?.perpetualGrowthRate?.toString() || DEFAULT_VALUES.perpetualGrowth,
  //           netDebt: slideData.dcfBased?.netDebt?.toString() || DEFAULT_VALUES.netDebt,
  //           shares: DEFAULT_VALUES.shares,
  //           exitTransferPercent: slideData.existingStake?.ExitTransferPercent || DEFAULT_VALUES.exitTransferPercent,
  //           seriesANotes: slideData.exit_ofs || DEFAULT_VALUES.seriesANotes
  //         };

  //         // Extract shares data from tableData if available
  //         if (slideData.dcfBased?.tableData) {
  //           const sharesRow = slideData.dcfBased.tableData.find(row => row.name === "Shares");
  //           if (sharesRow?.values) {
  //             newInputs.shares = [
  //               sharesRow.values.Current || DEFAULT_VALUES.shares[0],
  //               sharesRow.values.Y1 || DEFAULT_VALUES.shares[1],
  //               sharesRow.values.Y2 || DEFAULT_VALUES.shares[2],
  //               sharesRow.values.Y3 || DEFAULT_VALUES.shares[3],
  //               sharesRow.values.Y4 || DEFAULT_VALUES.shares[4],
  //               sharesRow.values.Y5 || DEFAULT_VALUES.shares[5],
  //             ];
  //           }
  //         }

  //         setInputs(newInputs);
  //       }
  //     } catch (error) {
  //       console.error('Failed to fetch slide data:', error);
  //     }
  //   };

  //   fetchData();
  // }, [proposalId]);


  // useEffect(() => {
  //   const fetchFCFData = async () => {
  //     if (!proposalId) return;

  //     try {
  //       const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide8/${proposalId}`);
  //       const data = await response.json();

  //       if (!data.status || !data.data?.slide8) return;

  //       const fcfData = data.data.slide8.cashEstimates?.find(
  //         item => item.name === 'FCF'
  //       )?.values || {};

  //       const fcfArray = Array(5).fill('0').map((defaultValue, index) => {
  //         const yearKey = `Y${index + 1}`;
  //         return fcfData[yearKey] || defaultValue;
  //       });

  //       setFcfValues(fcfArray);
  //     } catch (error) {
  //       console.error('Error fetching Slide 8 FCF:', error);
  //       setFcfValues(Array(5).fill('0'));
  //     }
  //   };

  //   fetchFCFData();
  // }, [proposalId]);

  // Your existing calculatedValues useMemo and rest of the code remains the same
  const calculatedValues = useMemo(() => {
    try {
      const dr = parseFloat(inputs.discountRate) / 100;
      const pg = parseFloat(inputs.perpetualGrowth) / 100;
  
      // Initialize arrays
      let fcf = Array(6).fill('');
      fcf[0] = ''; // Current year is blank
  
      // Use fcfValues for years 1-5
      fcf[1] = fcfValues[0]?.toString() || '0';
      fcf[2] = fcfValues[1]?.toString() || '0';
      fcf[3] = fcfValues[2]?.toString() || '0';
      fcf[4] = fcfValues[3]?.toString() || '0';
      fcf[5] = fcfValues[4]?.toString() || '0';
  
      // Calculate PV Factor
      const pvFactor = Array(6).fill('');
      pvFactor[0] = ''; // Current year is blank
      const basePVFactor = dr !== 0 ? (1 / dr).toFixed(4) : '0.0000';
      for (let i = 1; i < 6; i++) {
        pvFactor[i] = basePVFactor;
      }
  
      // Calculate PV of FCF
      const pvOfFCF = Array(6).fill('');
      let sumPVofFCF = 0;
  
      // Calculate for years 1-5
      for (let i = 1; i < 6; i++) {
        const fcfVal = parseFloat(fcf[i]) || 0;
        const pvFactorVal = parseFloat(pvFactor[i]);
        const pvValue = fcfVal * pvFactorVal;
        pvOfFCF[i] = pvValue.toFixed(0);
        sumPVofFCF += pvValue;
      }
      // Set current year as sum of other years
      pvOfFCF[0] = sumPVofFCF.toFixed(0);
  
      // Calculate Terminal FCF (only for Year 5)
      const terminalFCF = Array(6).fill('');
      const year5FCF = parseFloat(fcf[5]) || 0;
      terminalFCF[5] = (year5FCF * pg).toFixed(0);
  
      // Calculate Enterprise Value (EV)
      const ev = Array(6).fill('');
      for (let i = 1; i < 6; i++) {
        const pvFcfVal = parseFloat(pvOfFCF[i]) || 0;
        const terminalVal = i === 5 ? parseFloat(terminalFCF[5]) || 0 : 0;
        ev[i] = (pvFcfVal + terminalVal).toFixed(0);
      }
      ev[0] = (sumPVofFCF + parseFloat(terminalFCF[5])).toFixed(0);
  
      // Calculate Equity Value using the corresponding netDebtValues for each year
      const equityValue = Array(6).fill('');
      for (let i = 0; i < 6; i++) {
        const evVal = parseFloat(ev[i]) || 0;
        // Use the corresponding net debt value for each year
        const netDebtVal = parseFloat(netDebtValues[i]) || 0;
        equityValue[i] = (evVal - netDebtVal).toFixed(0);
      }
  
      // Calculate Share Price using the updated equity values
      const sharePrice = Array(6).fill('');
      for (let i = 0; i < 6; i++) {
        const eqVal = parseFloat(equityValue[i]) || 0;
        const sharesVal = parseFloat(inputs.shares[i]) || 1;
        sharePrice[i] = (eqVal / sharesVal).toFixed(2);
      }
  
      // Calculate Exit values using the updated equity value
      const exitPercent = parseFloat(inputs.exitTransferPercent) || 0;
      const exitTransferShares = Math.round(parseFloat(inputs.shares[0]) * exitPercent / 100);
      const exitTransferValue = parseFloat(equityValue[0]) * exitPercent / 100;
  
      // Calculate investor percentages
      const newInvestorPct = 20; // Fixed at 20%
      const existingInvestorPct = 100 - newInvestorPct;
  
      return {
        fcf,
        pvFactor,
        pvOfFCF,
        terminalFCF,
        ev,
        equityValue,
        sharePrice,
        netDebt: netDebtValues,
        exitValuation: equityValue[0],
        totalShares: inputs.shares[0],
        exitSharePrice: sharePrice[0],
        exitTransferShares: exitTransferShares.toFixed(0),
        exitTransferValue: formatCurrency(exitTransferValue),
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
      // Return default values
      return {
        fcf: Array(6).fill(''),
        pvFactor: Array(6).fill(''),
        pvOfFCF: Array(6).fill(''),
        terminalFCF: Array(6).fill(''),
        ev: Array(6).fill(''),
        equityValue: Array(6).fill(''),
        sharePrice: Array(6).fill(''),
        netDebt: netDebtValues,
        exitValuation: '0',
        totalShares: '0',
        exitSharePrice: '0',
        exitTransferShares: '0',
        exitTransferValue: '0',
        existingInvestors: { current: '100', exit: '80' },
        newInvestors: { current: '-', exit: '20' }
      };
    }
  }, [inputs, fcfValues, netDebtValues]); // Add netDebtValues to dependencies
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const transformedData = transformDataForBackend(inputs, calculatedValues, yearHeaders, netDebtValues);
      updateSlideData(10, transformedData);
    }, 300);

    return () => clearTimeout(timeoutId);
  }
    , [inputs, calculatedValues, yearHeaders, updateSlideData]);

  const validateInput = (field, value) => {
    return true; // Remove all validation checks
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
  const fetchSlide10Data = async () => {
    if (!proposalId) return;
  
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/get-slide10/${proposalId}`);
      const data = await response.json();
  
      if (data.status && data.data?.slide10) {
        const slide10 = data.data.slide10;
  
        // Extract net debt values
        let loadedNetDebtValues = Array(6).fill(DEFAULT_VALUES.netDebt);
        if (slide10.dcfBased?.tableData) {
          const netDebtRow = slide10.dcfBased.tableData.find(row => 
            row.name.toLowerCase() === "net debt" || row.name.toLowerCase() === "netdebt"
          );
          
          if (netDebtRow?.values) {
            const yearKeys = Object.keys(netDebtRow.values).filter(key => key !== 'Current');
            loadedNetDebtValues = [
              slide10.dcfBased.netDebt?.toString() || DEFAULT_VALUES.netDebt,
              ...yearKeys.map(year => {
                const value = netDebtRow.values[year];
                return value === "-" ? DEFAULT_VALUES.netDebt : value;
              })
            ];
          }
        }
  
        // Set net debt values state
        setNetDebtValues(loadedNetDebtValues);
  
        // Update shares data
        let sharesData = Array(6).fill(DEFAULT_VALUES.shares[0]);
        if (slide10.dcfBased?.tableData) {
          const sharesRow = slide10.dcfBased.tableData.find(row => row.name === "Shares");
          if (sharesRow?.values) {
            const yearKeys = Object.keys(sharesRow.values).filter(key => key !== 'Current');
            sharesData = [
              sharesRow.values.Current || DEFAULT_VALUES.shares[0],
              ...yearKeys.map(year => sharesRow.values[year] || DEFAULT_VALUES.shares[0])
            ];
          }
        }
  
        // Extract existing stake data
        const existingStake = slide10.existingStake || {};
        
        // Update inputs with the loaded data, properly handling exit transfer data
        setInputs(prev => ({
          discountRate: slide10.dcfBased?.discountRate?.toString() || DEFAULT_VALUES.discountRate,
          perpetualGrowth: slide10.dcfBased?.perpetualGrowthRate?.toString() || DEFAULT_VALUES.perpetualGrowth,
          netDebt: slide10.dcfBased?.netDebt?.toString() || DEFAULT_VALUES.netDebt,
          shares: sharesData,
          // Properly handle exit transfer percent from different possible field names
          exitTransferPercent: existingStake.ExitTransferPercent || 
                             existingStake.transfer || 
                             existingStake['transfer%'] || 
                             prev.exitTransferPercent || 
                             DEFAULT_VALUES.exitTransferPercent,
          seriesANotes: slide10.exit_ofs || DEFAULT_VALUES.seriesANotes
        }));
  
        // Update calculated values if needed
        const exitTransferValue = existingStake.ExitTransferValue || 
                                existingStake.transfer_value || 
                                calculatedValues.exitTransferValue;
        
        const exitTransferShares = existingStake.ExitTransferShares || 
                                  existingStake.transfer_shares || 
                                  calculatedValues.exitTransferShares;
  
        // Optional: Update any other state that depends on these values
        if (exitTransferValue || exitTransferShares) {
          // You might need to update some other state or trigger recalculation
          // depending on your component's logic
        }
      }
    } catch (error) {
      console.error('Error fetching Slide 10 data:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    setNetDebtValues(prev => {
      if (prev[0] !== inputs.netDebt) {
        const newValues = [...prev];
        newValues[0] = inputs.netDebt;
        return newValues;
      }
      return prev;
    });
  }, [inputs.netDebt]);
  const handleSave = async () => {
    if (!proposalId) {
      console.error('No proposal ID available');
      return;
    }
  
    try {
      setIsDirty(false);
      
      // Ensure current netDebt value is in sync
      const currentNetDebtValues = [...netDebtValues];
      currentNetDebtValues[0] = inputs.netDebt;
  
      // Get year keys from headers
      const yearKeys = yearHeaders.slice(1); // Remove 'Current'
  
      // Prepare the complete table data
      const tableData = [
        {
          name: "Free Cash Flow",
          values: {
            Current: "-",
            ...yearKeys.reduce((acc, year, index) => ({
              ...acc,
              [year]: calculatedValues.fcf[index + 1] || "-"
            }), {})
          }
        },
        {
          name: "PV Factor",
          values: {
            Current: "-",
            ...yearKeys.reduce((acc, year, index) => ({
              ...acc,
              [year]: calculatedValues.pvFactor[index + 1] || "-"
            }), {})
          }
        },
        {
          name: "PV of FCF",
          values: {
            Current: calculatedValues.pvOfFCF[0] || "-",
            ...yearKeys.reduce((acc, year, index) => ({
              ...acc,
              [year]: calculatedValues.pvOfFCF[index + 1] || "-"
            }), {})
          }
        },
        {
          name: "Ter Free Cash Flow",
          values: {
            Current: "-",
            ...yearKeys.reduce((acc, year, index) => ({
              ...acc,
              [year]: calculatedValues.terminalFCF[index + 1] || "-"
            }), {})
          }
        },
        {
          name: "EV",
          values: {
            Current: calculatedValues.ev[0] || "-",
            ...yearKeys.reduce((acc, year, index) => ({
              ...acc,
              [year]: calculatedValues.ev[index + 1] || "-"
            }), {})
          }
        },
        {
          name: "Net debt",
          values: {
            Current: inputs.netDebt || "-",
            ...yearKeys.reduce((acc, year, index) => ({
              ...acc,
              [year]: currentNetDebtValues[index + 1]?.toString() || "-"
            }), {})
          }
        },
        {
          name: "Equity value",
          values: {
            Current: calculatedValues.equityValue[0] || "-",
            ...yearKeys.reduce((acc, year, index) => ({
              ...acc,
              [year]: calculatedValues.equityValue[index + 1] || "-"
            }), {})
          }
        },
        {
          name: "Shares",
          values: {
            Current: inputs.shares[0] || "-",
            ...yearKeys.reduce((acc, year, index) => ({
              ...acc,
              [year]: inputs.shares[index + 1] || "-"
            }), {})
          }
        },
        {
          name: "Share Price",
          values: {
            Current: calculatedValues.sharePrice[0] || "-",
            ...yearKeys.reduce((acc, year, index) => ({
              ...acc,
              [year]: calculatedValues.sharePrice[index + 1] || "-"
            }), {})
          }
        }
      ];
  
      // Prepare the payload
      const payload = {
        proposalId,
        dcfBased: {
          discountRate: parseFloat(inputs.discountRate) || 0,
          perpetualGrowthRate: parseFloat(inputs.perpetualGrowth) || 0,
          netDebt: parseFloat(inputs.netDebt) || 0,
          tableData
        },
        existingStake: {
          Valuation: calculatedValues.exitValuation?.toString() || "0",
          Shares: calculatedValues.totalShares?.toString() || "0",
          SharePrice: calculatedValues.exitSharePrice?.toString() || "0",
          // Use consistent field names
          ExitTransferPercent: inputs.exitTransferPercent?.toString() || "0",
          ExitTransferShares: calculatedValues.exitTransferShares?.toString() || "0",
          ExitTransferValue: calculatedValues.exitTransferValue?.toString().replace('INR ', '') || "0",
          ExistingInvestorsCurrent: calculatedValues.existingInvestors?.current?.toString() || "100",
          ExistingInvestorsExit: calculatedValues.existingInvestors?.exit?.toString() || "80",
          NewInvestorsCurrent: calculatedValues.newInvestors?.current?.toString() || "-",
          NewInvestorsExit: calculatedValues.newInvestors?.exit?.toString() || "20"
        },
        exit_ofs: inputs.seriesANotes || ""
      };
  
      // Show loading toast
      toast.loading('Saving changes...', {
        toastId: 'saving-changes',
      });
  
      const response = await fetch(`${API_BASE_URL}/api/business-proposal/update-slide10`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
  
      const data = await response.json();
      
      // Dismiss loading toast
      toast.dismiss('saving-changes');
  
      if (!data.status) {
        throw new Error(data.message || 'Failed to save data');
      }
  
      // Update states with the saved values
      setNetDebtValues(currentNetDebtValues);
      
      // Refetch data to ensure we have the latest state
      await fetchSlide10Data();
  
      toast.success('Changes saved successfully!', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        style: {
          background: '#17843f',
          color: 'white',
          fontWeight: '500',
        },
      });
  
      // Add a small delay before allowing new changes to be tracked
      setTimeout(() => {
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      }, 100);
  
    } catch (error) {
      console.error('Failed to save slide 10:', error);
      toast.dismiss('saving-changes');
      toast.error('Failed to save changes', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setIsDirty(true);
    }
  };
    // Initial data load
    useEffect(() => {
      const loadInitialData = async () => {
        if (!proposalId) {
          setIsLoading(false);
          return;
        }
    
        try {
          setIsLoading(true);
          setError(null);
    
          // Fetch the year headers from slide 5 if needed
          await fetchSlide5Data();
          
          // Load the main slide data
          await fetchSlide10Data();
          
          // Load FCF data from slide 8
          await fetchSlide8FCF();
    
        } catch (error) {
          console.error('Error loading data:', error);
          setError('Failed to load data');
        } finally {
          setIsLoading(false);
        }
      };
    
      loadInitialData();
    }, [proposalId]);

    // Auto-save effect
    useEffect(() => {
      if (isDirty) {
        const timeoutId = setTimeout(() => {
          const transformedData = transformDataForBackend(inputs, calculatedValues, yearHeaders, netDebtValues);
          updateSlideData(10, transformedData);
        }, 300);

        return () => clearTimeout(timeoutId);
      }
    }, [inputs, calculatedValues, yearHeaders, isDirty]);

    
// 4. Add an effect to update netDebtValues when inputs.netDebt changes

useEffect(() => {
  if (!isLoading) {
    const hasChanges = JSON.stringify(netDebtValues) !== JSON.stringify(Array(6).fill(DEFAULT_VALUES.netDebt));
    if (hasChanges) {
      setIsDirty(true);
    }
  }
}, [netDebtValues, isLoading]);

useEffect(() => {
  if (!isLoading) {
    const hasChanges = 
      inputs.discountRate !== DEFAULT_VALUES.discountRate ||
      inputs.perpetualGrowth !== DEFAULT_VALUES.perpetualGrowth ||
      inputs.netDebt !== DEFAULT_VALUES.netDebt ||
      inputs.exitTransferPercent !== DEFAULT_VALUES.exitTransferPercent ||
      inputs.seriesANotes !== DEFAULT_VALUES.seriesANotes ||
      JSON.stringify(inputs.shares) !== JSON.stringify(DEFAULT_VALUES.shares);
    
    if (hasChanges) {
      setIsDirty(true);
    }
  }
}, [inputs, isLoading]);

useEffect(() => {
  if (!isLoading) {
    setIsDirty(false);
  }
}, [isLoading]);

    const toggleEdit = (field, index = null) => {
      setEditStates(prev => {
        if (field === 'shares') {
          const newShares = [...prev.shares];
          newShares[index] = !newShares[index];
          return { ...prev, shares: newShares };
        }
        return { ...prev, [field]: !prev[field] };
      });
    };

    const updateShareValue = (index, value) => {
      const newShares = [...inputs.shares];
      newShares[index] = value;
      setInputs(prev => ({
        ...prev,
        shares: newShares
      }));
      setIsDirty(true); // Set dirty when shares update
    };

    // const getEditableStyle = (isEditable) => {
    //   return isGlobalEditing && isEditable ? editableFieldStyle : '';
    // };

    return (
      <div className="max-w-7xl mx-auto p-2">
        <div className="grid grid-cols-3 gap-4">
          {/* DCF Valuation Section */}
          <div className="col-span-2 border-4 border-green-700 rounded-lg p-2">
            {/* Add this right after the title in the DCF Valuation section */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-green-700">DCF Valuation Basis</h2>
              <button
                onClick={() => {
                  setIsGlobalEditing(!isGlobalEditing);
                  setEditStates({
                    discountRate: !isGlobalEditing,
                    perpetualGrowth: !isGlobalEditing,
                    netDebt: !isGlobalEditing,
                    shares: Array(6).fill(!isGlobalEditing),
                    exitPercent: !isGlobalEditing,
                    exitShares: !isGlobalEditing,
                    seriesA: !isGlobalEditing
                  });
                }}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <Edit className="w-4 h-4 mr-1" />
                <span className="text-sm">{isGlobalEditing ? 'Done' : 'Edit'}</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="bg-gray-200 py-0.5 px-1">
                <div className="flex justify-between items-center h-6">
                  <span className="text-sm">Discount Rate</span>
                  <div className="flex items-center">
                    {isGlobalEditing ? (
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
                    {isGlobalEditing ? (
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
                    {isGlobalEditing ? (
                      <input
                        type="number"
                        value={inputs.netDebt}
                        onChange={(e) => handleInputChange('netDebt', e.target.value)}
                        className={inputStyle}
                      />
                    ) : (
                      <span className="text-sm">{inputs.netDebt}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
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
                    { label: '(-) Net Debt', key: 'netDebt', editable: true },
                    { label: 'Equity Value', key: 'equityValue' },
                    { label: '# Shares', key: 'shares', editable: true },
                    { label: 'Share Price', key: 'sharePrice' }
                  ].map((row) => (
                    <tr key={row.key} className={`h-6 ${row.key === 'ev' ? 'bg-blue-50' : ''}`}>
                      <td className="border py-0.5 px-1 font-medium text-sm">{row.label}</td>
                      {[0, 1, 2, 3, 4, 5].map((col) => (
                        <td key={col} className="border py-0.5 px-1 text-center">
                          {row.key === 'netDebt' ? (
                            <div className="flex items-center justify-center text-sm">
                              {col === 0 ? (
                                // Current column - just display the value from inputs.netDebt
                                <span className="text-sm">{inputs.netDebt}</span>
                              ) : (
                                // Other columns - keep the edit functionality
                                isGlobalEditing ? (
                                  <input
                                    type="number"
                                    value={netDebtValues[col]}
                                    onChange={(e) => {
                                      setNetDebtValues(prev => {
                                        const newValues = [...prev];
                                        newValues[col] = e.target.value;
                                        return newValues;
                                      });
                                    }}
                                    className={inputStyle}
                                  />
                                ) : (
                                  <span className="text-sm">{netDebtValues[col]}</span>
                                )
                              )}
                            </div>
                          ) : row.key === 'shares' ? (
                            <div className="flex items-center justify-center text-sm">
                              {col === 0 ? (
                                isGlobalEditing ? (
                                  <input
                                    type="number"
                                    value={inputs.shares[0]}
                                    onChange={(e) => updateShareValue(0, e.target.value)}
                                    className={inputStyle}
                                  />
                                ) : (
                                  <span className="text-sm">{inputs.shares[0]}</span>
                                )
                              ) : (
                                <span className="text-sm">-</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm">
                              {calculatedValues && calculatedValues[row.key] ? calculatedValues[row.key][col] : '-'}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
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
                {/* Your existing exit section content */}
                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-green-600 text-white py-0.5 px-1 text-sm">Valuation</div>
                  <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                    {calculatedValues.exitValuation}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-green-600 text-white py-0.5 px-1 text-sm"># Shares</div>
                  <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                    {calculatedValues.totalShares}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-green-600 text-white py-0.5 px-1 text-sm">Share Price</div>
                  <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                    {calculatedValues.exitSharePrice}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-blue-600 text-white py-0.5 px-1 text-sm">Exit / Transfer %</div>
                  <div className="bg-gray-200 py-0.5 px-1">
                    <div className="flex items-center justify-between">
                      {isGlobalEditing ? (
                        <input
                          type="text"
                          value={inputs.exitTransferPercent}
                          onChange={(e) => setInputs(prev => ({ ...prev, exitTransferPercent: e.target.value }))}
                          className="w-full py-0.5 px-1 text-center text-sm"
                        />
                      ) : (
                        <span className="text-sm text-center w-full">{inputs.exitTransferPercent}%</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-blue-600 text-white py-0.5 px-1 text-sm">Exit / Transfer Shares</div>
                  <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                    {calculatedValues.exitTransferShares}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-blue-600 text-white py-0.5 px-1 text-sm">Exit / Transfer Value</div>
                  <div className="bg-gray-200 py-0.5 px-1 text-center text-sm">
                    {calculatedValues.exitTransferValue}
                  </div>
                </div>

                {/* Investors Table */}
                <table className="w-full border-collapse mt-1">
                  <tbody>
                    <tr className="h-6">
                      <td className="border py-0.5 px-1 text-sm">Existing Investors</td>
                      <td className="border py-0.5 px-1 text-center text-sm">{calculatedValues.existingInvestors.current}%</td>
                      <td className="border py-0.5 px-1 text-center text-sm">{calculatedValues.existingInvestors.exit}%</td>
                    </tr>
                    <tr className="h-6">
                      <td className="border py-0.5 px-1 text-sm">New Investors</td>
                      <td className="border py-0.5 px-1 text-center text-sm">{calculatedValues.newInvestors.current}</td>
                      <td className="border py-0.5 px-1 text-center text-sm">{calculatedValues.newInvestors.exit}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Series A Notes Section - Moved inside right column */}
            <div className="border-4 border-green-700 rounded-lg p-1.5">
              <h3 className="font-bold mb-1 text-sm">Series A Notes</h3>
              <textarea
                value={inputs.seriesANotes}
                onChange={(e) => handleInputChange('seriesANotes', e.target.value)}
                className="w-full h-32 resize-none text-sm focus:outline-none"
                placeholder="Enter notes about Series A funding..."
                readOnly={!isGlobalEditing}
              />
            </div>
          </div>
        </div>
        {isDirty && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      )}
        {/* Add this just before the final closing div */}
        <div className="max-w-7xl mx-auto p-2">
          {/* Your existing JSX */}

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
      </div>
    );
  };

  export default Slide10;