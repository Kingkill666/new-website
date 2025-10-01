"use client"

import React from "react";
import { AppProviders } from "./providers/AppProviders";
import { Header } from "./components/Header";
import { StakingDashboard } from "./components/StakingDashboard";

export default function StakingPage() {
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
