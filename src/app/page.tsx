"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

const TOTAL_STEPS = 15;

export default function SurveyForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    role: "",
    roleOther: "",
    platforms: [] as string[],
    postFrequency: "",
    manageWorkflow: "",
    timeSpent: "",
    frustratingPart: "",
    forgottenPost: "",
    stoppedConsistently: "",
    valueScore: "",
    saveTimeFeature: [] as string[],
    trustAI: "",
    payConsideration: "",
    wantsEarlyAccess: "",
    batchCreationLikelihood: "",
    name: "",
    email: "",
    whatsapp: "",
  });

  // Load from LocalStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("survey_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.currentStep !== undefined && parsed.currentStep <= TOTAL_STEPS) {
          setCurrentStep(parsed.currentStep);
        }
      } catch (e) {}
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (mounted && currentStep <= TOTAL_STEPS) {
      localStorage.setItem("survey_draft", JSON.stringify({ formData, currentStep }));
    }
  }, [formData, currentStep, mounted]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleCheckbox = (field: "platforms" | "saveTimeFeature", value: string, max?: number) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        if (max && current.length >= max) return prev;
        return { ...prev, [field]: [...current, value] };
      }
    });
    setError("");
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return true; // Intro
      case 1: return formData.role !== "" && (formData.role !== "Other" || formData.roleOther !== "");
      case 2: return formData.platforms.length > 0;
      case 3: return formData.postFrequency !== "";
      case 4: return formData.manageWorkflow !== "";
      case 5: return formData.timeSpent !== "";
      case 6: return formData.frustratingPart.trim() !== "";
      case 7: return formData.forgottenPost !== "";
      case 8: return formData.stoppedConsistently !== "";
      case 9: return formData.valueScore !== "";
      case 10: return formData.saveTimeFeature.length > 0;
      case 11: return formData.trustAI !== "";
      case 12: return formData.payConsideration !== "";
      case 13: return formData.wantsEarlyAccess !== "";
      case 14: return formData.batchCreationLikelihood !== "";
      case 15: return formData.email.trim() !== ""; // Contact
      default: return true;
    }
  };

  const handleNext = () => {
    if (!isStepValid()) {
      setError("Please answer to continue.");
      return;
    }
    setError("");
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(p => p + 1);
    } else if (currentStep === TOTAL_STEPS) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(p => p - 1);
      setError("");
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) {
         if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
             e.preventDefault();
             handleNext();
         }
         return; 
      }
      if (e.key === "Enter") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, formData]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    
    let finalRole = formData.role;
    if (finalRole === "Other" && formData.roleOther) {
      finalRole = `Other: ${formData.roleOther}`;
    }
    
    const payload = { ...formData, role: finalRole };
    
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to submit");
      localStorage.removeItem("survey_draft");
      setCurrentStep(TOTAL_STEPS + 1); // Success Screen
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  const progress = (currentStep / TOTAL_STEPS) * 100;
  const timeRemaining = Math.max(1, Math.ceil((TOTAL_STEPS - currentStep) * 0.3));

  // --- REUSABLE COMPONENTS --- //
  const ChoiceButton = ({ selected, label, onClick }: { selected: boolean, label: string, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 sm:p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group backdrop-blur-md ${
        selected 
          ? "border-indigo-500 bg-indigo-500/20 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
          : "border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/80"
      }`}
    >
      <span className="text-base sm:text-lg md:text-xl font-medium">{label}</span>
      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ml-4 ${
        selected ? "border-indigo-500 bg-indigo-500" : "border-zinc-600 group-hover:border-zinc-400"
      }`}>
        {selected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
      </div>
    </button>
  );

  const CheckboxButton = ({ selected, label, onClick, disabled }: { selected: boolean, label: string, onClick: () => void, disabled?: boolean }) => (
    <button
      onClick={disabled && !selected ? undefined : onClick}
      className={`w-full text-left p-3 sm:p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group backdrop-blur-md ${
        disabled && !selected ? "opacity-40 cursor-not-allowed border-zinc-800/80 bg-zinc-900/60" :
        selected 
          ? "border-indigo-500 bg-indigo-500/20 text-indigo-100 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
          : "border-zinc-800/80 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/80"
      }`}
    >
      <span className="text-base sm:text-lg md:text-xl font-medium">{label}</span>
      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ml-4 ${
        selected ? "border-indigo-500 bg-indigo-500" : "border-zinc-600 group-hover:border-zinc-400"
      }`}>
        {selected && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
      </div>
    </button>
  );

  const variants = {
    enter: { y: 20, opacity: 0, scale: 0.98 },
    center: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -20, opacity: 0, scale: 0.98 }
  };

  // --- RENDER CONTENT --- //
  return (
    <div 
      className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col overflow-x-hidden selection:bg-indigo-500/30 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url('/bg.jpg')` }}
    >
      {/* Dark overlay to ensure text remains highly readable */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-0 pointer-events-none"></div>
      
      {/* Header / Progress (Hidden on Intro & Success) */}
      {currentStep > 0 && currentStep <= TOTAL_STEPS && (
        <header className="fixed top-0 left-0 right-0 p-4 md:p-8 z-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <span className="font-bold text-base sm:text-lg tracking-tight">AI Social</span>
          </div>
          
          <div className="flex flex-col items-end">
             <span className="text-xs sm:text-sm font-medium text-zinc-400 mb-1.5 sm:mb-2">Question {currentStep} of {TOTAL_STEPS} • ~{timeRemaining} min</span>
             <div className="w-24 sm:w-32 md:w-48 h-1 sm:h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
             </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-12 pb-32 sm:pb-32 w-full max-w-3xl mx-auto relative z-10 min-h-[100dvh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full mt-12 md:mt-0"
          >
            
            {/* 0. INTRO */}
            {currentStep === 0 && (
              <div className="text-left space-y-6 sm:space-y-8 bg-zinc-900/40 p-6 sm:p-8 md:p-12 rounded-3xl border border-white/5 backdrop-blur-lg mt-8 md:mt-0">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400 pb-2">
                  AI Social Media<br/>Automation
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-zinc-300 max-w-2xl leading-relaxed">
                  Imagine spending one day creating content, uploading it to a folder, and having AI automatically generate captions, schedule, and publish your content throughout the week.
                </p>
                <div className="pt-4 sm:pt-8">
                  <button 
                    onClick={handleNext}
                    className="group relative inline-flex h-14 sm:h-16 items-center justify-center overflow-hidden rounded-full bg-indigo-600 px-8 sm:px-12 font-semibold text-neutral-50 duration-300 hover:bg-indigo-500 hover:scale-105 shadow-xl shadow-indigo-600/20"
                  >
                    <span className="text-lg sm:text-xl">Start Survey</span>
                    <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" />
                  </button>
                  <p className="text-zinc-400 mt-4 text-sm font-medium hidden md:block">Press Enter ↵</p>
                </div>
              </div>
            )}

            {/* 1. ROLE */}
            {currentStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">1. Which best describes you?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
                  {["Fashion Designer", "Clothing Brand", "Content Creator", "Small Business Owner", "Digital Marketer", "Other"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.role === opt} onClick={() => updateField("role", opt)} />
                  ))}
                </div>
                <AnimatePresence>
                  {formData.role === "Other" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="Please specify..." 
                        value={formData.roleOther}
                        onChange={(e) => updateField("roleOther", e.target.value)}
                        className="w-full mt-4 p-4 md:p-6 text-lg sm:text-xl bg-black/20 backdrop-blur-md border-b-2 border-zinc-700 focus:border-indigo-500 text-white outline-none transition-colors rounded-t-xl"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 2. PLATFORMS */}
            {currentStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">2. Which platforms do you post on regularly?</h2>
                <p className="text-zinc-400 text-base sm:text-lg">Select all that apply.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
                  {["Instagram", "TikTok", "Facebook", "X (Twitter)", "LinkedIn", "YouTube Shorts"].map(opt => (
                    <CheckboxButton key={opt} label={opt} selected={formData.platforms.includes(opt)} onClick={() => handleCheckbox("platforms", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 3. FREQUENCY */}
            {currentStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">3. How often do you post content?</h2>
                <div className="space-y-3 mt-6 sm:mt-8">
                  {["Multiple times a day", "Once a day", "A few times a week", "Once a week", "Rarely"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.postFrequency === opt} onClick={() => updateField("postFrequency", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 4. MANAGEMENT */}
            {currentStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">4. How do you currently manage your content?</h2>
                <div className="space-y-3 mt-6 sm:mt-8">
                  {["Post manually every day", "Schedule posts using another tool", "I don't have a content schedule", "Someone manages it for me"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.manageWorkflow === opt} onClick={() => updateField("manageWorkflow", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 5. TIME SPENT */}
            {currentStep === 5 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">5. How much time do you spend each week creating and posting content?</h2>
                <div className="space-y-3 mt-6 sm:mt-8">
                  {["Less than 2 hours", "2–5 hours", "5–10 hours", "More than 10 hours"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.timeSpent === opt} onClick={() => updateField("timeSpent", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 6. FRUSTRATING PART */}
            {currentStep === 6 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">6. What is the most frustrating part of posting on social media?</h2>
                <div className="mt-6 sm:mt-8">
                  <textarea 
                    autoFocus
                    rows={4}
                    placeholder="Type your answer here..."
                    value={formData.frustratingPart}
                    onChange={(e) => updateField("frustratingPart", e.target.value)}
                    className="w-full p-4 md:p-6 text-lg sm:text-xl md:text-2xl bg-black/20 backdrop-blur-md border-b-2 border-zinc-700 focus:border-indigo-500 text-white outline-none transition-colors resize-none placeholder-zinc-500 rounded-t-xl shadow-inner"
                  />
                  <p className="text-zinc-400 mt-4 text-sm font-medium hidden md:block">Tip: Press Cmd/Ctrl + Enter to submit</p>
                </div>
              </div>
            )}

            {/* 7. FORGOTTEN POSTS */}
            {currentStep === 7 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">7. Have you ever created content but forgotten to post it?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
                  {["Frequently", "Sometimes", "Rarely", "Never"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.forgottenPost === opt} onClick={() => updateField("forgottenPost", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 8. STOPPED CONSISTENTLY */}
            {currentStep === 8 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">8. Have you ever stopped posting consistently because it became too time-consuming?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
                  {["Yes", "No"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.stoppedConsistently === opt} onClick={() => updateField("stoppedConsistently", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 9. VALUE SCORE */}
            {currentStep === 9 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">9. If you could spend one day creating content for the entire week, and have AI automatically schedule and publish everything... How valuable would that be?</h2>
                <div className="flex justify-between items-center mt-8 sm:mt-12 gap-2 sm:gap-4">
                  {[1, 2, 3, 4, 5].map(opt => (
                    <button
                      key={opt}
                      onClick={() => updateField("valueScore", opt.toString())}
                      className={`flex-1 aspect-[4/3] sm:aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-xl sm:text-2xl font-bold transition-all backdrop-blur-md ${
                        formData.valueScore === opt.toString()
                          ? "bg-indigo-500 text-white scale-110 shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-indigo-400"
                          : "bg-zinc-900/60 text-zinc-300 border border-white/5 hover:bg-zinc-800/80 hover:scale-105"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-zinc-400 font-medium text-xs sm:text-sm mt-4 px-1 sm:px-2">
                  <span>Not Valuable</span>
                  <span>Extremely Valuable</span>
                </div>
              </div>
            )}

            {/* 10. TIME SAVING FEATURE */}
            {currentStep === 10 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">10. Which feature would save you the most time?</h2>
                <p className="text-zinc-400 text-base sm:text-lg">Choose up to 3. Selected: {formData.saveTimeFeature.length}/3</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
                  {["Automatic scheduling", "AI captions", "AI hashtags", "Automatic posting", "Best posting time recommendations", "Calendar view", "Analytics", "Approval before posting"].map(opt => (
                    <CheckboxButton 
                      key={opt} 
                      label={opt} 
                      selected={formData.saveTimeFeature.includes(opt)} 
                      disabled={formData.saveTimeFeature.length >= 3 && !formData.saveTimeFeature.includes(opt)}
                      onClick={() => handleCheckbox("saveTimeFeature", opt, 3)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 11. TRUST AI */}
            {currentStep === 11 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">11. Would you trust AI to automatically publish your content without reviewing every post?</h2>
                <div className="space-y-3 mt-6 sm:mt-8">
                  {["Yes", "Yes, but only after I approve it once", "Maybe", "No"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.trustAI === opt} onClick={() => updateField("trustAI", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 12. PAY CONSIDERATION */}
            {currentStep === 12 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">12. If this platform saved you 5–10 hours every week, would you consider paying for it?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
                  {["Yes", "Maybe", "No"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.payConsideration === opt} onClick={() => updateField("payConsideration", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 13. EARLY ACCESS */}
            {currentStep === 13 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">13. Would you like early access when we launch?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
                  {["Yes", "No"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.wantsEarlyAccess === opt} onClick={() => updateField("wantsEarlyAccess", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 14. BATCH CREATION */}
            {currentStep === 14 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">14. If you knew your social media would run automatically for the next 7 days, how likely would you be to spend one day each week creating all your content in advance?</h2>
                <div className="space-y-3 mt-6 sm:mt-8">
                  {["Very likely", "Likely", "Not sure", "Unlikely", "Very unlikely"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.batchCreationLikelihood === opt} onClick={() => updateField("batchCreationLikelihood", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 15. CONTACT DETAILS */}
            {currentStep === 15 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-2">Final Step: Where should we reach you?</h2>
                <p className="text-zinc-400 text-base sm:text-lg mb-6 sm:mb-8">Leave your details below so we can contact you.</p>
                
                <div className="space-y-6 sm:space-y-8 mt-6 sm:mt-8 bg-zinc-900/40 p-6 sm:p-8 rounded-3xl border border-white/5 backdrop-blur-md">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-2 text-sm sm:text-base">Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="w-full text-lg sm:text-xl md:text-2xl bg-black/20 border-b-2 border-zinc-700 focus:border-indigo-500 text-white outline-none transition-colors py-3 px-4 placeholder-zinc-600 rounded-t-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-2 text-sm sm:text-base">Email Address <span className="text-indigo-400">*</span></label>
                    <input 
                      type="email" 
                      autoFocus
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="w-full text-lg sm:text-xl md:text-2xl bg-black/20 border-b-2 border-zinc-700 focus:border-indigo-500 text-white outline-none transition-colors py-3 px-4 placeholder-zinc-600 rounded-t-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-2 text-sm sm:text-base">Phone / WhatsApp</label>
                    <input 
                      type="tel" 
                      placeholder="+1234567890"
                      value={formData.whatsapp}
                      onChange={(e) => updateField("whatsapp", e.target.value)}
                      className="w-full text-lg sm:text-xl md:text-2xl bg-black/20 border-b-2 border-zinc-700 focus:border-indigo-500 text-white outline-none transition-colors py-3 px-4 placeholder-zinc-600 rounded-t-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 16. SUCCESS SCREEN */}
            {currentStep === TOTAL_STEPS + 1 && (
              <div className="text-center space-y-6 sm:space-y-8 animate-in zoom-in duration-700 bg-zinc-900/40 p-8 sm:p-12 rounded-3xl border border-white/5 backdrop-blur-lg">
                <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 sm:mb-8 border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                   <Check className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">Thank You! 🎉</h1>
                <p className="text-lg sm:text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                  Your feedback is incredibly valuable and will help us build a better product.
                </p>
                {formData.wantsEarlyAccess === "Yes" && (
                  <p className="text-base sm:text-lg text-indigo-400 font-medium mt-4">
                    Since you signed up for early access, we'll contact you before launch!
                  </p>
                )}
                <div className="pt-6 sm:pt-8">
                  <button 
                    onClick={() => {
                       setCurrentStep(0);
                       setFormData({
                         role: "", roleOther: "", platforms: [], postFrequency: "", manageWorkflow: "",
                         timeSpent: "", frustratingPart: "", forgottenPost: "", stoppedConsistently: "",
                         valueScore: "", saveTimeFeature: [], trustAI: "", payConsideration: "",
                         wantsEarlyAccess: "", batchCreationLikelihood: "", name: "", email: "", whatsapp: ""
                       });
                    }}
                    className="inline-flex h-12 sm:h-14 items-center justify-center rounded-full bg-zinc-800 px-8 sm:px-10 font-semibold text-white hover:bg-zinc-700 transition-colors border border-white/10"
                  >
                    Take Survey Again
                  </button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation (Hidden on Intro & Success) */}
      {currentStep > 0 && currentStep <= TOTAL_STEPS && (
        <footer className="fixed bottom-0 left-0 right-0 p-4 md:p-8 z-50 flex items-center justify-between bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pt-12">
          <div className="flex items-center space-x-3 sm:space-x-4">
             <button 
               onClick={handleBack}
               className="w-12 h-12 rounded-full bg-zinc-900/90 flex items-center justify-center text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border border-white/10 backdrop-blur-md shadow-lg"
             >
               <ArrowLeft className="w-5 h-5" />
             </button>
             {error && <span className="text-red-400 font-medium animate-pulse text-sm sm:text-base hidden sm:inline-block">{error}</span>}
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
             {error && <span className="text-red-400 font-medium animate-pulse text-sm sm:hidden absolute -top-6 right-4">{error}</span>}
             <span className="hidden md:inline-block text-zinc-400 font-medium bg-black/40 px-3 py-1.5 rounded-md backdrop-blur-sm border border-white/5">Press Enter ↵</span>
             <button 
               onClick={handleNext}
               disabled={isSubmitting}
               className={`h-12 sm:h-14 px-6 sm:px-8 rounded-full font-bold text-base sm:text-lg flex items-center transition-all shadow-lg ${
                 isStepValid() 
                   ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 shadow-indigo-600/20" 
                   : "bg-zinc-800/90 text-zinc-500 cursor-not-allowed border border-white/5 backdrop-blur-md"
               }`}
             >
               {isSubmitting ? "Submitting..." : (currentStep === TOTAL_STEPS ? "Submit" : "Continue")}
               {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />}
             </button>
          </div>
        </footer>
      )}

    </div>
  );
}
