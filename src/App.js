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

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
