import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import VendorDirectory from "./pages/VendorDirectory";
import UploadProposal from "./pages/UploadProposal";
import Overview from "./pages/Overview";
import AICompare from "./pages/AICompare";

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
