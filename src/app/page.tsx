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

  return (
    <div className="min-h-screen bg-[#f4f5f7] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Fashion Business Internship Survey</h1>
            <p className="text-sm text-slate-500">
              Kindly complete this survey. Once completed, your feedback will be sent directly to our team to help shape the platform.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Section 1 */}
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider">Business Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label className="mb-3 block">Years in Business <span className="text-red-500">*</span></Label>
                  <div className="space-y-3 mt-3">
                    {["Less than 1 year", "1–3 years", "4–7 years", "8+ years"].map(opt => (
                      <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                        <input type="radio" required name="years" value={opt} checked={formData.yearsInBusiness === opt} onChange={(e) => updateField("yearsInBusiness", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                        <span className="text-sm text-slate-600">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Accept Interns? <span className="text-red-500">*</span></Label>
                  <div className="flex gap-6 mt-3">
                    {["Yes", "No", "Occasionally"].map(opt => (
                      <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                        <input type="radio" required name="accepts" value={opt} checked={formData.acceptsInterns === opt} onChange={(e) => updateField("acceptsInterns", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                        <span className="text-sm text-slate-600">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider">Hiring Experience</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label className="mb-3 block">Finding Methods <span className="text-red-500">*</span></Label>
                  <div className="space-y-3 mt-3">
                    {["Referrals", "Walk-ins", "Instagram", "WhatsApp", "Fashion schools", "Other"].map(opt => (
                      <div key={opt}>
                        <label className="flex items-center space-x-3 cursor-pointer group">
                          <input type="checkbox" checked={formData.findingMethods.includes(opt)} onChange={() => handleCheckbox("findingMethods", opt)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300" />
                          <span className="text-sm text-slate-600">{opt}</span>
                        </label>
                        {opt === "Other" && formData.findingMethods.includes("Other") && (
                          <Input className="mt-2" placeholder="Please specify..." value={formData.findingMethodsOther} onChange={(e: any) => updateField("findingMethodsOther", e.target.value)} required />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <Label className="mb-3 block">Struggled to find reliable interns? <span className="text-red-500">*</span></Label>
                    <div className="flex gap-6 mt-3">
                      {["Yes", "No"].map(opt => (
                        <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                          <input type="radio" required name="struggled" value={opt} checked={formData.struggledReliability === opt} onChange={(e) => updateField("struggledReliability", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                          <span className="text-sm text-slate-600">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Biggest Challenge <span className="text-red-500">*</span></Label>
                    <Textarea required rows={3} placeholder="Type your answer here..." value={formData.biggestChallenge} onChange={(e: any) => updateField("biggestChallenge", e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">One thing you'd improve about hiring <span className="text-red-500">*</span></Label>
                <Textarea required rows={2} placeholder="Type your answer here..." value={formData.improvement} onChange={(e: any) => updateField("improvement", e.target.value)} />
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider">Platform Validation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div>
                    <Label className="mb-3 block">Would you use this platform? <span className="text-red-500">*</span></Label>
                    <div className="flex gap-6 mt-3">
                      {["Definitely", "Maybe", "No"].map(opt => (
                        <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                          <input type="radio" required name="use_platform" value={opt} checked={formData.wouldUsePlatform === opt} onChange={(e) => updateField("wouldUsePlatform", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                          <span className="text-sm text-slate-600">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Would you pay for premium features? <span className="text-red-500">*</span></Label>
                    <div className="flex gap-6 mt-3">
                      {["Yes", "Maybe", "No"].map(opt => (
                        <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                          <input type="radio" required name="pay" value={opt} checked={formData.wouldPay === opt} onChange={(e) => updateField("wouldPay", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                          <span className="text-sm text-slate-600">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-1 block">Most Valuable Features <span className="text-red-500">*</span></Label>
                  <p className="text-xs text-slate-400 mb-3">Select up to 3</p>
                  <div className="space-y-3">
                    {["Post internship opportunities", "View applicant portfolios", "Chat with applicants", "Search by location", "Verified applicant profiles", "Application tracking dashboard"].map(opt => {
                      const isSelected = formData.valuableFeatures.includes(opt);
                      const disabled = !isSelected && formData.valuableFeatures.length >= 3;
                      return (
                        <label key={opt} className={`flex items-center space-x-3 cursor-pointer group ${disabled ? 'opacity-50' : ''}`}>
                          <input type="checkbox" disabled={disabled} checked={isSelected} onChange={() => handleCheckbox("valuableFeatures", opt, 3)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300" />
                          <span className="text-sm text-slate-600">{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase tracking-wider">Early Access</h2>
              
              <div>
                <Label className="mb-3 block">Would you like early access when we launch? <span className="text-red-500">*</span></Label>
                <div className="flex gap-6 mt-3">
                  {["Yes", "No"].map(opt => (
                    <label key={opt} className="flex items-center space-x-3 cursor-pointer group">
                      <input type="radio" required name="early" value={opt} checked={formData.wantsEarlyAccess === opt} onChange={(e) => updateField("wantsEarlyAccess", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                      <span className="text-sm text-slate-600">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.wantsEarlyAccess === "Yes" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 animate-in fade-in slide-in-from-top-4 duration-300">
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
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div className="pt-6 flex justify-end gap-4 items-center mt-12">
              <Button type="button" variant="secondary" onClick={() => window.location.reload()} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Continue"}
              </Button>
            </div>
            
          </form>
        </Card>
      </div>
    </div>
  );
}
