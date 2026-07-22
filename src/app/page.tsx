"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Textarea, Label } from "@/components/ui/mock-shadcn";

export default function SurveyForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    yearsInBusiness: "",
    acceptsInterns: "",
    findingMethods: [] as string[],
    findingMethodsOther: "",
    biggestChallenge: "",
    struggledReliability: "",
    wouldUsePlatform: "",
    valuableFeatures: [] as string[],
    wouldPay: "",
    improvement: "",
    wantsEarlyAccess: "",
    name: "",
    whatsapp: "",
    email: ""
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckbox = (field: "findingMethods" | "valuableFeatures", value: string, max?: number) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        if (max && current.length >= max) return prev;
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    // Combine "Other" into findingMethods if checked
    let methods = [...formData.findingMethods];
    if (methods.includes("Other") && formData.findingMethodsOther) {
      methods = methods.map(m => m === "Other" ? `Other: ${formData.findingMethodsOther}` : m);
    }
    
    const payload = { ...formData, findingMethods: methods, wantsEarlyAccess: formData.wantsEarlyAccess === "Yes" };
    
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to submit");
      router.push("/success");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsSubmitting(false);
    }
  };

  // Calculate progress
  const requiredFields = [
    formData.yearsInBusiness, formData.acceptsInterns, formData.findingMethods.length > 0,
    formData.biggestChallenge, formData.struggledReliability, formData.wouldUsePlatform,
    formData.valuableFeatures.length > 0, formData.wouldPay, formData.improvement, formData.wantsEarlyAccess
  ];
  const progress = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-6">
             <span className="text-2xl">✨</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Fashion Business Internship Survey</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Hi! 👋 We&apos;re building a platform that helps established fashion designers connect with aspiring fashion designers.
          </p>
          <div className="flex justify-center items-center gap-2 text-sm text-slate-500 font-medium bg-slate-100 py-2 px-4 rounded-full w-fit mx-auto">
             <span>⏱ Takes &lt; 3 minutes</span>
             <span>•</span>
             <span>🔒 Used for research only</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="sticky top-0 z-10 bg-slate-50 py-4">
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div className="bg-slate-900 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-right text-xs text-slate-500 mt-2 font-medium">{progress}% Completed</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">1. How long have you been in the fashion business? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Less than 1 year", "1–3 years", "4–7 years", "8+ years"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="years" value={opt} checked={formData.yearsInBusiness === opt} onChange={(e) => updateField("yearsInBusiness", e.target.value)} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">2. Do you currently accept interns? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Yes", "No", "Occasionally"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="accepts" value={opt} checked={formData.acceptsInterns === opt} onChange={(e) => updateField("acceptsInterns", e.target.value)} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">3. How do you usually find interns? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Referrals", "Walk-ins", "Instagram", "WhatsApp", "Fashion schools", "Other"].map(opt => (
                <div key={opt}>
                  <label className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <input type="checkbox" checked={formData.findingMethods.includes(opt)} onChange={() => handleCheckbox("findingMethods", opt)} className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900" />
                    <span className="text-slate-700 font-medium">{opt}</span>
                  </label>
                  {opt === "Other" && formData.findingMethods.includes("Other") && (
                    <Input className="mt-3" placeholder="Please specify..." value={formData.findingMethodsOther} onChange={(e: any) => updateField("findingMethodsOther", e.target.value)} required />
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">4. What is your biggest challenge when looking for interns? <span className="text-red-500">*</span></Label>
            <Textarea required className="mt-4" rows={4} placeholder="Type your answer here..." value={formData.biggestChallenge} onChange={(e: any) => updateField("biggestChallenge", e.target.value)} />
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">5. Have you ever struggled to find reliable interns? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Yes", "No"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="struggled" value={opt} checked={formData.struggledReliability === opt} onChange={(e) => updateField("struggledReliability", e.target.value)} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900 leading-snug">6. If there was a platform where verified fashion businesses could post internship opportunities and aspiring fashion designers could apply, would you use it? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Definitely", "Maybe", "No"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="use_platform" value={opt} checked={formData.wouldUsePlatform === opt} onChange={(e) => updateField("wouldUsePlatform", e.target.value)} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">7. Which features would be most valuable to you? (Select up to 3) <span className="text-red-500">*</span></Label>
            <p className="text-sm text-slate-500 font-medium">Selected: {formData.valuableFeatures.length}/3</p>
            <div className="space-y-3 mt-4">
              {["Post internship opportunities", "View applicant portfolios", "Chat with applicants", "Search by location", "Verified applicant profiles", "Application tracking dashboard"].map(opt => {
                const isSelected = formData.valuableFeatures.includes(opt);
                const disabled = !isSelected && formData.valuableFeatures.length >= 3;
                return (
                  <label key={opt} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${disabled ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50' : 'cursor-pointer hover:bg-slate-50 border-slate-200'}`}>
                    <input type="checkbox" disabled={disabled} checked={isSelected} onChange={() => handleCheckbox("valuableFeatures", opt, 3)} className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900" />
                    <span className="text-slate-700 font-medium">{opt}</span>
                  </label>
                )
              })}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900 leading-snug">8. Would you pay for premium features if the platform consistently helped you find quality interns? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Yes", "Maybe", "No"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="pay" value={opt} checked={formData.wouldPay === opt} onChange={(e) => updateField("wouldPay", e.target.value)} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">9. If you could improve one thing about hiring interns, what would it be? <span className="text-red-500">*</span></Label>
            <Textarea required className="mt-4" rows={4} placeholder="Type your answer here..." value={formData.improvement} onChange={(e: any) => updateField("improvement", e.target.value)} />
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200 transition-all">
            <Label className="text-lg text-slate-900">10. Would you like early access when we launch? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Yes", "No"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="early" value={opt} checked={formData.wantsEarlyAccess === opt} onChange={(e) => updateField("wantsEarlyAccess", e.target.value)} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
            
            {formData.wantsEarlyAccess === "Yes" && (
              <div className="pt-6 mt-6 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <p className="text-sm text-slate-500 font-medium mb-4">Awesome! Please leave your details below so we can contact you.</p>
                <div>
                  <Label className="mb-2 block">Name</Label>
                  <Input placeholder="Jane Doe" required value={formData.name} onChange={(e: any) => updateField("name", e.target.value)} />
                </div>
                <div>
                  <Label className="mb-2 block">WhatsApp Number</Label>
                  <Input type="tel" placeholder="+1234567890" required value={formData.whatsapp} onChange={(e: any) => updateField("whatsapp", e.target.value)} />
                </div>
                <div>
                  <Label className="mb-2 block">Email Address</Label>
                  <Input type="email" placeholder="jane@example.com" required value={formData.email} onChange={(e: any) => updateField("email", e.target.value)} />
                </div>
              </div>
            )}
          </Card>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-200 text-center">
              {error}
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all rounded-xl">
            {isSubmitting ? "Submitting..." : "Submit Survey"}
          </Button>
          
        </form>
      </div>
    </div>
  );
}
