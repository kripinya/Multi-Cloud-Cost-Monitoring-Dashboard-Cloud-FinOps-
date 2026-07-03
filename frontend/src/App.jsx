import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MetricCard from './components/ui/MetricCard'; // <-- Look! We imported your new component

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
              <Route path="/" element={
                <div className="space-y-6">

                  {/* Notice how clean this is now! We are using your MetricCard component */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard label="Total Spend" value="$24,567.89" change="+8.2%" color="text-primary" />
                    <MetricCard label="AWS" value="$10,234.56" change="+12%" color="text-aws" />
                    <MetricCard label="Azure" value="$7,890.12" change="+5.1%" color="text-azure" />
                  </div>

                </div>
              } />
              <Route path="/explorer" element={<div className="text-textMuted">Cost Explorer — Coming Soon</div>} />
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
