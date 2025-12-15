
import React, { useState, useEffect } from 'react';
import { getCorpusItems } from '../services/db';
import { CorpusItem } from '../types';
import { Search, BookOpen, Scale, Gavel } from 'lucide-react';

const CorpusBrowser: React.FC = () => {
  const [items, setItems] = useState<CorpusItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CorpusItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initial load of all rules
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    // For now, we fetch all and filter client-side.
    // A more advanced implementation would use IndexedDB's querying capabilities more deeply.
    const allItems = await getCorpusItems('Source', 'Rule'); // Get all Rules
    
    const filtered = allItems.filter(item => 
      (item.Title && item.Title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.Text && item.Text.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.RuleNumber_Section && item.RuleNumber_Section.includes(searchTerm))
    );

    setItems(filtered);
    setSelectedItem(filtered[0] || null);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
      {/* Sidebar List */}
      <div className="w-full lg:w-1/3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search Corpus (e.g., 'Rule 12')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-200 focus:border-indigo-500 focus:outline-none text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="text-center p-4 text-slate-500">Loading...</div>
          ) : items.length > 0 ? (
            items.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center justify-between group ${selectedItem?.id === item.id ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-200' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <div>
                  <div className="font-bold">{item.Citation}</div>
                  <div className="text-xs opacity-70 truncate max-w-[200px]">{item.Title}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center p-4 text-slate-500">No items found.</div>
          )}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 bg-slate-100 text-slate-900 rounded-xl overflow-hidden flex flex-col shadow-2xl">
        {selectedItem ? (
          <>
            <div className="p-6 border-b border-slate-300 bg-slate-200">
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">{selectedItem.Citation}</h2>
              <p className="text-sm text-slate-600 font-medium">{selectedItem.Title}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-8 font-serif text-base leading-relaxed">
              <h3 className="font-bold text-slate-500 uppercase text-xs mb-4 tracking-wider">Full Text</h3>
              <pre className="whitespace-pre-wrap">{selectedItem.Text}</pre>
              
              {selectedItem.StrategicNotes && (
                <div className="mt-8 pt-6 border-t border-slate-300">
                  <h3 className="font-bold text-slate-500 uppercase text-xs mb-4 tracking-wider">Strategic Notes</h3>
                  <p className="italic text-slate-700">{selectedItem.StrategicNotes}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <BookOpen className="w-16 h-16 mb-4 opacity-20" />
            <p>Select an item to view its details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorpusBrowser;
