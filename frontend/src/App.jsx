import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CostExplorer from './pages/CostExplorer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-textMain font-sans selection:bg-primary/30">

        {/* Sidebar — Fixed on the left */}
        <Sidebar />

        {/* Main Content Area — Pushed right by sidebar width */}
        <div className="ml-64 min-h-screen flex flex-col">

          {/* Header — Sticky at the top */}
          <Header title="Overview" />

          {/* Page Content */}
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/explorer" element={<ProtectedRoute><CostExplorer /></ProtectedRoute>} />
              <Route path="/budgets" element={<div className="text-textMuted">Budgets — Coming Soon</div>} />
              <Route path="/alerts" element={<div className="text-textMuted">Alerts — Coming Soon</div>} />
              <Route path="/forecasts" element={<div className="text-textMuted">Forecasts — Coming Soon</div>} />
              <Route path="/chat" element={<div className="text-textMuted">AI Assistant — Coming Soon</div>} />
              <Route path="/settings" element={<div className="text-textMuted">Settings — Coming Soon</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
