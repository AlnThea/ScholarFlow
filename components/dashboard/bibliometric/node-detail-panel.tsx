import React from "react";
import { IconTags } from "@tabler/icons-react";

interface NodeDetailPanelProps {
  selectedNode: any;
  onClose: () => void;
}

const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#94a3b8"];

export function NodeDetailPanel({ selectedNode, onClose }: NodeDetailPanelProps) {
  if (!selectedNode) return null;
  return (
    <>
                 {/* Node Detail Panel */}
                 
                   <div className="absolute top-6 right-6 z-20 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                     <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50">
                       <div>
                         <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1">
                           Node Details
                         </div>
                         <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 capitalize leading-tight">
                           {selectedNode.id}
                         </h3>
                       </div>
                       <button 
                         onClick={() => onClose()}
                         className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                       </button>
                     </div>
                     
                     <div className="p-5 space-y-5">
                       <div className="grid grid-cols-3 gap-2">
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                           <div className="text-xl font-bold text-slate-700 dark:text-slate-200">{selectedNode.val}</div>
                           <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Occur</div>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                           <div className="text-xl font-bold text-slate-700 dark:text-slate-200">{selectedNode.links?.length || 0}</div>
                           <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Degree</div>
                         </div>
                         <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                           <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{selectedNode.centrality || 0}</div>
                           <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Centrality</div>
                         </div>
                       </div>
                       
                       {selectedNode.neighbors && selectedNode.neighbors.length > 0 && (
                         <div className="mb-4">
                           <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1">
                             <IconTags className="w-3.5 h-3.5 text-slate-400" />
                             Top Connections
                           </h4>
                           <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                             {selectedNode.neighbors.slice(0, 15).map((neighbor: string, idx: number) => (
                               <span key={idx} className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                                 {neighbor}
                               </span>
                             ))}
                             {selectedNode.neighbors.length > 15 && (
                               <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-md text-xs font-medium text-slate-500">
                                 +{selectedNode.neighbors.length - 15} more
                               </span>
                             )}
                           </div>
                         </div>
                       )}

                       {selectedNode.documents && selectedNode.documents.length > 0 && (
                         <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                           <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center justify-between">
                             <span>Source Documents</span>
                             <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 py-0.5 px-2 rounded-full text-[10px]">
                               {selectedNode.documents.length}
                             </span>
                           </h4>
                           <div className="max-h-48 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                             {selectedNode.documents.map((doc: any, idx: number) => (
                               <div key={idx} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-default group">
                                 <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                   {doc.title || "Untitled Document"}
                                 </div>
                                 <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                                   <span className="truncate max-w-[150px]">
                                     {doc.authors && doc.authors.length > 0 
                                       ? (Array.isArray(doc.authors) ? doc.authors.join(", ") : doc.authors) 
                                       : "Unknown Author"}
                                   </span>
                                   <span className="font-medium bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                     {doc.year || "N/A"}
                                   </span>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                       
                       <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: colors[selectedNode.group % colors.length] }}></div>
                         <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Cluster Group {selectedNode.group}</span>
                       </div>
                     </div>
                   </div>
                 


    </>
  );
}
