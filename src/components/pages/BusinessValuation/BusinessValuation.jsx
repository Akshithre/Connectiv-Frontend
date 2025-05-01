import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import Navigation from "./Navigation";
import Navbar from "../../../components/pages/Navbar";
import { useBusinessProposal } from "../../../providers/businessProposalContextProvider";
import { valuationApi } from "../../../services/valuationApi";
// import { useAuth } from '../../contexts/authContext/index';
import ValuationInput from "./ValuationInput";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const ImproveValuationModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="bg-white rounded-lg p-8 max-w-[600px] w-full mx-4 relative z-10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Content */}
        <div className="mt-2">
          <h2 className="text-xl font-semibold text-center mb-4">
            Do you need help to understand and improve your valuation?
          </h2>

          <p className="text-gray-700 mb-4">
            We provide customised services to help you identify and implement
            levers that can improve our business valuation
          </p>

          <ul className="space-y-2 mb-6 list-disc pl-6">
            <li className="text-gray-700">Business and Market Strategy</li>
            <li className="text-gray-700">Business Performance Management</li>
            <li className="text-gray-700">
              CFO, Accounting and Reporting Services
            </li>
            <li className="text-gray-700">Governance</li>
            <li className="text-gray-700">Tax & Legal</li>
          </ul>

          <div className="text-center mt-6">
            <button
              onClick={() => {
                onClose();
                navigate("/contactus");
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BusinessValuation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { userDetails, setUserDetails } = useAuth();
  const {
    businessProposal,
    setBusinessProposal,
    updateBusinessProposal,
    updateMap,
  } = useBusinessProposal();
  const [shouldRefresh, setShouldRefresh] = useState(false);
  // State declarations - all hooks must be at the top level
  const [currentStep, setCurrentStep] = useState(2);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [businessType, setBusinessType] = useState("established");
  const [activeTab, setActiveTab] = useState("ebitda");
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState("");
  const [proposalId, setProposalId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const [initializationStatus, setInitializationStatus] = useState({
    initialized: false,
    dataFetched: false,
  });
  // Initialize valuationResult state
  const [valuationResult, setValuationResult] = useState({
    amount: "",
    rating: "AA+",
  });
  const calculateCAGR = (finalValue, initialValue, years) => {
    if (!finalValue || !initialValue || finalValue <= 0 || initialValue <= 0)
      return 0;
    return (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100; // Convert to percentage
  };

  const getRevenuePoints = (cagr) => {
    if (cagr > 15) return 9;
    if (cagr > 10) return 7;
    if (cagr > 5) return 5;
    if (cagr > 0) return 3;
    if (cagr >= -10) return 1;
    return 0;
  };

  const getEBITDAPoints = (cagr) => {
    if (cagr > 20) return 9;
    if (cagr > 15) return 7;
    if (cagr > 10) return 5;
    if (cagr > 5) return 3;
    if (cagr >= 0) return 1;
    return 0;
  };

  const getROCEPoints = (roce) => {
    const rocePercentage = roce * 100;
    if (rocePercentage > 20) return 9;
    if (rocePercentage > 15) return 7;
    if (rocePercentage >= 10 && rocePercentage <= 15) return 5;
    if (rocePercentage >= 5 && rocePercentage < 10) return 3;
    if (rocePercentage >= 0 && rocePercentage < 5) return 1;
    return 0;
  };

  const getMultipleAdjustment = (weightedPoints) => {
    if (weightedPoints >= 9) return { multiple: 3, rating: "A+" };
    if (weightedPoints >= 7 && weightedPoints < 9)
      return { multiple: 2, rating: "A" };
    if (weightedPoints >= 5 && weightedPoints < 7)
      return { multiple: 1, rating: "A-" };
    if (weightedPoints >= 3 && weightedPoints < 5)
      return { multiple: 0, rating: "B" };
    if (weightedPoints >= 1 && weightedPoints < 3)
      return { multiple: -1, rating: "B-" };
    return { multiple: -2, rating: "C" };
  };
  // Initialize valuationData state
  const initialValuationData = {
    ebitda: {
      years: ["", "", "", ""],
      revenue: {},
      ebitda: {},
      grossDebt: "",
      capitalEmployed: "",
    },
    dcf: {
      years: ["", "", "", "", ""],
      revenue: {},
      ebitda: {},
      capex: {},
      wcap_days: {},
      perpetualGrowthRate: "",
      wcap: "",
      grossDebt: "",
      capitalEmployed: "",
    },
  };
  const [valuationData, setValuationData] = useState(initialValuationData);
  const safeMapToObject = (map) => {
    if (!map) return {};
    try {
      if (map instanceof Map) {
        return Object.fromEntries(map);
      }
      return typeof map === "object" ? map : {};
    } catch (error) {
      console.warn("Error converting map:", error);
      return {};
    }
  };

  useEffect(() => {
    const shouldRefresh = location.state?.shouldRefresh;
    if (shouldRefresh) {
      // Clear the refresh flag from location state
      const newState = { ...location.state };
      delete newState.shouldRefresh;
      navigate(location.pathname, { state: newState, replace: true });
      // Perform the refresh
      window.location.reload();
    }
  }, [location.state]);
  // useEffect(() => {
  //   const proposalIdFromState = location.state?.proposalId;
  //   if (proposalIdFromState) {
  //     setProposalId(proposalIdFromState);
  //     setInitializationStatus(prev => ({ ...prev, initialized: true }));
  //   } else {
  //     navigate('/business-proposal');
  //   }
  // }, [location.state, navigate]);

  useEffect(() => {
    const fetchProposalData = async () => {
      if (!proposalId || !initializationStatus.initialized) return;

      try {
        console.log("Fetching data for proposalId:", proposalId);
        const response = await fetch(
          `${API_BASE_URL}/api/business-proposal/get-proposal/${proposalId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch proposal data");
        }

        const responseData = await response.json();
        const data = responseData.data;
        console.log("Fetched data:", data);

        // Set business type and active tab
        const newBusinessType = data.businessType || "established";
        setBusinessType(newBusinessType);
        setActiveTab(newBusinessType === "startup" ? "dcf" : "ebitda");

        // Get years from the data
        const ebitdaYears = Object.keys(
          data.ebitdaValuation?.revenue || {}
        ).sort();
        const dcfYears = Object.keys(data.dcfValuation?.revenue || {}).sort();

        // Update valuation data with fetched data
        setValuationData({
          ebitda: {
            years: ebitdaYears.length ? ebitdaYears : ["", "", "", ""],
            revenue: data.ebitdaValuation?.revenue || {},
            ebitda: data.ebitdaValuation?.ebitda || {},
            grossDebt: data.ebitdaValuation?.grossDebt?.toString() || "",
            capitalEmployed:
              data.ebitdaValuation?.capitalEmployed?.toString() || "",
          },
          dcf: {
            years: dcfYears.length ? dcfYears : ["", "", "", "", ""],
            revenue: data.dcfValuation?.revenue || {},
            ebitda: data.dcfValuation?.ebitda || {},
            capex: data.dcfValuation?.capex || {},
            wcap_days: data.dcfValuation?.wcap_days || {},
            perpetualGrowthRate:
              data.dcfValuation?.perpetualGrowthRate?.toString() || "",
            wcap: data.dcfValuation?.wcap?.toString() || "",
            grossDebt: data.dcfValuation?.grossDebt?.toString() || "",
            capitalEmployed:
              data.dcfValuation?.capitalEmployed?.toString() || "",
          },
        });

        // Set valuation result
        const activeValuation =
          data.businessType === "startup"
            ? data.dcfValuation
            : data.ebitdaValuation;
        if (activeValuation?.valuation) {
          setValuationResult({
            amount: activeValuation.valuation,
            rating: activeValuation.rating || "AA+",
          });
        }

        // Update context with the fetched data
        updateBusinessProposal("businessType", newBusinessType);
        if (data.ebitdaValuation) {
          Object.entries(data.ebitdaValuation.revenue || {}).forEach(
            ([year, value]) => {
              updateMap(
                "ebitdaValuation.revenue",
                year,
                parseFloat(value) || 0
              );
            }
          );
          Object.entries(data.ebitdaValuation.ebitda || {}).forEach(
            ([year, value]) => {
              updateMap("ebitdaValuation.ebitda", year, parseFloat(value) || 0);
            }
          );
          updateBusinessProposal(
            "ebitdaValuation.grossDebt",
            parseFloat(data.ebitdaValuation.grossDebt) || 0
          );
          updateBusinessProposal(
            "ebitdaValuation.capitalEmployed",
            parseFloat(data.ebitdaValuation.capitalEmployed) || 0
          );
          updateBusinessProposal(
            "ebitdaValuation.valuation",
            parseFloat(data.ebitdaValuation.valuation) || 0
          );
          updateBusinessProposal(
            "ebitdaValuation.rating",
            data.ebitdaValuation.rating || ""
          );
        }

        if (data.dcfValuation) {
          Object.entries(data.dcfValuation.revenue || {}).forEach(
            ([year, value]) => {
              updateMap("dcfValuation.revenue", year, parseFloat(value) || 0);
            }
          );
          Object.entries(data.dcfValuation.ebitda || {}).forEach(
            ([year, value]) => {
              updateMap("dcfValuation.ebitda", year, parseFloat(value) || 0);
            }
          );
          Object.entries(data.dcfValuation.capex || {}).forEach(
            ([year, value]) => {
              updateMap("dcfValuation.capex", year, parseFloat(value) || 0);
            }
          );
          Object.entries(data.dcfValuation.wcap_days || {}).forEach(
            ([year, value]) => {
              updateMap("dcfValuation.wcap_days", year, parseFloat(value) || 0);
            }
          );
          updateBusinessProposal(
            "dcfValuation.perpetualGrowthRate",
            parseFloat(data.dcfValuation.perpetualGrowthRate) || 0
          );
          updateBusinessProposal(
            "dcfValuation.wcap",
            parseFloat(data.dcfValuation.wcap) || 0
          );
          updateBusinessProposal(
            "dcfValuation.grossDebt",
            parseFloat(data.dcfValuation.grossDebt) || 0
          );
          updateBusinessProposal(
            "dcfValuation.capitalEmployed",
            parseFloat(data.dcfValuation.capitalEmployed) || 0
          );
          updateBusinessProposal(
            "dcfValuation.valuation",
            parseFloat(data.dcfValuation.valuation) || 0
          );
          updateBusinessProposal(
            "dcfValuation.rating",
            data.dcfValuation.rating || ""
          );
        }

        setInitializationStatus((prev) => ({ ...prev, dataFetched: true }));
      } catch (err) {
        console.error("Error fetching proposal:", err);
        setError("Failed to fetch proposal data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProposalData();
  }, [proposalId, initializationStatus.initialized]);
  // Show loading state while fetching
  useEffect(() => {
    if (businessProposal) {
      try {
        console.log(
          "Initializing BusinessValuation with context:",
          businessProposal
        );

        if (businessProposal.businessType) {
          setBusinessType(businessProposal.businessType);
        }

        const ebitdaRevenue = businessProposal.ebitdaValuation?.revenue || {};
        const ebitdaEbitda = businessProposal.ebitdaValuation?.ebitda || {};
        const dcfRevenue = businessProposal.dcfValuation?.revenue || {};
        const dcfEbitda = businessProposal.dcfValuation?.ebitda || {};
        const dcfCapex = businessProposal.dcfValuation?.capex || {};
        const dcfWcapDays = businessProposal.dcfValuation?.wcap_days || {};

        setValuationData((prevData) => ({
          ebitda: {
            ...prevData.ebitda,
            revenue: safeMapToObject(ebitdaRevenue),
            ebitda: safeMapToObject(ebitdaEbitda),
            grossDebt: businessProposal.ebitdaValuation?.grossDebt || "",
            capitalEmployed:
              businessProposal.ebitdaValuation?.capitalEmployed || "",
          },
          dcf: {
            ...prevData.dcf,
            revenue: safeMapToObject(dcfRevenue),
            ebitda: safeMapToObject(dcfEbitda),
            capex: safeMapToObject(dcfCapex),
            perpetualGrowthRate:
              businessProposal.dcfValuation?.perpetualGrowthRate || "",
            wcap: businessProposal.dcfValuation?.wcap || "",
            grossDebt: businessProposal.dcfValuation?.grossDebt || "",
            capitalEmployed:
              businessProposal.dcfValuation?.capitalEmployed || "",
          },
        }));

        if (
          businessProposal.ebitdaValuation?.valuation ||
          businessProposal.dcfValuation?.valuation
        ) {
          setValuationResult({
            amount:
              activeTab === "ebitda"
                ? businessProposal.ebitdaValuation?.valuation
                : businessProposal.dcfValuation?.valuation,
            rating:
              activeTab === "ebitda"
                ? businessProposal.ebitdaValuation?.rating
                : businessProposal.dcfValuation?.rating,
          });
        }
      } catch (error) {
        console.error("Error during initialization:", error);
        // Initialize with default values if there's an error
        setValuationData(initialValuationData);
      }
    }
  }, [businessProposal, activeTab]);
  useEffect(() => {
    const proposalIdFromState = location.state?.proposalId;
    if (proposalIdFromState) {
      setProposalId(proposalIdFromState);
      setInitializationStatus((prev) => ({ ...prev, initialized: true }));
    } else {
      navigate("/home");
    }
  }, [location.state, navigate]);
  // useEffect(() => {
  //   if (location.state?.proposalId) {
  //     setProposalId(location.state.proposalId);
  //   } else {
  //     navigate('/business-proposal');
  //   }
  // }, [location, navigate]);
  useEffect(() => {
    console.log("State Updates:", {
      valuationData,
      activeTab,
      businessType,
      // isEditing,
      businessProposal,
    });
  }, [valuationData, activeTab, businessType, businessProposal]);
  const handleValueChange = async (section, field, year, value) => {
    setHasChanges(true);

    // Handle non-year fields (grossDebt and capitalEmployed)
    if (!year) {
      setValuationData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));

      // Update context for non-year fields
      if (section === "ebitda") {
        updateBusinessProposal(`ebitdaValuation.${field}`, value);
      } else if (section === "dcf") {
        updateBusinessProposal(`dcfValuation.${field}`, value);
      }
      return;
    }

    // Handle year-based fields (existing logic)
    let updatedFieldData = {};
    const currentYears = valuationData[section].years;

    currentYears.forEach((currentYear, index) => {
      if (currentYear === year) {
        updatedFieldData[currentYear] = value;
      } else if (valuationData[section][field]?.[currentYear]) {
        updatedFieldData[currentYear] =
          valuationData[section][field][currentYear];
      }
    });

    setValuationData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: updatedFieldData,
      },
    }));

    // Update context for year-based fields
    if (section === "ebitda") {
      updateBusinessProposal(`ebitdaValuation.${field}`, new Map());
      Object.entries(updatedFieldData).forEach(([yearKey, yearValue]) => {
        updateMap(`ebitdaValuation.${field}`, yearKey, yearValue);
      });
    } else if (section === "dcf") {
      updateBusinessProposal(`dcfValuation.${field}`, new Map());
      Object.entries(updatedFieldData).forEach(([yearKey, yearValue]) => {
        updateMap(`dcfValuation.${field}`, yearKey, yearValue);
      });
    }
  };
  const handleYearChange = (section, index, value) => {
    setHasChanges(true);

    // Update years array
    const updatedYears = [...valuationData[section].years];
    const oldYear = updatedYears[index]; // Store old year before updating
    updatedYears[index] = value;

    // Get all fields that need to be updated
    const fieldsToUpdate =
      section === "ebitda"
        ? ["revenue", "ebitda"]
        : ["revenue", "ebitda", "capex", "wcap_days"];

    // Create new state with updated years and cleared values for modified year
    setValuationData((prev) => {
      const newState = {
        ...prev,
        [section]: {
          ...prev[section],
          years: updatedYears,
        },
      };

      // Update each field's data, clearing values for the modified year
      fieldsToUpdate.forEach((field) => {
        const updatedFieldData = {};
        updatedYears.forEach((year, idx) => {
          if (year) {
            if (idx === index) {
              // Clear value for the modified year
              updatedFieldData[year] = "";
            } else {
              // Keep existing values for unmodified years
              const yearAtThisIndex = prev[section].years[idx];
              if (yearAtThisIndex && prev[section][field]?.[yearAtThisIndex]) {
                updatedFieldData[year] = prev[section][field][yearAtThisIndex];
              }
            }
          }
        });
        newState[section][field] = updatedFieldData;

        // Update context
        if (section === "ebitda") {
          updateBusinessProposal(
            `ebitdaValuation.${field}`,
            new Map(Object.entries(updatedFieldData))
          );
        } else {
          updateBusinessProposal(
            `dcfValuation.${field}`,
            new Map(Object.entries(updatedFieldData))
          );
        }
      });

      return newState;
    });
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const section = activeTab;

      const processValues = (values, years) => {
        const processedValues = {};
        years.forEach((year, index) => {
          if (year && values[year]) {
            processedValues[year] = parseFloat(values[year]) || 0;
          }
        });
        return processedValues;
      };

      const updatePayload = {
        proposalId,
        businessType,
        valuationType: section,
        ...(section === "ebitda"
          ? {
              revenue: processValues(
                valuationData.ebitda.revenue,
                valuationData.ebitda.years
              ),
              ebitda: processValues(
                valuationData.ebitda.ebitda,
                valuationData.ebitda.years
              ),
              grossDebt: parseFloat(valuationData.ebitda.grossDebt) || 0,
              capitalEmployed:
                parseFloat(valuationData.ebitda.capitalEmployed) || 0,
            }
          : {
              revenue: processValues(
                valuationData.dcf.revenue,
                valuationData.dcf.years
              ),
              ebitda: processValues(
                valuationData.dcf.ebitda,
                valuationData.dcf.years
              ),
              capex: processValues(
                valuationData.dcf.capex,
                valuationData.dcf.years
              ),
              wcap_days: processValues(
                valuationData.dcf.wcap_days,
                valuationData.dcf.years
              ),
              perpetualGrowthRate:
                parseFloat(valuationData.dcf.perpetualGrowthRate) || 0,
              wcap: parseFloat(valuationData.dcf.wcap) || 0,
              grossDebt: parseFloat(valuationData.dcf.grossDebt) || 0,
              capitalEmployed:
                parseFloat(valuationData.dcf.capitalEmployed) || 0,
            }),
      };

      await valuationApi.updateValuation(updatePayload);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving data:", error);
      setError("Failed to save data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleStepClick = (stepId) => {
    // Add navigation logic here if needed
    setCurrentStep(stepId);
  };

  const handleGenerateValuation = async () => {
    try {
      setIsLoading(true);
      setError("");
      const section = activeTab;

      const processValues = (values) => {
        const processedValues = {};
        Object.entries(values).forEach(([key, value]) => {
          const baseYear = key.split("_")[0];
          processedValues[baseYear] = parseFloat(value) || 0;
        });
        return processedValues;
      };

      // Prepare the valuation payload
      const valuationPayload = {
        proposalId,
        businessType,
        valuationType: section,
        ...(section === "ebitda"
          ? {
              revenue: processValues(valuationData.ebitda.revenue),
              ebitda: processValues(valuationData.ebitda.ebitda),
              grossDebt: parseFloat(valuationData.ebitda.grossDebt) || 0,
              capitalEmployed:
                parseFloat(valuationData.ebitda.capitalEmployed) || 0,
            }
          : {
              revenue: processValues(valuationData.dcf.revenue),
              ebitda: processValues(valuationData.dcf.ebitda),
              capex: processValues(valuationData.dcf.capex),
              wcap_days: processValues(valuationData.dcf.wcap_days),
              perpetualGrowthRate: 0.05, // 5% default
              wcap: parseFloat(valuationData.dcf.wcap) || 0,
              grossDebt: parseFloat(valuationData.dcf.grossDebt) || 0,
              capitalEmployed:
                parseFloat(valuationData.dcf.capitalEmployed) || 0,
            }),
      };

      const response = await valuationApi.updateValuation(valuationPayload);

      if (response.status && response.data) {
        const valuation =
          section === "ebitda"
            ? response.data.ebitdaValuation?.valuation
            : response.data.dcfValuation?.valuation;

        const rating =
          section === "ebitda"
            ? response.data.ebitdaValuation?.rating
            : response.data.dcfValuation?.rating;

        setValuationResult({
          amount: valuation,
          rating: rating || "AA+",
        });

        // Update context
        if (section === "ebitda") {
          updateBusinessProposal("ebitdaValuation.valuation", valuation);
          updateBusinessProposal("ebitdaValuation.rating", rating);
        } else {
          updateBusinessProposal("dcfValuation.valuation", valuation);
          updateBusinessProposal("dcfValuation.rating", rating);
        }
      }
    } catch (error) {
      console.error("Valuation Generation Error:", error);
      setError(
        error.message || "Failed to generate valuation. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };
  // 4. Add useEffect to monitor changes in valuationData
  useEffect(() => {
    console.log("Current Valuation Data:", valuationData);
  }, [valuationData]);

  // 5. Add useEffect to monitor changes in activeTab
  useEffect(() => {
    console.log("Active Tab Changed:", activeTab);
    console.log("Current Business Type:", businessType);
  }, [activeTab, businessType]);

  // 6. Add logging for when editing state changes
  // useEffect(() => {
  //   console.log("Editing State Changed:", isEditing);
  // }, [isEditing]);

  useEffect(() => {
    console.log("Initial Context Data:", businessProposal); // Check initial context state
    if (businessProposal) {
      // Initialize EBITDA valuation data
      const ebitdaData = {
        revenue: Object.fromEntries(businessProposal.ebitdaValuation.revenue),
        ebitda: Object.fromEntries(businessProposal.ebitdaValuation.ebitda),
        grossDebt: businessProposal.ebitdaValuation.grossDebt || "",
      };
      console.log("Initialized EBITDA Data:", ebitdaData); // Check EBITDA data initialization

      // Initialize DCF valuation data
      const dcfData = {
        revenue: Object.fromEntries(businessProposal.dcfValuation.revenue),
        ebitda: Object.fromEntries(businessProposal.dcfValuation.ebitda),
        capex: Object.fromEntries(businessProposal.dcfValuation.capex),
        perpetualGrowthRate:
          businessProposal.dcfValuation.perpetualGrowthRate || "",
        wcap: businessProposal.dcfValuation.wcap || "",
        grossDebt: businessProposal.dcfValuation.grossDebt || "",
      };
      console.log("Initialized DCF Data:", dcfData); // Check DCF data initialization

      // Set local state with context data
      setValuationData((prev) => ({
        ...prev,
        ebitda: {
          ...prev.ebitda,
          ...ebitdaData,
        },
        dcf: {
          ...prev.dcf,
          ...dcfData,
        },
      }));

      // Set valuation result if available
      if (
        activeTab === "ebitda" &&
        businessProposal.ebitdaValuation.valuation
      ) {
        setValuationResult({
          amount: businessProposal.ebitdaValuation.valuation,
          rating: businessProposal.ebitdaValuation.rating,
        });
      } else if (
        activeTab === "dcf" &&
        businessProposal.dcfValuation.valuation
      ) {
        setValuationResult({
          amount: businessProposal.dcfValuation.valuation,
          rating: businessProposal.dcfValuation.rating,
        });
      }
    }
  }, [businessProposal, activeTab]);

  // const handleProceed = async () => {
  //   try {
  //     setIsLoading(true);
  //     setError("");

  //     const section = activeTab;
  //     // Prepare update payload
  //     const updatePayload = {
  //       proposalId,
  //       businessType,
  //       valuationType: section,
  //       ...(section === "ebitda"
  //         ? {
  //             revenue: valuationData.ebitda.revenue,
  //             ebitda: valuationData.ebitda.ebitda,
  //             grossDebt: parseFloat(valuationData.ebitda.grossDebt) || 0,
  //             capitalEmployed:
  //               parseFloat(valuationData.ebitda.capitalEmployed) || "0",
  //           }
  //         : {
  //             revenue: valuationData.dcf.revenue,
  //             ebitda: valuationData.dcf.ebitda,
  //             capex: valuationData.dcf.capex,
  //             perpetualGrowthRate:
  //               parseFloat(valuationData.dcf.perpetualGrowthRate) || 0,
  //             wcap: parseFloat(valuationData.dcf.wcap) || 0,
  //             grossDebt: parseFloat(valuationData.dcf.grossDebt) || 0,
  //             capitalEmployed:
  //               parseFloat(valuationData.dcf.capitalEmployed) || "0",
  //           }),
  //     };

  //     // Update valuation in backend
  //     await valuationApi.updateValuation(updatePayload);

  //     // Update context
  //     updateBusinessProposal("businessType", businessType);
  //     updateBusinessProposal("valuationType", section);

  //     if (section === "dcf" || businessType === "startup") {
  //       Object.entries(valuationData.dcf.revenue).forEach(([year, value]) => {
  //         updateMap("dcfValuation.revenue", year, value);
  //       });
  //       Object.entries(valuationData.dcf.ebitda).forEach(([year, value]) => {
  //         updateMap("dcfValuation.ebitda", year, value);
  //       });
  //       Object.entries(valuationData.dcf.capex).forEach(([year, value]) => {
  //         updateMap("dcfValuation.capex", year, value);
  //       });

  //       updateBusinessProposal(
  //         "dcfValuation.perpetualGrowthRate",
  //         parseFloat(valuationData.dcf.perpetualGrowthRate) || 0
  //       );
  //       updateBusinessProposal(
  //         "dcfValuation.wcap",
  //         parseFloat(valuationData.dcf.wcap) || 0
  //       );
  //       updateBusinessProposal(
  //         "dcfValuation.grossDebt",
  //         parseFloat(valuationData.dcf.grossDebt) || 0
  //       );
  //       updateBusinessProposal(
  //         "dcfValuation.valuation",
  //         valuationResult.amount
  //       );
  //       updateBusinessProposal("dcfValuation.rating", valuationResult.rating);
  //       updateBusinessProposal(
  //         "dcfValuation.capitalEmployed",
  //         parseFloat(valuationData.dcf.capitalEmployed) || "0"
  //       );
  //     }

  //     if (section === "ebitda" && businessType === "established") {
  //       Object.entries(valuationData.ebitda.revenue).forEach(
  //         ([year, value]) => {
  //           updateMap("ebitdaValuation.revenue", year, value);
  //         }
  //       );
  //       Object.entries(valuationData.ebitda.ebitda).forEach(([year, value]) => {
  //         updateMap("ebitdaValuation.ebitda", year, value);
  //       });

  //       updateBusinessProposal(
  //         "ebitdaValuation.grossDebt",
  //         parseFloat(valuationData.ebitda.grossDebt) || 0
  //       );
  //       updateBusinessProposal(
  //         "ebitdaValuation.valuation",
  //         valuationResult.amount
  //       );
  //       updateBusinessProposal(
  //         "ebitdaValuation.rating",
  //         valuationResult.rating
  //       );
  //       updateBusinessProposal(
  //         "ebitdaValuation.capitalEmployed",
  //         parseFloat(valuationData.ebitda.capitalEmployed) || "0"
  //       );
  //     }

  //     // Navigate to next page with all necessary data
  //     navigate("/create-proposal", {
  //       state: {
  //         proposalId,
  //         businessType,
  //         valuationType: section,
  //         valuation: valuationResult.amount,
  //         rating: valuationResult.rating,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error during proceed:", error);
  //     setError("Failed to save valuation data. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleProceed = async () => {
    try {
      setIsLoading(true);
      setError("");
      const section = activeTab;

      // Check payment status
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/business-proposal/get-proposal/${proposalId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      const paymentComplete = data.data?.paymentStatus?.isComplete;
      const advisorType = data.data?.advisorDetails?.type;

      // Handle valuation data update if it exists
      if (valuationResult.amount) {
        const updatePayload = {
          proposalId,
          businessType,
          valuationType: section,
          ...(section === "ebitda"
            ? {
                revenue: valuationData.ebitda.revenue,
                ebitda: valuationData.ebitda.ebitda,
                grossDebt: parseFloat(valuationData.ebitda.grossDebt) || 0,
                capitalEmployed:
                  parseFloat(valuationData.ebitda.capitalEmployed) || "0",
              }
            : {
                revenue: valuationData.dcf.revenue,
                ebitda: valuationData.dcf.ebitda,
                capex: valuationData.dcf.capex,
                wcap_days: valuationData.dcf.wcap_days,
                perpetualGrowthRate:
                  parseFloat(valuationData.dcf.perpetualGrowthRate) || 0,
                wcap: parseFloat(valuationData.dcf.wcap) || 0,
                grossDebt: parseFloat(valuationData.dcf.grossDebt) || 0,
                capitalEmployed:
                  parseFloat(valuationData.dcf.capitalEmployed) || "0",
              }),
        };

        await valuationApi.updateValuation(updatePayload);

        // Update context with valuation data
        updateBusinessProposal("businessType", businessType);
        updateBusinessProposal("valuationType", section);

        if (section === "dcf" || businessType === "startup") {
          Object.entries(valuationData.dcf.revenue).forEach(([year, value]) => {
            updateMap("dcfValuation.revenue", year, value);
          });
          Object.entries(valuationData.dcf.ebitda).forEach(([year, value]) => {
            updateMap("dcfValuation.ebitda", year, value);
          });
          Object.entries(valuationData.dcf.capex).forEach(([year, value]) => {
            updateMap("dcfValuation.capex", year, value);
          });

          updateBusinessProposal(
            "dcfValuation.perpetualGrowthRate",
            parseFloat(valuationData.dcf.perpetualGrowthRate) || 0
          );
          updateBusinessProposal(
            "dcfValuation.wcap",
            parseFloat(valuationData.dcf.wcap) || 0
          );
          updateBusinessProposal(
            "dcfValuation.grossDebt",
            parseFloat(valuationData.dcf.grossDebt) || 0
          );
          updateBusinessProposal(
            "dcfValuation.valuation",
            valuationResult.amount
          );
          updateBusinessProposal("dcfValuation.rating", valuationResult.rating);
          updateBusinessProposal(
            "dcfValuation.capitalEmployed",
            parseFloat(valuationData.dcf.capitalEmployed) || "0"
          );
        }

        if (section === "ebitda" && businessType === "established") {
          Object.entries(valuationData.ebitda.revenue).forEach(
            ([year, value]) => {
              updateMap("ebitdaValuation.revenue", year, value);
            }
          );
          Object.entries(valuationData.ebitda.ebitda).forEach(
            ([year, value]) => {
              updateMap("ebitdaValuation.ebitda", year, value);
            }
          );

          updateBusinessProposal(
            "ebitdaValuation.grossDebt",
            parseFloat(valuationData.ebitda.grossDebt) || 0
          );
          updateBusinessProposal(
            "ebitdaValuation.valuation",
            valuationResult.amount
          );
          updateBusinessProposal(
            "ebitdaValuation.rating",
            valuationResult.rating
          );
          updateBusinessProposal(
            "ebitdaValuation.capitalEmployed",
            parseFloat(valuationData.ebitda.capitalEmployed) || "0"
          );
        }
      }

      const navigationState = {
        proposalId,
        businessType,
        valuationType: section,
        valuation: valuationResult.amount || null,
        rating: valuationResult.rating || null,
      };

      // If payment is already complete or it's self-service, go directly to pitch deck
      if (paymentComplete || advisorType === "self") {
        navigate("/pitchdeck", { state: navigationState });
        return;
      }

      // If payment is not complete and it's advisor type, go to create-proposal
      navigate("/create-proposal", { state: navigationState });
    } catch (error) {
      console.error("Error during proceed:", error);
      setError("Failed to proceed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  if (!initializationStatus.initialized || isFetching) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  // In BusinessValuation.jsx
  // Add this effect to properly initialize the component with context data
  return (
    <div>
      <Navbar />
      <Navigation currentStep={2} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[900px] mx-auto">
          {/* Title aligned with container */}
          <div className="flex items-center gap-2 mb-8">
            <h2 className="text-xl font-semibold">2. Business Valuation</h2>
            <span className="text-sm text-gray-500">
              (Provide relevant inputs to get an estimated value of your current
              business)
            </span>
          </div>

          {/* Main content container */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Business Type Selector */}
            <div className="flex flex-col items-center mb-8">
              <div className="inline-flex rounded overflow-hidden border">
                <button
                  className={`px-6 py-2 w-[300px] transition-colors duration-200 ${
                    businessType === "established"
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-gray-600"
                  }`}
                  onClick={() => {
                    setBusinessType("established");
                    setActiveTab("ebitda");
                  }}
                >
                  ESTABLISHED BUSINESS
                </button>
                <button
                  className={`px-6 py-2 w-[300px] transition-colors duration-200 ${
                    businessType === "startup"
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-gray-600"
                  }`}
                  onClick={() => {
                    setActiveTab("dcf");
                    setBusinessType("startup");
                    setTimeout(() => {
                      setBusinessType("startup");
                      setActiveTab("dcf");
                    }, 0);
                  }}
                >
                  STARTUPS
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm text-gray-500">
                  (Are you an established business generating regular revenue or
                  a Startup with revenue to start?)
                </span>
              </div>
            </div>
            {businessType === "established" && (
              <div className="flex flex-col items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button
                      className={`px-6 py-2 rounded transition-colors duration-200 ${
                        activeTab === "ebitda"
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-800"
                      }`}
                      onClick={() => setActiveTab("ebitda")}
                    >
                      EBITDA BASED
                    </button>
                    <button
                      className={`px-6 py-2 rounded transition-colors duration-200 ${
                        activeTab === "dcf"
                          ? "bg-green-600 text-white"
                          : "bg-green-100 text-green-800"
                      }`}
                      onClick={() => setActiveTab("dcf")}
                    >
                      DCF BASED
                    </button>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-500">
                    (If you are an established business, do you wish to value
                    your business based on current profitability or projected
                    profitability? Suggestion: If you have no reliable
                    projections to make, please use "EBITDA based valuation")
                  </span>
                </div>
                {/* <div className="flex-1 flex justify-end">
                  <button
                    className="p-2 rounded hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Pencil
                      className={`w-5 h-5 ${
                        isEditing ? "text-green-600" : "text-gray-600"
                      }`}
                    />
                  </button>
                </div> */}
              </div>
            )}
            {businessType === "startup" && (
              <div className="flex flex-col items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button
                      className="px-6 py-2 rounded bg-green-600 text-white"
                      disabled
                    >
                      DCF BASED
                    </button>
                  </div>
                </div>
                {/* <div className="flex-1 flex justify-end mt-4">
                  <button
                    className="p-2 rounded hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Pencil
                      className={`w-5 h-5 ${
                        isEditing ? "text-green-600" : "text-gray-600"
                      }`}
                    />
                  </button>
                </div> */}
              </div>
            )}

            {activeTab === "ebitda" && businessType === "established" && (
              <div className="space-y-6">
                <div className="flex flex-col mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Revenue (3Y) + 1Y
                    </span>
                    <span className="text-sm text-gray-500">
                      (Enter last 3 years reported revenue and estimated revenue
                      for ongoing year)
                    </span>
                  </div>
                  <ValuationInput
                    // label="Revenue (3Y) + 1Y"
                    years={valuationData.ebitda.years}
                    values={valuationData.ebitda.revenue}
                    onValueChange={(year, value) =>
                      handleValueChange("ebitda", "revenue", year, value)
                    }
                    onYearChange={(index, value) =>
                      handleYearChange("ebitda", index, value)
                    }
                    // disabled={!isEditing}
                    showLabel={false} // Add this
                  />
                </div>
                <div className="flex flex-col mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      EBITDA (3Y) + 1Y
                    </span>
                    <span className="text-sm text-gray-500">
                      (Enter last 3 years reported EBITDA (or) Operating profit
                      and estimated value for ongoing year)
                    </span>
                  </div>
                  <ValuationInput
                    // label="EBITDA (3Y) + 1Y"
                    years={valuationData.ebitda.years}
                    values={valuationData.ebitda.ebitda}
                    onValueChange={(year, value) =>
                      handleValueChange("ebitda", "ebitda", year, value)
                    }
                    onYearChange={(index, value) =>
                      handleYearChange("ebitda", index, value)
                    }
                    // disabled={!isEditing}
                    showLabel={false}
                    yearReadOnly={true} // Add this
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 mt-6">
              {(activeTab === "dcf" || businessType === "startup") && (
                <div className="space-y-6">
                  <div className="flex flex-col mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Revenue + 5Y</span>
                      <span className="text-sm text-gray-500">
                        (Projected revenue for next 5 years)
                      </span>
                    </div>
                    <ValuationInput
                      // label="Revenue + 5Y"
                      years={valuationData.dcf.years}
                      values={valuationData.dcf.revenue}
                      onValueChange={(year, value) =>
                        handleValueChange("dcf", "revenue", year, value)
                      }
                      onYearChange={(index, value) =>
                        handleYearChange("dcf", index, value)
                      }
                      valuationType="dcf" // Add this line
                    />
                  </div>
                  <div className="flex flex-col mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">EBITDA + 5Y</span>
                      <span className="text-sm text-gray-500">
                        (Projected EBITDA for next 5 years)
                      </span>
                    </div>
                    <ValuationInput
                      // label="EBITDA + 5Y"
                      years={valuationData.dcf.years}
                      values={valuationData.dcf.ebitda}
                      onValueChange={(year, value) =>
                        handleValueChange("dcf", "ebitda", year, value)
                      }
                      onYearChange={(index, value) =>
                        handleYearChange("dcf", index, value)
                      }
                      valuationType="dcf" // Add this line
                      yearReadOnly={true} // Add this line
                    />
                  </div>
                  <div className="flex flex-col mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Capex</span>
                      <span className="text-sm text-gray-500">
                        (Projected capital expenditure for next 5 years)
                      </span>
                    </div>
                    <ValuationInput
                      // label="Capex"
                      years={valuationData.dcf.years}
                      values={valuationData.dcf.capex}
                      onValueChange={(year, value) =>
                        handleValueChange("dcf", "capex", year, value)
                      }
                      onYearChange={(index, value) =>
                        handleYearChange("dcf", index, value)
                      }
                      valuationType="dcf" // Add this line
                    />
                  </div>
                  <div className="flex flex-col mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Working Capital Days
                      </span>
                      <span className="text-sm text-gray-500">
                        (Projected working capital days for next 5 years)
                      </span>
                    </div>
                    <ValuationInput
                      years={valuationData.dcf.years}
                      values={valuationData.dcf.wcap_days}
                      onValueChange={(year, value) =>
                        handleValueChange("dcf", "wcap_days", year, value)
                      }
                      onYearChange={(index, value) =>
                        handleYearChange("dcf", index, value)
                      }
                      valuationType="dcf"
                      yearReadOnly={true}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-40 text-left">
                  Gross Debt / Cash:
                  <span className="block text-xs text-gray-500">
                    (Provide the current value of external loans/debt (net of
                    cash / bank balances). If no debt exists, enter cash/bank
                    balances in minus)
                  </span>
                </span>
                <div className="flex items-center gap-4 w-[300px]">
                  <input
                    type="text"
                    value={valuationData[activeTab].grossDebt}
                    onChange={(e) =>
                      handleValueChange(
                        activeTab,
                        "grossDebt",
                        null,
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded text-sm "
                    placeholder="INR 250,000"
                  />

                  <div className="relative group">
                    {/* <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-black text-white p-2 rounded text-sm w-48 z-10">
                      Provide the current value of external loans/debt (net of
                      cash / bank balances)<br></br>
                      If no debt exists, enter cash/bank balances in minus.
                    </div> */}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-40 text-left">
                  Capital Employed:
                  <span className="block text-xs text-gray-500">
                    (Provide the value of Capital Employed in business -
                    Shareholders Capital/Reserves + External Loans)
                  </span>
                </span>
                <div className="flex items-center gap-4 w-[300px]">
                  <input
                    type="text"
                    value={valuationData[activeTab].capitalEmployed}
                    onChange={(e) =>
                      handleValueChange(
                        activeTab,
                        "capitalEmployed",
                        null,
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded text-sm"
                    placeholder="INR 1,000,000"
                  />
                  <div className="relative group">
                    {/* <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                    <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-black text-white p-2 rounded text-sm w-48 z-10">
                      Provide the value of Capital Employed in business
                      (Shareholders Capital/Reserves + External Loans)
                    </div> */}
                  </div>
                </div>
              </div>
            </div>

            {/* {isEditing && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors duration-200"
                >
                  Save
                </button>
              </div>
            )} */}

            {hasChanges && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors duration-200"
                >
                  Save
                </button>
              </div>
            )}

            {/* Generate Valuation Button */}
            <div className="flex justify-center mt-8 mb-8">
              <button
                onClick={handleGenerateValuation}
                className="px-8 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800 transition-colors duration-200"
              >
                GENERATE VALUATION
              </button>
            </div>

            {/* Valuation Results Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-24">Valuation:</span>
                <div className="flex-1 flex items-center gap-4">
                  <input
                    type="text"
                    value={
                      valuationResult.amount
                        ? `₹ ${valuationResult.amount.toLocaleString()}`
                        : ""
                    }
                    className="w-[300px] p-2 border rounded text-sm bg-gray-50"
                    placeholder="INR 10,00,000"
                    readOnly
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Feel that it's too less?
                    </span>
                    <button
                      onClick={() => setIsModalOpen(true)} // Add this onClick handler
                      className="px-4 py-2 bg-green-700 text-white rounded text-sm hover:bg-green-800 transition-colors duration-200"
                    >
                      IMPROVE VALUATION
                    </button>
                  </div>
                </div>
              </div>

              <ImproveValuationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              />

              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-24">Rating:</span>
                <input
                  type="text"
                  value={valuationResult.rating}
                  className="w-[300px] p-2 border rounded text-sm bg-gray-50"
                  placeholder="AA+"
                  readOnly
                />
              </div>
            </div>
            {/* Add loading state indicator */}
            {isLoading && (
              <div className="text-center mt-4">
                <p className="text-gray-600">Generating valuation...</p>
              </div>
            )}

            {/* Add error message display */}
            {error && (
              <div className="text-red-600 text-center mt-4">{error}</div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleProceed}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors text-sm"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessValuation;
