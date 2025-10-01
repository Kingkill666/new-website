"use client"

import React from "react";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { AppProviders } from "./providers/AppProviders";

export const dynamicParams = true;

function StakingPageContent() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <img
                  src="/images/vmf-logo-new.png"
                  alt="VMF Logo"
                  className="w-8 h-8 mr-3"
                />
                <h1 className="text-xl font-bold text-gray-900">VMF Staking</h1>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectKitButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Connect your wallet to start staking VMF tokens and earning rewards.
            </p>
            <ConnectKitButton />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                VMF Staking Platform
              </h2>
              <p className="text-lg text-gray-600">
                Welcome to VMF Staking! Connect your wallet to start earning rewards.
              </p>
            </div>

            {/* Staking Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Current APR
                </h3>
                <p className="text-3xl font-bold text-green-600">7%</p>
                <p className="text-sm text-gray-500 mt-2">
                  Annual Percentage Rate
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Staking Periods
                </h3>
                <p className="text-3xl font-bold text-blue-600">30-90</p>
                <p className="text-sm text-gray-500 mt-2">
                  Days minimum
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your Wallet
                </h3>
                <p className="text-sm font-mono text-gray-600">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Connected Address
                </p>
              </div>
            </div>

            {/* Coming Soon Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                Staking Features Coming Soon!
              </h3>
              <p className="text-blue-700">
                We're working hard to bring you the full VMF staking experience. 
                The complete staking interface will be available soon.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function StakingPage() {
  return (
    <AppProviders>
      <StakingPageContent />
    </AppProviders>
  );
}
