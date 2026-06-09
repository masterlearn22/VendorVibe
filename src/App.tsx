import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import VendorDirectory from "./pages/VendorDirectory";
import UploadProposal from "./pages/UploadProposal";
import Overview from "./pages/Overview";
import AICompare from "./pages/AICompare";
import Messages from "./pages/Messages";
import Priority from "./pages/Priority";
import Alerts from "./pages/Alerts";
import Financials from "./pages/Financials";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="vendors" element={<VendorDirectory />} />
          <Route path="upload" element={<UploadProposal />} />
          <Route path="compare" element={<AICompare />} />
          <Route path="messages" element={<Messages />} />
          <Route path="priority" element={<Priority />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="financials" element={<Financials />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
