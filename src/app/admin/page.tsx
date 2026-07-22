"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/mock-shadcn";

export default function AdminDashboard() {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [onlyEarlyAccess, setOnlyEarlyAccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/responses")
      .then(res => res.json())
      .then(data => {
        setResponses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredResponses = responses.filter(r => {
    if (onlyEarlyAccess && !r.wantsEarlyAccess) return false;
    if (filter) {
      const searchStr = `${r.name || ""} ${r.email || ""} ${r.whatsapp || ""}`.toLowerCase();
      if (!searchStr.includes(filter.toLowerCase())) return false;
    }
    return true;
  });

  const exportCSV = () => {
    const headers = [
      "ID", "Date", "Years In Business", "Accepts Interns", "Finding Methods",
      "Biggest Challenge", "Struggled Reliability", "Would Use Platform",
      "Valuable Features", "Would Pay", "Improvement", "Early Access",
      "Name", "Email", "WhatsApp"
    ];
    
    const rows = filteredResponses.map(r => [
      r.id, new Date(r.createdAt).toLocaleDateString(), r.yearsInBusiness, r.acceptsInterns,
      (r.findingMethods || "").replace(/,/g, ";"),
      (r.biggestChallenge || "").replace(/,/g, ";").replace(/\n/g, " "),
      r.struggledReliability, r.wouldUsePlatform,
      (r.valuableFeatures || "").replace(/,/g, ";"),
      r.wouldPay,
      (r.improvement || "").replace(/,/g, ";").replace(/\n/g, " "),
      r.wantsEarlyAccess ? "Yes" : "No",
      r.name || "", r.email || "", r.whatsapp || ""
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "survey_responses.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading responses...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Survey Analytics</h1>
            <p className="text-slate-500">View and analyze responses from fashion businesses.</p>
          </div>
          <button onClick={exportCSV} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition">
            Export to CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <p className="text-sm text-slate-500 font-medium">Total Responses</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">{responses.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-slate-500 font-medium">Early Access Sign-ups</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">
              {responses.filter(r => r.wantsEarlyAccess).length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-slate-500 font-medium">Would Pay for Premium</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">
              {responses.filter(r => r.wouldPay === "Yes").length}
            </p>
          </Card>
        </div>

        <Card className="p-6 overflow-hidden flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
            <input 
              type="text" 
              placeholder="Search by name, email, or whatsapp..." 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="w-full sm:w-96 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-slate-400 focus:outline-none"
            />
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
              <input type="checkbox" checked={onlyEarlyAccess} onChange={e => setOnlyEarlyAccess(e.target.checked)} className="rounded text-slate-900 focus:ring-slate-900" />
              Only show Early Access sign-ups
            </label>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Years in Biz</th>
                  <th className="p-4 font-semibold">Uses Interns?</th>
                  <th className="p-4 font-semibold">Would Use App?</th>
                  <th className="p-4 font-semibold">Early Access</th>
                  <th className="p-4 font-semibold">Contact Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredResponses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No responses found.</td>
                  </tr>
                ) : (
                  filteredResponses.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">{r.yearsInBusiness}</td>
                      <td className="p-4">{r.acceptsInterns}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.wouldUsePlatform === 'Definitely' ? 'bg-green-100 text-green-700' : r.wouldUsePlatform === 'Maybe' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {r.wouldUsePlatform}
                        </span>
                      </td>
                      <td className="p-4">
                        {r.wantsEarlyAccess ? <span className="text-green-600 font-bold">✓ Yes</span> : <span className="text-slate-400">No</span>}
                      </td>
                      <td className="p-4">
                        {r.wantsEarlyAccess ? (
                          <div className="text-xs space-y-1">
                            {r.name && <p><span className="font-medium">Name:</span> {r.name}</p>}
                            {r.email && <p><span className="font-medium">Email:</span> {r.email}</p>}
                            {r.whatsapp && <p><span className="font-medium">WA:</span> {r.whatsapp}</p>}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not provided</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
        
      </div>
    </div>
  );
}
