import React from "react";
import { AppProviders } from "./providers/AppProviders";
import { Header } from "./components/Header";
import { StakingDashboard } from "./components/StakingDashboard";

function App() {
  return (
    <AppProviders>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <StakingDashboard />
        </main>
      </div>
    </AppProviders>
  );
}

export default App;
