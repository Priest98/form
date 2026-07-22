"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Textarea, Label } from "@/components/ui/mock-shadcn";

export default function SurveyForm() {
  const router = useRouter();
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
    name: "",
    email: "",
    whatsapp: "",
    batchCreationLikelihood: "",
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      router.push("/success");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsSubmitting(false);
    }
  };

  const requiredFields = [
    formData.role,
    formData.platforms.length > 0,
    formData.postFrequency,
    formData.manageWorkflow,
    formData.timeSpent,
    formData.frustratingPart,
    formData.forgottenPost,
    formData.stoppedConsistently,
    formData.valueScore,
    formData.saveTimeFeature.length > 0,
    formData.trustAI,
    formData.payConsideration,
    formData.stopUsing,
    formData.wantsEarlyAccess,
    formData.batchCreationLikelihood
  ];
  const progress = Math.round((requiredFields.filter(Boolean).length / requiredFields.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
             <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">AI Social Media Automation</h1>
          <div className="text-lg text-slate-600 max-w-xl mx-auto space-y-4 text-left bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p>Hi! 👋</p>
            <p>We&apos;re building an AI-powered platform that helps creators and businesses automate their social media content.</p>
            <p>Imagine spending one day creating content, uploading it to a folder, and having AI automatically generate captions, schedule, and publish your content throughout the week.</p>
          </div>
          <div className="flex justify-center items-center gap-2 text-sm text-slate-500 font-medium bg-slate-100 py-2 px-4 rounded-full w-fit mx-auto">
             <span>⏱ Takes &lt; 3 minutes</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="sticky top-0 z-10 bg-slate-50 py-4">
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-right text-xs text-slate-500 mt-2 font-medium">{progress}% Completed</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="pt-4 pb-2 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">Section 1: About You</h2>
          </div>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">1. Which best describes you? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Fashion Designer", "Clothing Brand", "Content Creator", "Small Business Owner", "Digital Marketer", "Other"].map(opt => (
                <div key={opt}>
                  <label className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <input type="radio" required name="role" value={opt} checked={formData.role === opt} onChange={(e) => updateField("role", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-600" />
                    <span className="text-slate-700 font-medium">{opt}</span>
                  </label>
                  {opt === "Other" && formData.role === "Other" && (
                    <Input className="mt-3" placeholder="Please specify..." value={formData.roleOther} onChange={(e: any) => updateField("roleOther", e.target.value)} required />
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">2. Which platforms do you post on regularly? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Instagram", "TikTok", "Facebook", "X (Twitter)", "LinkedIn", "YouTube Shorts"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="checkbox" checked={formData.platforms.includes(opt)} onChange={() => handleCheckbox("platforms", opt)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-600" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <div className="pt-8 pb-2 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">Section 2: Current Workflow</h2>
          </div>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">3. How often do you post content? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Multiple times a day", "Once a day", "A few times a week", "Once a week", "Rarely"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="freq" value={opt} checked={formData.postFrequency === opt} onChange={(e) => updateField("postFrequency", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">4. How do you currently manage your content? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Post manually every day", "Schedule posts using another tool", "I don't have a content schedule", "Someone manages it for me"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="manage" value={opt} checked={formData.manageWorkflow === opt} onChange={(e) => updateField("manageWorkflow", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">5. How much time do you spend each week creating and posting content? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Less than 2 hours", "2–5 hours", "5–10 hours", "More than 10 hours"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="time" value={opt} checked={formData.timeSpent === opt} onChange={(e) => updateField("timeSpent", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <div className="pt-8 pb-2 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">Section 3: Pain Points</h2>
          </div>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">6. What is the most frustrating part of posting on social media? <span className="text-red-500">*</span></Label>
            <Textarea required className="mt-4" rows={3} placeholder="Short answer..." value={formData.frustratingPart} onChange={(e: any) => updateField("frustratingPart", e.target.value)} />
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">7. Have you ever created content but forgotten to post it? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Frequently", "Sometimes", "Rarely", "Never"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="forgot" value={opt} checked={formData.forgottenPost === opt} onChange={(e) => updateField("forgottenPost", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">8. Have you ever stopped posting consistently because it became too time-consuming? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Yes", "No"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="stopped" value={opt} checked={formData.stoppedConsistently === opt} onChange={(e) => updateField("stoppedConsistently", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <div className="pt-8 pb-2 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">Section 4: The Idea</h2>
          </div>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900 leading-snug">9. If you could spend one day creating content for the entire week, then upload everything into one folder and have AI automatically: Write captions, Generate hashtags, Schedule posts, and Publish at the best times... How valuable would that be to you? <span className="text-red-500">*</span></Label>
            <div className="flex justify-between mt-6 px-2">
              {[1, 2, 3, 4, 5].map(opt => (
                <label key={opt} className="flex flex-col items-center space-y-2 cursor-pointer group">
                  <span className="text-xl">⭐</span>
                  <input type="radio" required name="value" value={opt.toString()} checked={formData.valueScore === opt.toString()} onChange={(e) => updateField("valueScore", e.target.value)} className="w-5 h-5 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-slate-700 font-bold">{opt}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
               <span>Not Valuable</span>
               <span>Extremely Valuable</span>
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">10. Which feature would save you the most time? (Choose up to 3) <span className="text-red-500">*</span></Label>
            <p className="text-sm text-slate-500 font-medium">Selected: {formData.saveTimeFeature.length}/3</p>
            <div className="space-y-3 mt-4">
              {["Automatic scheduling", "AI captions", "AI hashtags", "Automatic posting", "Best posting time recommendations", "Calendar view", "Analytics", "Approval before posting"].map(opt => {
                const isSelected = formData.saveTimeFeature.includes(opt);
                const disabled = !isSelected && formData.saveTimeFeature.length >= 3;
                return (
                  <label key={opt} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${disabled ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50' : 'cursor-pointer hover:bg-slate-50 border-slate-200'}`}>
                    <input type="checkbox" disabled={disabled} checked={isSelected} onChange={() => handleCheckbox("saveTimeFeature", opt, 3)} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-600" />
                    <span className="text-slate-700 font-medium">{opt}</span>
                  </label>
                )
              })}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">11. Would you trust AI to automatically publish your content without reviewing every post? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Yes", "Yes, but only after I approve it once", "Maybe", "No"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="trust" value={opt} checked={formData.trustAI === opt} onChange={(e) => updateField("trustAI", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">12. If this platform saved you 5–10 hours every week, would you consider paying for it? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Yes", "Maybe", "No"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="payAI" value={opt} checked={formData.payConsideration === opt} onChange={(e) => updateField("payConsideration", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900">13. What would stop you from using a platform like this? <span className="text-red-500">*</span></Label>
            <Textarea required className="mt-4" rows={3} placeholder="Short answer..." value={formData.stopUsing} onChange={(e: any) => updateField("stopUsing", e.target.value)} />
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200 transition-all">
            <Label className="text-lg text-slate-900">14. Would you like early access when we launch? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Yes", "No"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="early" value={opt} checked={formData.wantsEarlyAccess === opt} onChange={(e) => updateField("wantsEarlyAccess", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
            
            {formData.wantsEarlyAccess === "Yes" && (
              <div className="pt-6 mt-6 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <p className="text-sm text-slate-500 font-medium mb-4">Awesome! Please leave your details below so we can contact you.</p>
              </div>
            )}
          </Card>

          <Card className="p-6 md:p-8 space-y-4 shadow-sm border-slate-200">
            <Label className="text-lg text-slate-900 leading-snug">15. If you knew your social media would run automatically for the next 7 days, how likely would you be to spend one day each week creating all your content in advance? <span className="text-red-500">*</span></Label>
            <div className="space-y-3 mt-4">
              {["Very likely", "Likely", "Not sure", "Unlikely", "Very unlikely"].map(opt => (
                <label key={opt} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <input type="radio" required name="batch" value={opt} checked={formData.batchCreationLikelihood === opt} onChange={(e) => updateField("batchCreationLikelihood", e.target.value)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-slate-700 font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </Card>

          <div className="pt-8 pb-2 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">Section 5: Contact Details</h2>
          </div>

          <Card className="p-6 md:p-8 space-y-6 shadow-sm border-slate-200">
            <p className="text-sm text-slate-500 font-medium">Leave your details below so we can contact you.</p>
            <div>
              <Label className="mb-2 block text-slate-900 font-semibold">Name</Label>
              <Input placeholder="Jane Doe" value={formData.name} onChange={(e: any) => updateField("name", e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block text-slate-900 font-semibold">Email Address <span className="text-red-500">*</span></Label>
              <Input type="email" required placeholder="jane@example.com" value={formData.email} onChange={(e: any) => updateField("email", e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block text-slate-900 font-semibold">Phone Number / WhatsApp</Label>
              <Input type="tel" placeholder="+1234567890" value={formData.whatsapp} onChange={(e: any) => updateField("whatsapp", e.target.value)} />
            </div>
          </Card>

          {error && (
             <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-200 text-center">
               {error}
             </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
            {isSubmitting ? "Submitting..." : "Submit Survey"}
          </Button>
          
        </form>
      </div>
    </div>
  );
}
