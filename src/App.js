import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import TimeSlotManagement from './components/TimeSlotManagement';
import Bookings from './components/Bookings';
import Users from './components/Users';
import ResearchPaperManagement from './components/ResearchPaperManagement';
import VisaApplications from './components/VisaApplications';
import TermsManagement from './components/TermsManagement';
import Reports from './components/Reports';
import Settings from './components/Settings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default Route - Redirect to Admin Login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path='/admin/users' element={<Users/>}/>
        <Route path="/admin/timeslots" element={<TimeSlotManagement />} />
        <Route path="/admin/bookings" element={<Bookings/>}/>
        <Route path="/admin/research-papers" element={<ResearchPaperManagement />} />
        <Route path="/admin/visa-applications" element={<VisaApplications />} />
        <Route path="/admin/terms" element={<TermsManagement />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/settings" element={<Settings />} />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
