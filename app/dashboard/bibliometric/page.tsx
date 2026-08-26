"use client";

import React, { useState } from "react";

export default function BibliometricPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    // TODO: Implement fetch to /api/bibliometric/search
    setTimeout(() => setIsSearching(false), 1500);
  };

  return (
    <div className="flex flex-col w-full h-full p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bibliometric Analysis
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Discover research trends, keyword networks, and literature gaps based on global metadata.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a research topic (e.g. Machine Learning in Education)"
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isSearching ? "Analyzing..." : "Analyze Literature"}
            </button>
          </form>
        </div>

        {/* Placeholder for Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Timeline Chart Placeholder */}
          <div className="col-span-1 lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-80 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="font-medium">Publication Timeline</p>
            <p className="text-sm">Awaiting search query...</p>
          </div>

          {/* Network Graph Placeholder */}
          <div className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-80 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <p className="font-medium">Keyword Co-occurrence Network</p>
            <p className="text-sm text-center max-w-sm mt-1">
              Visualize connections between topics, authors, and citations based on OpenAlex data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
