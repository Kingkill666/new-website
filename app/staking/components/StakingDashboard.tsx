import { useState } from "react";
import { StakingForm } from "./StakingForm";
import { StakesList } from "./StakesList";

export const StakingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"stake" | "view">("stake");

  return (
    <div className="bg-gray-50">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("stake")}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === "stake"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Stake
            </button>
            <button
              onClick={() => setActiveTab("view")}
              className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                activeTab === "view"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              View Stakes
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "stake" ? <StakingForm /> : <StakesList />}
      </div>
    </div>
  );
};
