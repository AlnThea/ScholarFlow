"use client";

import React, { useState, useEffect } from "react";
import type { CitationCandidate } from "@/lib/services";

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ref: CitationCandidate) => void;
  initialData?: CitationCandidate | null;
}

export function ReferenceModal({ isOpen, onClose, onSave, initialData }: ReferenceModalProps) {
  const [formData, setFormData] = useState<Partial<CitationCandidate>>({
    title: "",
    authors: [],
    year: new Date().getFullYear(),
    venue: "",
    doi: "",
    url: "",
  });
  
  const [authorsText, setAuthorsText] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
        setAuthorsText(initialData.authors?.join(", ") || "");
      } else {
        setFormData({
          title: "",
          authors: [],
          year: new Date().getFullYear(),
          venue: "",
          doi: "",
          url: "",
        });
        setAuthorsText("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process authors
    const authorsList = authorsText
      .split(",")
      .map(a => a.trim())
      .filter(a => a.length > 0);

    const newRef: CitationCandidate = {
      reference_id: initialData?.reference_id || `manual-${Date.now()}`,
      source: 'custom',
      title: formData.title || "Untitled",
      authors: authorsList.length > 0 ? authorsList : ["Unknown"],
      year: parseInt(String(formData.year || 2024)),
      doi: formData.doi || "",
      url: formData.url || "",
      venue: formData.venue || "",
      abstract: formData.abstract || "",
    };

    onSave(newRef);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? "Edit Reference" : "Add New Reference"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input 
              required
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
              placeholder="e.g. Attention Is All You Need"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Authors (comma separated) *
            </label>
            <input 
              required
              type="text" 
              value={authorsText} 
              onChange={e => setAuthorsText(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
              placeholder="e.g. Vaswani A., Shazeer N., Parmar N."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Publication Year
              </label>
              <input 
                type="number" 
                value={formData.year || ""} 
                onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="2023"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Venue / Journal
              </label>
              <input 
                type="text" 
                value={formData.venue || ""} 
                onChange={e => setFormData({...formData, venue: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="e.g. NeurIPS"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                DOI
              </label>
              <input 
                type="text" 
                value={formData.doi || ""} 
                onChange={e => setFormData({...formData, doi: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="10.1234/xyz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL
              </label>
              <input 
                type="url" 
                value={formData.url || ""} 
                onChange={e => setFormData({...formData, url: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:text-white"
                placeholder="https://..."
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save Reference
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
