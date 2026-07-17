import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CostExplorer from './pages/CostExplorer';
import Budgets from './pages/Budgets';
import Alerts from './pages/Alerts';
import Forecasts from './pages/Forecasts';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <div className="min-h-screen bg-background text-textMain font-sans selection:bg-primary/30 transition-colors duration-300">

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
                <Route path="/budgets" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
                <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
                <Route path="/forecasts" element={<ProtectedRoute><Forecasts /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;
