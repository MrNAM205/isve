
import React, { useState, useRef } from 'react';
import { 
  ScanEye, 
  BrainCircuit, 
  ShieldAlert, 
  FileText, 
  ChevronRight, 
  Loader2,
  Upload,
  File,
  X,
  FileImage
} from 'lucide-react';
import { scanDocumentSemantics, scanDocumentSemanticsFromMedia } from '../services/geminiService';
import { SemanticAnalysisResult, NotifyFn } from '../types';

interface SemanticScannerProps {
  notify?: NotifyFn;
}

const SemanticScanner: React.FC<SemanticScannerProps> = ({ notify }) => {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SemanticAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Increased limit to 15MB to support larger documents/scans
    if (file.size > 15 * 1024 * 1024) {
      const msg = "File is too large. Max size is 15MB for inline analysis.";
      setError(msg);
      notify?.('error', msg);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Basic preview for images, or generic icon for PDF
    if (file.type.startsWith('image/')) {
       const reader = new FileReader();
       reader.onload = (e) => {
         setFilePreview(e.target?.result as string);
       };
       reader.readAsDataURL(file);
    } else {
       setFilePreview(null);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScan = async () => {
    if (!inputText.trim() && !selectedFile) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      let responseText: string | undefined;

      if (selectedFile) {
         // Process File
         const reader = new FileReader();
         const base64Promise = new Promise<string>((resolve, reject) => {
           reader.onload = () => {
              const result = reader.result as string;
              // Robust base64 extraction
              if (typeof result === 'string') {
                const parts = result.split(',');
                const base64 = parts.length > 1 ? parts[1] : result;
                resolve(base64);
              } else {
                reject(new Error("Failed to read file as string"));
              }
           };
           reader.onerror = reject;
           reader.readAsDataURL(selectedFile);
         });

         const base64Data = await base64Promise;
         responseText = await scanDocumentSemanticsFromMedia(base64Data, selectedFile.type);

      } else {
         // Process Text
         responseText = await scanDocumentSemantics(inputText);
      }

      if (responseText) {
        // Clean the response text to ensure it's valid JSON (remove potential Markdown code blocks)
        const cleanedText = responseText.replace(/```json\n/g, '').replace(/\n```/g, '');
        const parsed = JSON.parse(cleanedText) as SemanticAnalysisResult;
        setResult(parsed);
        notify?.('success', 'Semantic analysis completed successfully.');
      }
    } catch (err) {
      console.error(err);
      const msg = "Analysis failed. The document was too complex or the sovereign uplink was interrupted.";
      setError(msg);
      notify?.('error', msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Input Section */}
      <div className="flex-1 flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2 text-slate-200">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold">Input Document</h2>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-xs font-mono text-slate-500 hidden sm:inline">PDF, JPG, PNG (MAX 15MB)</span>
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-indigo-400 transition-colors"
               title="Upload Document"
             >
               <Upload className="w-4 h-4" />
             </button>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleFileUpload} 
               className="hidden" 
               accept="application/pdf,image/png,image/jpeg,image/jpg"
             />
          </div>
        </div>
        
        <div className="flex-1 p-4 relative">
          {selectedFile ? (
            <div className="w-full h-full bg-slate-950 border border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-400 relative group">
               <button 
                 onClick={clearFile}
                 className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors z-10"
               >
                 <X className="w-4 h-4" />
               </button>
               
               {filePreview ? (
                 <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-4">
                    <img src={filePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded opacity-80" />
                 </div>
               ) : (
                 <div className="flex flex-col items-center gap-4">
                    <FileImage className="w-16 h-16 text-indigo-500/40" />
                    <div className="text-center">
                      <p className="text-slate-200 font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                 </div>
               )}
            </div>
          ) : (
            <textarea 
              className="w-full h-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              placeholder="Paste text from court summons, collection letters, or contracts here... OR click the upload icon above to analyze PDF/Image files."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900">
          <button 
            onClick={handleScan}
            disabled={isAnalyzing || (!inputText.trim() && !selectedFile)}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-indigo-200">Dialogos Thinking...</span>
              </>
            ) : (
              <>
                <ScanEye className="w-4 h-4" />
                <span>Initiate Semantic Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="flex-1 flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2 text-slate-200">
            <BrainCircuit className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold">Analysis Matrix</h2>
          </div>
          {isAnalyzing && (
             <span className="text-xs font-mono text-amber-500 animate-pulse">USING GEMINI 3.0 PRO REASONING</span>
          )}
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950/50">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {!result && !isAnalyzing && !error && (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <ScanEye className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm">Ready to decode legalese and identify traps.</p>
              <p className="text-xs mt-2 opacity-50">Gemini 3.0 Pro Thinking Enabled (32k tokens)</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Summary */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Executive Summary</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{result.summary}</p>
              </div>

              {/* Jurisdiction */}
              <div className="flex items-center gap-3 p-3 rounded bg-slate-900 border border-slate-800">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs text-slate-400">Jurisdiction Claimed:</span>
                <span className="text-sm font-semibold text-red-400">{result.jurisdiction_claimed}</span>
              </div>

              {/* Traps */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-500 mb-3">
                  <ShieldAlert className="w-4 h-4" />
                  Identified Semantic Traps
                </h3>
                <ul className="space-y-2">
                  {result.traps.map((trap, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300 p-2 rounded bg-amber-500/5 border border-amber-500/10">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      {trap}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Strategy */}
              <div className="border-t border-slate-800 pt-4">
                 <h3 className="text-sm font-semibold text-indigo-400 mb-3">Rebuttal Strategy</h3>
                 <p className="text-sm text-slate-300 mb-4">{result.rebuttal_strategy}</p>
                 
                 <div className="space-y-2">
                    {result.suggested_affidavit_points.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <ChevronRight className="w-3 h-3 text-indigo-500" />
                        {point}
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SemanticScanner;