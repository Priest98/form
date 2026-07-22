"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

const TOTAL_STEPS = 16;

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
    stopUsing: "",
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
        if (parsed.currentStep !== undefined && parsed.currentStep < 17) {
          setCurrentStep(parsed.currentStep);
        }
      } catch (e) {}
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (mounted && currentStep < 17) {
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
      case 13: return formData.stopUsing.trim() !== "";
      case 14: return formData.wantsEarlyAccess !== "";
      case 15: return formData.batchCreationLikelihood !== "";
      case 16: return formData.email.trim() !== ""; // Contact
      default: return true;
    }
  };

  const handleNext = () => {
    if (!isStepValid()) {
      setError("Please answer to continue.");
      return;
    }
    setError("");
    if (currentStep < 16) {
      setCurrentStep(p => p + 1);
    } else if (currentStep === 16) {
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
      // Don't intercept if they are typing in a textarea, unless it's Ctrl+Enter
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
  }, [currentStep, formData]); // Need dependencies so handleNext uses fresh state

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
      setCurrentStep(17); // Success Screen
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  const progress = (currentStep / TOTAL_STEPS) * 100;
  const timeRemaining = Math.max(1, Math.ceil((16 - currentStep) * 0.3));

  // --- REUSABLE COMPONENTS --- //
  
  const ChoiceButton = ({ selected, label, onClick }: { selected: boolean, label: string, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ${
        selected 
          ? "border-indigo-500 bg-indigo-500/10 text-indigo-100" 
          : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
      }`}
    >
      <span className="text-lg md:text-xl font-medium">{label}</span>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
        selected ? "border-indigo-500 bg-indigo-500" : "border-zinc-700 group-hover:border-zinc-500"
      }`}>
        {selected && <Check className="w-4 h-4 text-white" />}
      </div>
    </button>
  );

  const CheckboxButton = ({ selected, label, onClick, disabled }: { selected: boolean, label: string, onClick: () => void, disabled?: boolean }) => (
    <button
      onClick={disabled && !selected ? undefined : onClick}
      className={`w-full text-left p-4 md:p-6 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ${
        disabled && !selected ? "opacity-40 cursor-not-allowed border-zinc-800 bg-zinc-900" :
        selected 
          ? "border-indigo-500 bg-indigo-500/10 text-indigo-100" 
          : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800"
      }`}
    >
      <span className="text-lg md:text-xl font-medium">{label}</span>
      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
        selected ? "border-indigo-500 bg-indigo-500" : "border-zinc-700 group-hover:border-zinc-500"
      }`}>
        {selected && <Check className="w-4 h-4 text-white" />}
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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col overflow-hidden selection:bg-indigo-500/30">
      
      {/* Header / Progress (Hidden on Intro & Success) */}
      {currentStep > 0 && currentStep < 17 && (
        <header className="fixed top-0 left-0 right-0 p-6 md:p-8 z-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
               <span className="text-xl">🤖</span>
             </div>
             <span className="font-bold text-lg tracking-tight">AI Social</span>
          </div>
          
          <div className="flex flex-col items-end">
             <span className="text-sm font-medium text-zinc-500 mb-2">Question {currentStep} of {TOTAL_STEPS} • ~{timeRemaining} min</span>
             <div className="w-32 md:w-48 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-indigo-500 rounded-full"
                />
             </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 w-full max-w-3xl mx-auto relative z-10 min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full"
          >
            
            {/* 0. INTRO */}
            {currentStep === 0 && (
              <div className="text-center space-y-8">
                <div className="mx-auto w-24 h-24 bg-indigo-500/10 text-indigo-400 rounded-3xl flex items-center justify-center mb-8 border border-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                   <span className="text-5xl">🤖</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-500 pb-2">
                  AI Social Media<br/>Automation
                </h1>
                <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                  Imagine spending one day creating content, uploading it to a folder, and having AI automatically generate captions, schedule, and publish your content throughout the week.
                </p>
                <div className="pt-8">
                  <button 
                    onClick={handleNext}
                    className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-full bg-indigo-600 px-12 font-semibold text-neutral-50 duration-300 hover:bg-indigo-500 hover:scale-105 shadow-xl shadow-indigo-600/20"
                  >
                    <span className="text-xl">Start Survey</span>
                    <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover:translate-x-1" />
                  </button>
                  <p className="text-zinc-600 mt-4 text-sm font-medium">Press Enter ↵</p>
                </div>
              </div>
            )}

            {/* 1. ROLE */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">1. Which best describes you?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
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
                        className="w-full mt-4 p-4 md:p-6 text-xl bg-transparent border-b-2 border-zinc-800 focus:border-indigo-500 text-white outline-none transition-colors"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 2. PLATFORMS */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">2. Which platforms do you post on regularly?</h2>
                <p className="text-zinc-400 text-lg">Select all that apply.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {["Instagram", "TikTok", "Facebook", "X (Twitter)", "LinkedIn", "YouTube Shorts"].map(opt => (
                    <CheckboxButton key={opt} label={opt} selected={formData.platforms.includes(opt)} onClick={() => handleCheckbox("platforms", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 3. FREQUENCY */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">3. How often do you post content?</h2>
                <div className="space-y-3 mt-8">
                  {["Multiple times a day", "Once a day", "A few times a week", "Once a week", "Rarely"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.postFrequency === opt} onClick={() => updateField("postFrequency", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 4. MANAGEMENT */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">4. How do you currently manage your content?</h2>
                <div className="space-y-3 mt-8">
                  {["Post manually every day", "Schedule posts using another tool", "I don't have a content schedule", "Someone manages it for me"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.manageWorkflow === opt} onClick={() => updateField("manageWorkflow", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 5. TIME SPENT */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">5. How much time do you spend each week creating and posting content?</h2>
                <div className="space-y-3 mt-8">
                  {["Less than 2 hours", "2–5 hours", "5–10 hours", "More than 10 hours"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.timeSpent === opt} onClick={() => updateField("timeSpent", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 6. FRUSTRATING PART */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">6. What is the most frustrating part of posting on social media?</h2>
                <div className="mt-8">
                  <textarea 
                    autoFocus
                    rows={4}
                    placeholder="Type your answer here..."
                    value={formData.frustratingPart}
                    onChange={(e) => updateField("frustratingPart", e.target.value)}
                    className="w-full p-4 md:p-6 text-xl md:text-2xl bg-transparent border-b-2 border-zinc-800 focus:border-indigo-500 text-white outline-none transition-colors resize-none placeholder-zinc-700"
                  />
                  <p className="text-zinc-600 mt-4 text-sm font-medium">Tip: Press Cmd/Ctrl + Enter to submit</p>
                </div>
              </div>
            )}

            {/* 7. FORGOTTEN POSTS */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">7. Have you ever created content but forgotten to post it?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {["Frequently", "Sometimes", "Rarely", "Never"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.forgottenPost === opt} onClick={() => updateField("forgottenPost", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 8. STOPPED CONSISTENTLY */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">8. Have you ever stopped posting consistently because it became too time-consuming?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {["Yes", "No"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.stoppedConsistently === opt} onClick={() => updateField("stoppedConsistently", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 9. VALUE SCORE */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">9. If you could spend one day creating content for the entire week, and have AI automatically schedule and publish everything... How valuable would that be?</h2>
                <div className="flex justify-between items-center mt-12 gap-2">
                  {[1, 2, 3, 4, 5].map(opt => (
                    <button
                      key={opt}
                      onClick={() => updateField("valueScore", opt.toString())}
                      className={`flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center text-2xl font-bold transition-all ${
                        formData.valueScore === opt.toString()
                          ? "bg-indigo-500 text-white scale-110 shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                          : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:scale-105"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-zinc-500 font-medium text-sm mt-4 px-2">
                  <span>Not Valuable</span>
                  <span>Extremely Valuable</span>
                </div>
              </div>
            )}

            {/* 10. TIME SAVING FEATURE */}
            {currentStep === 10 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">10. Which feature would save you the most time?</h2>
                <p className="text-zinc-400 text-lg">Choose up to 3. Selected: {formData.saveTimeFeature.length}/3</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
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
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">11. Would you trust AI to automatically publish your content without reviewing every post?</h2>
                <div className="space-y-3 mt-8">
                  {["Yes", "Yes, but only after I approve it once", "Maybe", "No"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.trustAI === opt} onClick={() => updateField("trustAI", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 12. PAY CONSIDERATION */}
            {currentStep === 12 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">12. If this platform saved you 5–10 hours every week, would you consider paying for it?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  {["Yes", "Maybe", "No"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.payConsideration === opt} onClick={() => updateField("payConsideration", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 13. STOP USING */}
            {currentStep === 13 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">13. What would stop you from using a platform like this?</h2>
                <div className="mt-8">
                  <textarea 
                    autoFocus
                    rows={4}
                    placeholder="Short answer..."
                    value={formData.stopUsing}
                    onChange={(e) => updateField("stopUsing", e.target.value)}
                    className="w-full p-4 md:p-6 text-xl md:text-2xl bg-transparent border-b-2 border-zinc-800 focus:border-indigo-500 text-white outline-none transition-colors resize-none placeholder-zinc-700"
                  />
                  <p className="text-zinc-600 mt-4 text-sm font-medium">Tip: Press Cmd/Ctrl + Enter to submit</p>
                </div>
              </div>
            )}

            {/* 14. EARLY ACCESS */}
            {currentStep === 14 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">14. Would you like early access when we launch?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {["Yes", "No"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.wantsEarlyAccess === opt} onClick={() => updateField("wantsEarlyAccess", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 15. BATCH CREATION */}
            {currentStep === 15 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">15. If you knew your social media would run automatically for the next 7 days, how likely would you be to spend one day each week creating all your content in advance?</h2>
                <div className="space-y-3 mt-8">
                  {["Very likely", "Likely", "Not sure", "Unlikely", "Very unlikely"].map(opt => (
                    <ChoiceButton key={opt} label={opt} selected={formData.batchCreationLikelihood === opt} onClick={() => updateField("batchCreationLikelihood", opt)} />
                  ))}
                </div>
              </div>
            )}

            {/* 16. CONTACT DETAILS */}
            {currentStep === 16 && (
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-2">Final Step: Where should we reach you?</h2>
                <p className="text-zinc-400 text-lg mb-8">Leave your details below so we can contact you.</p>
                
                <div className="space-y-8 mt-8">
                  <div>
                    <label className="block text-zinc-500 font-medium mb-2">Name</label>
                    <input 
                      type="text" 
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="w-full text-2xl bg-transparent border-b-2 border-zinc-800 focus:border-indigo-500 text-white outline-none transition-colors py-2 placeholder-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-medium mb-2">Email Address <span className="text-indigo-500">*</span></label>
                    <input 
                      type="email" 
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="w-full text-2xl bg-transparent border-b-2 border-zinc-800 focus:border-indigo-500 text-white outline-none transition-colors py-2 placeholder-zinc-700"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-medium mb-2">Phone / WhatsApp</label>
                    <input 
                      type="tel" 
                      placeholder="+1234567890"
                      value={formData.whatsapp}
                      onChange={(e) => updateField("whatsapp", e.target.value)}
                      className="w-full text-2xl bg-transparent border-b-2 border-zinc-800 focus:border-indigo-500 text-white outline-none transition-colors py-2 placeholder-zinc-700"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 17. SUCCESS SCREEN */}
            {currentStep === 17 && (
              <div className="text-center space-y-8 animate-in zoom-in duration-700">
                <div className="mx-auto w-24 h-24 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-8 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                   <Check className="w-12 h-12" />
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">Thank You! 🎉</h1>
                <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                  Your feedback is incredibly valuable and will help us build a better product.
                </p>
                {formData.wantsEarlyAccess === "Yes" && (
                  <p className="text-lg text-indigo-400 font-medium mt-4">
                    Since you signed up for early access, we'll contact you before launch!
                  </p>
                )}
                <div className="pt-8">
                  <button 
                    onClick={() => {
                       setCurrentStep(0);
                       setFormData({
                         role: "", roleOther: "", platforms: [], postFrequency: "", manageWorkflow: "",
                         timeSpent: "", frustratingPart: "", forgottenPost: "", stoppedConsistently: "",
                         valueScore: "", saveTimeFeature: [], trustAI: "", payConsideration: "", stopUsing: "",
                         wantsEarlyAccess: "", batchCreationLikelihood: "", name: "", email: "", whatsapp: ""
                       });
                    }}
                    className="inline-flex h-14 items-center justify-center rounded-full bg-zinc-800 px-10 font-semibold text-white hover:bg-zinc-700 transition-colors"
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
      {currentStep > 0 && currentStep < 17 && (
        <footer className="fixed bottom-0 left-0 right-0 p-6 md:p-8 z-50 flex items-center justify-between bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent">
          <div className="flex items-center space-x-4">
             <button 
               onClick={handleBack}
               className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
             >
               <ArrowLeft className="w-5 h-5" />
             </button>
             {error && <span className="text-red-400 font-medium animate-pulse">{error}</span>}
          </div>
          
          <div className="flex items-center space-x-4">
             <span className="hidden md:inline-block text-zinc-500 font-medium">Press Enter ↵</span>
             <button 
               onClick={handleNext}
               disabled={isSubmitting}
               className={`h-14 px-8 rounded-full font-bold text-lg flex items-center transition-all ${
                 isStepValid() 
                   ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 shadow-xl shadow-indigo-600/20" 
                   : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
               }`}
             >
               {isSubmitting ? "Submitting..." : (currentStep === 16 ? "Submit" : "Continue")}
               {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
             </button>
          </div>
        </footer>
      )}

    </div>
  );
}
