import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import VendorDirectory from "./pages/VendorDirectory";
import UploadProposal from "./pages/UploadProposal";

// Placeholder pages for now
const Overview = () => (
  <div>
    <h2 className="text-2xl font-bold tracking-tight text-slate-50 mb-6">Overview</h2>
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <p className="text-slate-400">Welcome to VendorVibe. This page will display ROI metrics and high-level summaries.</p>
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
