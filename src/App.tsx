import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Placeholder pages for now
const Overview = () => (
  <div>
    <h2 className="text-2xl font-bold tracking-tight text-slate-50 mb-6">Overview</h2>
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <p className="text-slate-400">Welcome to VendorVibe. This page will display ROI metrics and high-level summaries.</p>
    </div>
  </div>
);

const VendorDirectory = () => (
  <div>
    <h2 className="text-2xl font-bold tracking-tight text-slate-50 mb-6">Vendor Directory</h2>
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <p className="text-slate-400">This page will list all vendors from the Supabase database.</p>
    </div>
  </div>
);

const UploadProposal = () => (
  <div>
    <h2 className="text-2xl font-bold tracking-tight text-slate-50 mb-6">Upload Proposal</h2>
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <p className="text-slate-400">Here you will upload PDF files for Gemini AI extraction.</p>
    </div>
  </div>
);

const AICompare = () => (
  <div>
    <h2 className="text-2xl font-bold tracking-tight text-slate-50 mb-6">AI Compare</h2>
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <p className="text-slate-400">Compare multiple vendors side-by-side with AI recommendations.</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="vendors" element={<VendorDirectory />} />
          <Route path="upload" element={<UploadProposal />} />
          <Route path="compare" element={<AICompare />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
