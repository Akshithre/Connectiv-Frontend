import React, { useState, useEffect } from "react";
import { Info, Upload, File, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import { uploadToS3 } from "../../utils/s3Utils";
import Navbar from "../../components/pages/Navbar";
import { pitchDeckApi } from "../../services/pitchDeckApi1";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProgressSteps from './BusinessValuation/Navigation';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const InfoTooltip = ({ text }) => (
  <div className="inline-flex items-center ml-1">
    <div className="group relative inline-block">
      <Info className="w-4 h-4 text-gray-400 cursor-help" />
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-50 w-64 p-2.5 text-sm text-white bg-gray-800 rounded-lg -translate-x-1/2 left-1/2 bottom-full mb-2">
        {text}
        <div className="absolute w-2 h-2 bg-gray-800 rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
      </div>
    </div>
  </div>
);

const PitchDeck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userDetails } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [errors, setErrors] = useState({
    proposalName: false,
    businessDescription: false,
    productsServices: false,
    proposalDescription: false,
    proposalType: false,
    currentValuation: false,
    currentShares: false,
    fundingRequired: false,
    plannedExitPercentage: false,
    // pitchDocument: false,
    // teaserDocument: false,
  });

  const [formData, setFormData] = useState({
    proposalNumber: "P1",
    proposalVersion: "P1/A",
    proposalName: "",
    businessDescription: "",
    productsServices: "",
    proposalDescription: "",
    proposalType: "",
    currentValuation: 0,
    currentShares: 0,
    fundingRequired: 0,
    plannedExitPercentage: 100,
    pitchDocument: null,
    teaserDocument: null,
    documents_proposal: [],
    isNewVersion: false,
  });

  const [calculations, setCalculations] = useState({
    preMoney: {
      valuation: 0,
      sharePrice: 0,
      existingShares: 0,
      ownershipExisting: 100,
    },
    postMoney: {
      valuation: 0,
      newFunds: 0,
      newEquityValue: 0,
      sharePrice: 0,
      existingShares: 0,
      newShares: 0,
      totalShares: 0,
      ownershipExisting: 0,
      ownershipNew: 0,
    },
    exit: {
      exitValue: 0,
      ownershipExisting: 0,
      ownershipNew: 0,
    },
    ownershipStatus: {
      existing: {
        before: 100,
        after: 100,
      },
      new: {
        before: 0,
        after: 0,
      },
    },
  });

  const areFormDatasEqual = (data1, data2) => {
    const cleanData = (data) => {
      const cleaned = { ...data };
      Object.keys(cleaned).forEach((key) => {
        if (cleaned[key] === null || cleaned[key] === undefined) {
          cleaned[key] = "";
        } else if (typeof cleaned[key] === "number") {
          cleaned[key] = cleaned[key].toString();
        } else if (Array.isArray(cleaned[key])) {
          cleaned[key] = JSON.stringify(cleaned[key]);
        }
      });
      return cleaned;
    };

    const cleanData1 = cleanData(data1);
    const cleanData2 = cleanData(data2);

    return JSON.stringify(cleanData1) === JSON.stringify(cleanData2);
  };

  const validateForm = () => {
    const newErrors = {
      proposalName: !formData.proposalName.trim(),
      businessDescription: !formData.businessDescription.trim(),
      productsServices: !formData.productsServices.trim(),
      proposalDescription: !formData.proposalDescription.trim(),
      proposalType: !formData.proposalType,
      currentValuation: formData.currentValuation <= 0,
      currentShares: formData.currentShares <= 0,
      fundingRequired:
        formData.proposalType === "Equity Funding" &&
        formData.fundingRequired <= 0,
      plannedExitPercentage:
        formData.proposalType === "Partial" &&
        (formData.plannedExitPercentage <= 0 ||
          formData.plannedExitPercentage > 100),
      // pitchDocument: !formData.pitchDocument,
      // teaserDocument: !formData.teaserDocument,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };
  // Add this function at the top of your component after the initial states
  const autoResizeTextArea = (element) => {
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  // Add this useEffect to handle initial textarea sizes
  useEffect(() => {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((textarea) => {
      autoResizeTextArea(textarea);
    });
  }, [
    formData.businessDescription,
    formData.productsServices,
    formData.proposalDescription,
  ]);

  useEffect(() => {
    calculateValues();
  }, [formData]);

  useEffect(() => {
    if (initialFormData) {
      const hasChanges = !areFormDatasEqual(initialFormData, formData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, initialFormData]);

  // Update the useEffect that fetches data
  useEffect(() => {
    const proposalId = location.state?.proposalId;
    if (proposalId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `${API_BASE_URL}/api/business-proposal/get-proposal/${proposalId}`
          );
          const data = await response.json();
  
          if (data.status && data.data) {
            const businessProposal = data.data;
            const currentProposal = businessProposal.proposals?.find(
              (p) => p.proposalNumber === location.state?.proposalNumber
            );
            const currentVersion = currentProposal?.versions?.find(
              (v) => v.versionNumber === location.state?.versionNumber
            );
  
            // Make sure all form fields have default values
            const newFormData = {
              proposalNumber: currentProposal?.proposalNumber || "P1",
              proposalVersion: currentVersion 
                ? `${currentProposal.proposalNumber}/${currentVersion.versionNumber}`
                : "P1/A",
              proposalName: currentVersion?.proposalName || "",
              businessDescription: currentVersion?.businessDesc || businessProposal.shortBusinessDesc || "",
              productsServices: currentVersion?.products || businessProposal.keyProducts || "",
              proposalDescription: currentVersion?.proposalDesc || "",
              proposalType: currentVersion?.proposalType || "",
              currentValuation: parseFloat(currentVersion?.currentValuation) || 0,
              currentShares: parseFloat(currentVersion?.currentShares) || 0,
              fundingRequired: parseFloat(
                currentVersion?.equityFundingDetails?.fundingReq?.value
              ) || 0,
              plannedExitPercentage: parseFloat(
                currentVersion?.partialExitDetails?.plannedExit
              ) || 100,
              pitchDocument: currentVersion?.documents_proposal?.[0]
                ? {
                    name: currentVersion.documents_proposal[0].file.split("/").pop(),
                    type: "document",
                    file: currentVersion.documents_proposal[0].file,
                  }
                : null,
              teaserDocument: currentVersion?.documents_proposal?.find(
                (doc) => doc.type === "teaser"
              )
                ? {
                    name: currentVersion.documents_proposal
                      .find((doc) => doc.type === "teaser")
                      .file.split("/")
                      .pop(),
                    type: "document",
                    file: currentVersion.documents_proposal.find(
                      (doc) => doc.type === "teaser"
                    ).file,
                  }
                : null,
              documents_proposal: currentVersion?.documents_proposal || [],
              isNewVersion: false,
            };
  
            setFormData(newFormData);
            setInitialFormData(JSON.parse(JSON.stringify(newFormData)));
            setHasUnsavedChanges(false);
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setError(err.message || "Failed to fetch proposal data");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [location.state?.proposalId]);

  const calculateValues = () => {
    if (formData.proposalType === "Equity Funding") {
      const sharePrice = formData.currentShares
        ? formData.currentValuation / formData.currentShares
        : 0;

      const preMoney = {
        valuation: formData.currentValuation,
        sharePrice: sharePrice,
        existingShares: formData.currentShares,
        ownershipExisting: 100,
      };

      const newShares = sharePrice ? formData.fundingRequired / sharePrice : 0;
      const totalShares = formData.currentShares + newShares;

      const ownershipExisting = totalShares
        ? (formData.currentShares / totalShares) * 100
        : 0;
      const ownershipNew = totalShares ? (newShares / totalShares) * 100 : 0;

      setCalculations({
        ...calculations,
        preMoney,
        postMoney: {
          valuation: formData.currentValuation,
          newFunds: formData.fundingRequired,
          newEquityValue: formData.currentValuation + formData.fundingRequired,
          sharePrice: sharePrice,
          existingShares: formData.currentShares,
          newShares: newShares,
          totalShares: totalShares,
          ownershipExisting: ownershipExisting,
          ownershipNew: ownershipNew,
        },
        ownershipStatus: {
          existing: {
            before: 100,
            after: ownershipExisting,
          },
          new: {
            before: 0,
            after: ownershipNew,
          },
        },
      });
    } else if (
      formData.proposalType === "Partial" ||
      formData.proposalType === "Full"
    ) {
      const exitPercentage =
        formData.proposalType === "Full" ? 100 : formData.plannedExitPercentage;
      const exitValue = (formData.currentValuation * exitPercentage) / 100;
      const ownershipExisting = 100 - exitPercentage;
      const ownershipNew = exitPercentage;

      setCalculations({
        ...calculations,
        exit: {
          exitValue,
          ownershipExisting,
          ownershipNew,
        },
        ownershipStatus: {
          existing: {
            before: 100,
            after: ownershipExisting,
          },
          new: {
            before: 0,
            after: ownershipNew,
          },
        },
      });
    }
  };

  const handleNext = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation("next");
      setShowConfirmDialog(true);
      return;
    }
    navigateNext();
  };

  const navigateNext = () => {
    navigate("/find-investors", {
      state: {
        proposalId: location.state?.proposalId,
        shouldRefresh: true,
      },
    });
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation("cancel");
      setShowConfirmDialog(true);
      return;
    }
    navigateCancel();
  };

  const navigateCancel = () => {
    navigate("/home");
  };

  const handleConfirmNavigation = () => {
    setShowConfirmDialog(false);

    if (pendingNavigation === "next") {
      navigateNext();
    } else if (pendingNavigation === "cancel") {
      navigateCancel();
    }

    setFormData(initialFormData);
    setHasUnsavedChanges(false);
    setPendingNavigation(null);

    toast.info("Changes have been discarded");
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
    setPendingNavigation(null);
  };

  const handleNumericInput = (e, field) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(value) ? 0 : value, // Ensure value is never undefined
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  // const handleFileUpload = async (event) => {
  //   const file = event.target.files[0];

  //   if (!file) return;

  //   if (file.size > 8 * 1024 * 1024) {
  //     toast.error("File size exceeds 8MB limit");
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     const uploadResult = await uploadToS3(file);

  //     if (uploadResult.success) {
  //       // Update both the UI display and backend format
  //       setFormData((prev) => ({
  //         ...prev,
  //         pitchDocument: {
  //           name: file.name,
  //           type: file.type,
  //           file: uploadResult.url,
  //         },
  //         documents_proposal: [
  //           {
  //             type: "doc",
  //             file: uploadResult.url,
  //           },
  //         ],
  //       }));
  //       setErrors((prev) => ({
  //         ...prev,
  //         pitchDocument: false,
  //       }));
  //     } else {
  //       throw new Error("Failed to upload file");
  //     }
  //   } catch (err) {
  //     console.error("File upload error:", err);
  //     toast.error("Failed to upload file. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleTeaserUpload = async (event) => {
  //   const file = event.target.files[0];

  //   if (!file) return;

  //   if (file.size > 8 * 1024 * 1024) {
  //     toast.error("File size exceeds 8MB limit");
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     const uploadResult = await uploadToS3(file);

  //     if (uploadResult.success) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         teaserDocument: {
  //           name: file.name,
  //           type: file.type,
  //           file: uploadResult.url,
  //         },
  //         documents_proposal: [
  //           ...prev.documents_proposal,
  //           {
  //             type: "teaser",
  //             file: uploadResult.url,
  //           },
  //         ],
  //       }));
  //       setErrors((prev) => ({
  //         ...prev,
  //         teaserDocument: false,
  //       }));
  //     } else {
  //       throw new Error("Failed to upload file");
  //     }
  //   } catch (err) {
  //     console.error("File upload error:", err);
  //     toast.error("Failed to upload file. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateForm()) {
      setError("Please fill in all mandatory fields correctly");
      setIsLoading(false);
      return;
    }

    try {
      const proposalId = location.state?.proposalId;
      if (!proposalId) throw new Error("Proposal ID is required");

      const response = await fetch(
        `${API_BASE_URL}/api/business-proposal/get-proposal/${proposalId}`
      );
      const { data: currentProposal } = await response.json();

      let proposalNumber, versionNumber;

      if (!location.state?.proposalNumber) {
        const maxProposalNum = Math.max(
          ...currentProposal.proposals.map(
            (p) => parseInt(p.proposalNumber.replace("P", "")) || 0
          ),
          0
        );
        proposalNumber = `P${maxProposalNum + 1}`;
        versionNumber = "A";
      } else if (formData.isNewVersion) {
        proposalNumber = location.state.proposalNumber;
        const existingProposal = currentProposal.proposals.find(
          (p) => p.proposalNumber === proposalNumber
        );
        if (existingProposal?.versions?.length) {
          const lastVersion =
            existingProposal.versions[existingProposal.versions.length - 1];
          versionNumber = String.fromCharCode(
            lastVersion.versionNumber.charCodeAt(0) + 1
          );
        } else {
          versionNumber = "A";
        }
      } else {
        proposalNumber = location.state.proposalNumber;
        versionNumber = location.state.versionNumber;
      }
      let investmentOffer = "";
      if (formData.proposalType === "Equity Funding") {
        investmentOffer = ` INR ${formData.fundingRequired.toLocaleString()} for ${calculations.postMoney.ownershipNew.toFixed(2)}% share`;
      } else if (formData.proposalType === "Partial") {
        investmentOffer = `INR ${calculations.exit.exitValue.toLocaleString()} for ${formData.plannedExitPercentage}% share`;
      } else if (formData.proposalType === "Full") {
        investmentOffer = `INR ${calculations.exit.exitValue.toLocaleString()} for 100% share`;
      }
      const version = {
        versionNumber,
        proposalName: formData.proposalName,
        businessDesc: formData.businessDescription, // This will save the modified description
        products: formData.productsServices, // This will save the modified products
        proposalDesc: formData.proposalDescription,
        proposalType: formData.proposalType,
        currentValuation: formData.currentValuation.toString(),
        currentShares: formData.currentShares.toString(),
        documents_proposal: formData.documents_proposal, // Add this
        investment_offer: investmentOffer, 
        updatedAt: new Date().toISOString(),
        // pitchDocument: formData.pitchDocument,

        ...(formData.proposalType === "Equity Funding" && {
          equityFundingDetails: {
            fundingReq: {
              currencyType: "INR",
              value: formData.fundingRequired.toString(),
            },
          },
        }),

        ...(formData.proposalType === "Partial" && {
          partialExitDetails: {
            plannedExit: formData.plannedExitPercentage.toString(),
            exitValue: calculations.exit.exitValue.toString(),
          },
        }),

        ...(formData.proposalType === "Full" && {
          fullExitDetails: {
            exitValue: calculations.exit.exitValue.toString(),
          },
        }),
      };

      let proposals = [...currentProposal.proposals];
      const existingProposalIndex = proposals.findIndex(
        (p) => p.proposalNumber === proposalNumber
      );

      if (existingProposalIndex >= 0) {
        if (formData.isNewVersion) {
          proposals[existingProposalIndex].versions.push(version);
        } else {
          const versionIndex = proposals[
            existingProposalIndex
          ].versions.findIndex((v) => v.versionNumber === versionNumber);
          proposals[existingProposalIndex].versions[versionIndex] = version;
        }
      } else {
        proposals.push({
          proposalNumber,
          versions: [version],
        });
      }
      console.log("Sending data to backend:", {
        proposalId,
        proposals: proposals.map((p) => ({
          ...p,
          versions: p.versions.map((v) => ({
            ...v,
            documents_proposal: v.documents_proposal,
          })),
        })),
      });

      const saveResponse = await fetch(
        `${API_BASE_URL}/api/business-proposal/update-proposal`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proposalId, proposals }),
        }
      );

      if (!saveResponse.ok) throw new Error("Failed to save proposal");
      toast.success("Proposal saved successfully!");
      setInitialFormData(JSON.parse(JSON.stringify(formData)));
      setHasUnsavedChanges(false);
      toast.success("Proposal saved successfully!");
      // navigate('/home', { state: { shouldRefresh: true }});
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Failed to submit form");
      toast.error("Failed to save proposal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ProgressSteps 
        currentStep={3} 
        proposalId={location.state?.proposalId}
      />
        <div className="max-w-[900px] mx-auto px-6 py-8">
          <div className="flex items-baseline gap-2 mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">
              Create a Proposal
            </h1>
            <span className="text-sm text-gray-500">
              (Please provide relevant details to create an Investment Proposal
              for your business)
            </span>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Basic Information Section */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-lg font-medium text-gray-800">
                    Basic Information
                  </h2>
                  <InfoTooltip text="Provide basic details about your proposal" />
                </div>

                <div className="space-y-6 max-w-[700px]">
                  {/* Proposal Number and Version */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Proposal Number
                        <InfoTooltip text="This is an auto-generated number." />
                      </label>
                      <input
                        type="text"
                        value={formData.proposalNumber}
                        disabled
                        className="w-full h-10 px-3 bg-gray-50 border border-gray-400 rounded-md text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Proposal Version
                        <InfoTooltip text="This is an auto-generated number, for each of your proposal." />
                      </label>{" "}
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          value={formData.proposalVersion}
                          disabled
                          className="w-full h-10 px-3 bg-gray-50 border border-gray-400 rounded-md text-gray-500"
                        />
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.isNewVersion}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                isNewVersion: e.target.checked,
                              }))
                            }
                            className="rounded border-gray-400 text-blue-600"
                          />
                          <span className="text-sm text-gray-600 relative group">
                            Save as new version
                            <InfoTooltip
                              text="Check this box if you wish to save this edit as new version."
                              width="w-72"
                            />
                          </span>{" "}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Proposal Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Proposal Name <span className="text-red-500">*</span>
                      <InfoTooltip text="Give a short name that you can identify/associate easily. Eg Series A-1." />
                    </label>
                    <input
                      type="text"
                      value={formData.proposalName}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          proposalName: e.target.value,
                        }));
                        setErrors((prev) => ({ ...prev, proposalName: false }));
                      }}
                      className={`w-full h-10 px-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${
                          errors.proposalName
                            ? "border-red-500"
                            : "border-gray-400"
                        }`}
                      placeholder="Enter proposal name"
                    />
                    {errors.proposalName && (
                      <p className="text-red-500 text-xs mt-1">
                        This field is mandatory
                      </p>
                    )}
                  </div>

                  {/* Business Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Business Description{" "}
                      <span className="text-red-500">*</span>
                      <InfoTooltip text="This content is pulled from your business profile. You can modify it here for the proposal." />
                    </label>
                    <textarea
                      value={formData.businessDescription}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          businessDescription: e.target.value,
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          businessDescription: false,
                        }));
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${
                          errors.businessDescription
                            ? "border-red-500"
                            : "border-gray-400"
                        }`}
                      rows={3}
                    />
                    {errors.businessDescription && (
                      <p className="text-red-500 text-xs mt-1">
                        This field is mandatory
                      </p>
                    )}
                  </div>

                  {/* Products/Services */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Products/Services <span className="text-red-500">*</span>
                      <InfoTooltip text="This content is pulled from your business profile. You can modify it here for the proposal." />
                    </label>
                    <textarea
                      value={formData.productsServices}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          productsServices: e.target.value,
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          productsServices: false,
                        }));
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${
                          errors.productsServices
                            ? "border-red-500"
                            : "border-gray-400"
                        }`}
                      rows={3}
                    />
                    {errors.productsServices && (
                      <p className="text-red-500 text-xs mt-1">
                        This field is mandatory
                      </p>
                    )}
                  </div>

                  {/* Proposal Description */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Proposal Description{" "}
                      <span className="text-red-500">*</span>
                      <InfoTooltip
                        text="Give a detailed description of your proposal for investors to get some understanding."
                        width="w-96"
                      />
                    </label>
                    <textarea
                      value={formData.proposalDescription}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          proposalDescription: e.target.value,
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          proposalDescription: false,
                        }));
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${
                          errors.proposalDescription
                            ? "border-red-500"
                            : "border-gray-400"
                        }`}
                      rows={3}
                    />
                    {errors.proposalDescription && (
                      <p className="text-red-500 text-xs mt-1">
                        This field is mandatory
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Proposal Details Section */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-lg font-medium text-gray-800">
                    Proposal Details
                  </h2>
                  <InfoTooltip text="Select the type of proposal and provide relevant details" />
                </div>

                <div className="space-y-6 max-w-[700px]">
                  {/* Proposal Type */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Proposal Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.proposalType}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          proposalType: e.target.value,
                        }));
                        setErrors((prev) => ({ ...prev, proposalType: false }));
                      }}
                      className={`w-full max-w-[400px] h-10 px-3 border rounded-md
                        ${
                          errors.proposalType
                            ? "border-red-500"
                            : "border-gray-400"
                        }`}
                    >
                      <option value="">Select proposal type</option>
                      <option value="Equity Funding">
                        Equity Funding / New Shares Issued
                      </option>
                      <option value="Partial">
                        Offer for Sale / Partial Exit
                      </option>
                      <option value="Full">Offer for Sale / Full Exit</option>
                    </select>
                    {errors.proposalType && (
                      <p className="text-red-500 text-xs mt-1">
                        Please select a proposal type
                      </p>
                    )}
                  </div>

                  {/* Valuation and Shares */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Current Valuation (INR){" "}
                        <span className="text-red-500">*</span>
                        <InfoTooltip
                          text="Please use our 'Business Valuation' model to understand the current valuation of your business"
                          width="w-80"
                        />
                      </label>
                      <input
                        type="number"
                        value={formData.currentValuation || ""}
                        onChange={(e) => {
                          handleNumericInput(e, "currentValuation");
                          setErrors((prev) => ({
                            ...prev,
                            currentValuation: false,
                          }));
                        }}
                        onWheel={(e) => e.target.blur()} // Prevent mousewheel from changing value
                        className={`w-full h-10 px-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
    ${errors.currentValuation ? "border-red-500" : "border-gray-400"}`}
                      />
                      {errors.currentValuation && (
                        <p className="text-red-500 text-xs mt-1">
                          Please enter a valid valuation amount
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Current Shares <span className="text-red-500">*</span>
                        <InfoTooltip
                          text="Equity Shares currently issued and paid up. In case you are not a company, please enter as 100"
                          width="w-80"
                        />
                      </label>
                      <input
                        type="number"
                        value={formData.currentShares || ""}
                        onChange={(e) => {
                          handleNumericInput(e, "currentShares");
                          setErrors((prev) => ({
                            ...prev,
                            currentShares: false,
                          }));
                        }}
                        onWheel={(e) => e.target.blur()} // Prevent mousewheel from changing value
                        className={`w-full h-10 px-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
    ${errors.currentShares ? "border-red-500" : "border-gray-400"}`}
                      />
                      {errors.currentShares && (
                        <p className="text-red-500 text-xs mt-1">
                          Please enter the number of current shares
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Funding Details Section (Conditional) */}
              {formData.proposalType === "Equity Funding" && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-lg font-medium text-gray-800">
                      Funding Details
                    </h2>
                    <InfoTooltip text="Enter the funding amount required" />
                  </div>

                  <div className="space-y-6">
                    <div className="max-w-[400px]">
                      <label className="block text-sm font-medium mb-2">
                        Funding Required (INR){" "}
                        <span className="text-red-500">*</span>
                        <InfoTooltip
                          text="This is the new fund infusion you are expecting from the investor"
                          width="w-72"
                        />
                      </label>
                      <input
                        type="number"
                        value={formData.fundingRequired || ""}
                        onChange={(e) => {
                          handleNumericInput(e, "fundingRequired");
                          setErrors((prev) => ({
                            ...prev,
                            fundingRequired: false,
                          }));
                        }}
                        onWheel={(e) => e.target.blur()} // Prevent mousewheel from changing value
                        className={`w-full h-10 px-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
    ${errors.fundingRequired ? "border-red-500" : "border-gray-400"}`}
                      />
                      {errors.fundingRequired && (
                        <p className="text-red-500 text-xs mt-1">
                          Please enter the required funding amount
                        </p>
                      )}
                    </div>
                    <div className="max-w-[700px]">
                      {/* Calculations Table */}
                      <table className="w-full border-collapse bg-white text-sm">
                        <thead>
                          <tr>
                            <th className="border border-gray-400 px-4 h-10 text-left bg-gray-100 font-medium text-sm">
                              Details
                            </th>
                            <th className="border border-gray-400 px-4 h-10 text-right bg-gray-100 font-medium text-sm">
                              Pre Money
                            </th>
                            <th className="border border-gray-400 px-4 h-10 text-right bg-gray-100 font-medium text-sm">
                              Post Money
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-400 px-4 py-2">
                              Valuation
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              ₹
                              {calculations.preMoney.valuation.toLocaleString()}
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              ₹
                              {calculations.postMoney.valuation.toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-4 py-2">
                              New Funds
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              -
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              ₹
                              {calculations.postMoney.newFunds.toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-4 py-2">
                              New Equity Value
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              -
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              ₹
                              {calculations.postMoney.newEquityValue.toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-4 py-2">
                              Share Price
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              ₹{calculations.preMoney.sharePrice.toFixed(2)}
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              ₹{calculations.postMoney.sharePrice.toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-4 py-2">
                              Existing Shares
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              {calculations.preMoney.existingShares.toLocaleString()}
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              {calculations.postMoney.existingShares.toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-4 py-2">
                              New Shares
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              -
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              {Math.round(
                                calculations.postMoney.newShares
                              ).toLocaleString()}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-4 py-2">
                              Total Shares
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              {calculations.preMoney.existingShares.toLocaleString()}
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              {Math.round(
                                calculations.postMoney.totalShares
                              ).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Ownership Status Table */}
                      <div className="mt-6">
                        <table className="w-full border-collapse bg-white text-sm">
                          <thead>
                            <tr>
                              <th
                                className="border border-gray-400 px-4 h-10 text-left bg-gray-100 font-medium text-sm"
                                colSpan="3"
                              >
                                Ownership Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-400 px-4 py-2">
                                Existing
                              </td>
                              <td className="border border-gray-400 px-4 py-2 text-right">
                                {calculations.ownershipStatus.existing.before.toFixed(
                                  2
                                )}
                                %
                              </td>
                              <td className="border border-gray-400 px-4 py-2 text-right">
                                {calculations.ownershipStatus.existing.after.toFixed(
                                  2
                                )}
                                %
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-4 py-2">
                                New
                              </td>
                              <td className="border border-gray-400 px-4 py-2 text-right">
                                {calculations.ownershipStatus.new.before.toFixed(
                                  2
                                )}
                                %
                              </td>
                              <td className="border border-gray-400 px-4 py-2 text-right">
                                {calculations.ownershipStatus.new.after.toFixed(
                                  2
                                )}
                                %
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-4 py-2 font-medium">
                                Total
                              </td>
                              <td className="border border-gray-400 px-4 py-2 text-right font-medium">
                                100%
                              </td>
                              <td className="border border-gray-400 px-4 py-2 text-right font-medium">
                                100%
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Exit Details Section */}
              {(formData.proposalType === "Partial" ||
                formData.proposalType === "Full") && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-lg font-medium text-gray-800">
                      Exit Details
                    </h2>
                    <InfoTooltip text="Specify the exit percentage and review calculations" />
                  </div>

                  {formData.proposalType === "Partial" && (
                    <div className="max-w-[400px] mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Planned Exit Percentage{" "}
                        <span className="text-red-500">*</span>
                        <InfoTooltip
                          text="This is the percent of stake/shares you wish to offer for sale / exit. If full exit, the value would be 100%"
                          width="w-80"
                        />
                      </label>
                      <input
                        type="number"
                        value={formData.plannedExitPercentage || ""}
                        onChange={(e) => {
                          handleNumericInput(e, "plannedExitPercentage");
                          setErrors((prev) => ({
                            ...prev,
                            plannedExitPercentage: false,
                          }));
                        }}
                        min="0"
                        max="100"
                        className={`w-full h-10 px-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${
                            errors.plannedExitPercentage
                              ? "border-red-500"
                              : "border-gray-400"
                          }`}
                      />
                      {errors.plannedExitPercentage && (
                        <p className="text-red-500 text-xs mt-1">
                          Please enter a valid percentage between 0 and 100
                        </p>
                      )}
                    </div>
                  )}

                  <div className="max-w-[700px]">
                    {/* Exit Details Table */}
                    <table className="w-full border-collapse bg-white text-sm">
                      <thead>
                        <tr>
                          <th className="border border-gray-400 px-4 h-10 text-left bg-gray-100 font-medium text-sm">
                            Exit Details
                          </th>
                          <th className="border border-gray-400 px-4 h-10 text-right bg-gray-100 font-medium text-sm">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-400 px-4 py-2">
                            Valuation
                          </td>
                          <td className="border border-gray-400 px-4 py-2 text-right">
                            ₹{formData.currentValuation.toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 px-4 py-2">
                            Planned Exit %
                          </td>
                          <td className="border border-gray-400 px-4 py-2 text-right">
                            {formData.plannedExitPercentage}%
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 px-4 py-2">
                            Exit Value
                          </td>
                          <td className="border border-gray-400 px-4 py-2 text-right">
                            ₹{calculations.exit.exitValue.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Ownership Status Table for Exit */}
                    <div className="mt-6">
                      <table className="w-full border-collapse bg-white text-sm">
                        <thead>
                          <tr>
                            <th
                              className="border border-gray-400 px-4 h-10 text-left bg-gray-100 font-medium text-sm"
                              colSpan="3"
                            >
                              Ownership Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-400 px-4 py-2">
                              Existing
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              100%
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              {calculations.ownershipStatus?.existing.after.toFixed(
                                2
                              )}
                              %
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-4 py-2">
                              New
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              0%
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right">
                              {calculations.ownershipStatus?.new.after.toFixed(
                                2
                              )}
                              %
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-4 py-2 font-medium">
                              Total
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right font-medium">
                              100%
                            </td>
                            <td className="border border-gray-400 px-4 py-2 text-right font-medium">
                              100%
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              {/* Continue with Investment Offer and Document Upload sections... */}
              {/* Investment Offer Section */}
              {formData.proposalType && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-lg font-medium text-gray-800">
                      Investment Offer
                    </h2>
                    <InfoTooltip text="Summary of your investment proposal" />
                  </div>

                  <div className="max-w-[700px] bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-blue-700 text-sm">
                      {formData.proposalType === "Equity Funding" &&
                        `INR ${formData.fundingRequired.toLocaleString()} as New Funding for ${calculations.postMoney.ownershipNew.toFixed(
                          2
                        )}% Ownership in the business`}
                      {formData.proposalType === "Full" &&
                        `INR ${calculations.exit.exitValue.toLocaleString()} for Full Ownership of Business`}
                      {formData.proposalType === "Partial" &&
                        `INR ${calculations.exit.exitValue.toLocaleString()} for ${
                          formData.plannedExitPercentage
                        }% Ownership of Business`}
                    </p>
                  </div>
                </div>
              )}
              {/* Pitch Document Section */}
              {/* <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-lg font-medium text-gray-800">
                    Pitch Document
                  </h2>
                  <span className="text-red-500">*</span>
                  <InfoTooltip text="Upload your pitch document (PDF, DOC, DOCX). Maximum file size: 8MB" />
                </div>

                <div className="max-w-[700px]">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 bg-gray-50
                    ${
                      errors.pitchDocument
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-4">
                      {formData.pitchDocument ? (
                        <div className="w-full">
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <File className="w-5 h-5 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">
                                {formData.pitchDocument.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {formData.pitchDocument.file && (
                                <a
                                  href={formData.pitchDocument.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  View
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    pitchDocument: null,
                                  }));
                                  setErrors((prev) => ({
                                    ...prev,
                                    pitchDocument: true,
                                  }));
                                }}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400" />
                          <div className="text-center">
                            <label className="cursor-pointer">
                              <span className="text-blue-600 hover:text-blue-700 font-medium">
                                Click to upload
                              </span>
                              <span className="text-gray-500">
                                {" "}
                                or drag and drop
                              </span>
                              <input
                                type="file"
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              PDF, DOC, or DOCX (max. 8MB)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {errors.pitchDocument && (
                    <p className="text-red-500 text-xs mt-1">
                      Please upload a pitch document
                    </p>
                  )}
                </div>
              </div> */}
              {/* Teaser Document Section */}
              {/* <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <h2 className="text-lg font-medium text-gray-800">
                    Teaser Document
                  </h2>
                  <span className="text-red-500">*</span>
                  <InfoTooltip text="Upload your teaser document (PDF, DOC, DOCX). Maximum file size: 8MB" />
                </div>

                <div className="max-w-[700px]">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 bg-gray-50
                  ${errors.teaserDocument ? "border-red-500" : "border-gray-300"}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-4">
                      {formData.teaserDocument ? (
                        <div className="w-full">
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <File className="w-5 h-5 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">
                                {formData.teaserDocument.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              {formData.teaserDocument.file && (
                                <a
                                  href={formData.teaserDocument.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  View
                                </a>
                              )}
                              <button
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    teaserDocument: null,
                                    documents_proposal:
                                      prev.documents_proposal.filter(
                                        (doc) => doc.type !== "teaser"
                                      ),
                                  }));
                                  setErrors((prev) => ({
                                    ...prev,
                                    teaserDocument: true,
                                  }));
                                }}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400" />
                          <div className="text-center">
                            <label className="cursor-pointer">
                              <span className="text-blue-600 hover:text-blue-700 font-medium">
                                Click to upload
                              </span>
                              <span className="text-gray-500">
                                {" "}
                                or drag and drop
                              </span>
                              <input
                                type="file"
                                onChange={handleTeaserUpload}
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              PDF, DOC, or DOCX (max. 8MB)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {errors.teaserDocument && (
                    <p className="text-red-500 text-xs mt-1">
                      Please upload a teaser document
                    </p>
                  )}
                </div>
              </div> */}
              {/* Submit Button */}
              <div className="flex justify-center gap-4 mt-8 max-w-[700px] mx-auto mb-8">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 
      font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
  onClick={handleSubmit}
  disabled={isLoading || !hasUnsavedChanges}
  className={`px-8 py-3 bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm
    ${!hasUnsavedChanges ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'}
    ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
>
  {isLoading ? (
    <span className="flex items-center">
      <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Saving...
    </span>
  ) : hasUnsavedChanges ? (
    "Save"
  ) : (
    "Saved"
  )}
</button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading || !location.state?.proposalId}
                  className={`px-8 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 
      font-medium transition-colors text-sm ${
        isLoading || !location.state?.proposalId
          ? "opacity-75 cursor-not-allowed"
          : ""
      }`}
                >
                  Next
                </button>
              </div>
               {/* 8. Add this confirmation dialog just before the closing div of
              your main container */}
              {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h2 className="text-xl font-semibold mb-4">
                      Unsaved Changes
                    </h2>
                    <p className="text-gray-600 mb-6">
                      You have unsaved changes. Would you like to discard these
                      changes and restore the previous version?
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
        </div>
      </div>
    </div>
  );
};
export default PitchDeck;
