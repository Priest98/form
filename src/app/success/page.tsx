import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
          Thank You! 🎉
        </h1>
        
        <div className="space-y-4 text-slate-600 mb-8 leading-relaxed">
          <p>
            Your feedback is incredibly valuable and will help us build a platform that genuinely supports the fashion industry.
          </p>
          <p>
            If you signed up for early access, we&apos;ll notify you as soon as we launch.
          </p>
          <p className="font-medium text-slate-800">
            Thank you for helping shape the future of fashion internships.
          </p>
        </div>
        
        <Link 
          href="/"
          className="inline-flex w-full justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
        >
          Close Survey
        </Link>
      </div>
    </div>
  );
}
