import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ComplianceProvider } from './context/ComplianceContext';

// Landing Page Components
import Navbar from './components/Navbar';
import Problem from './components/Problem';
import Validation from './components/Validation';
import Solution from './components/Solution';
import SolutionValidation from './components/SolutionValidation';
import CaseStudies from './components/CaseStudies';
import AdminLogin from './components/AdminLogin';
import CTA from './components/CTA';
import Footer from './components/Footer';

// Admin Components
import AdminNavbar from './components/AdminNavbar';
import AdminFooter from './components/AdminFooter';
import BackendGate from './components/BackendGate';

// Admin Pages
import Dashboard from './pages/Dashboard';
import WebsiteScanner from './pages/WebsiteScanner';
import ApiHistory from './pages/ApiHistory';
import ComplianceChecker from './pages/ComplianceChecker';
import Monitoring from './pages/Monitoring';
import ActiveDefense from './pages/ActiveDefense';

// Layout for the public landing page
const LandingLayout = () => (
  <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30 selection:text-white overflow-x-hidden">
    <Navbar />
    <main>
      <Problem />
      <Validation />
      <Solution />
      <SolutionValidation />
      <CaseStudies />
      <AdminLogin />
      <CTA />
    </main>
    <Footer />
  </div>
);

// Layout for the internal Admin dashboard
const AdminLayout = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
    <AdminNavbar />
    <main className="flex-grow">
      <BackendGate>
        <Outlet />
      </BackendGate>
    </main>
    <AdminFooter />
  </div>
);

function App() {
  return (
    <ComplianceProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingLayout />} />

          {/* Protected Admin Routes (Mocked) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="scanner" element={<WebsiteScanner />} />
            <Route path="history" element={<ApiHistory />} />
            <Route path="compliance" element={<ComplianceChecker />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="defense" element={<ActiveDefense />} />
          </Route>
        </Routes>
      </Router>
    </ComplianceProvider>
  );
}

export default App;
