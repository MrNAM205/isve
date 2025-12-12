
import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Trash2,
  Eye,
  Plus,
  SearchX
} from 'lucide-react';
import { parseIdentityDocument } from '../services/geminiService';
import { saveDocumentToVault, getDocumentsFromVault, deleteDocumentFromVault, VaultDocument } from '../services/storage';
import { NotifyFn } from '../types';

interface DocumentVaultProps {
  searchQuery?: string;
  notify?: NotifyFn;
}

const DocumentVault: React.FC<DocumentVaultProps> = ({ searchQuery = '', notify }) => {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const docs = getDocumentsFromVault();
    // Sort by date desc
    setDocuments(docs.sort((a, b) => new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime()));
  };

  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc => {
    const query = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(query) ||
      doc.type.toLowerCase().includes(query) ||
      (doc.metadata.fullName && doc.metadata.fullName.toLowerCase().includes(query)) ||
      (doc.metadata.documentNumber && doc.metadata.documentNumber.toLowerCase().includes(query))
    );
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setUploadError(null);
    setPreviewData(null);
    setCurrentFile(file);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        const mimeType = file.type;

        const jsonString = await parseIdentityDocument(base64Data, mimeType);
        if (jsonString) {
          const cleaned = jsonString.replace(/```json\n/g, '').replace(/\n```/g, '');
          const parsed = JSON.parse(cleaned);
          setPreviewData(parsed);
          notify?.('success', 'Document metadata extracted successfully.');
        }
      } catch (err) {
        const msg = "Failed to analyze document. Ensure the image is clear.";
        setUploadError(msg);
        notify?.('error', msg);
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      const msg = "Error reading file from disk.";
      setUploadError(msg);
      notify?.('error', msg);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!previewData || !currentFile) return;
    
    try {
      setIsUploading(true);
      await saveDocumentToVault({
        type: previewData.documentType || "Unknown",
        name: currentFile.name,
        metadata: previewData
      });
      
      // Success
      loadDocuments();
      notify?.('success', 'Document secured in vault.');
      setPreviewData(null);
      setCurrentFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      notify?.('error', 'Failed to save document to storage.');
      setUploadError("Failed to save document to vault.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDocumentFromVault(id);
    notify?.('info', 'Document removed from vault.');
    loadDocuments();
  };

  const handleCancel = () => {
    setPreviewData(null);
    setCurrentFile(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-500" />
            Secure Document Vault
          </h2>
          <p className="text-slate-400 mt-1">
            Upload and authenticate identity documents. Metadata is extracted by AI and stored securely.
          </p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Upload New Document
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
      </div>

      {searchQuery && (
        <div className="text-sm text-slate-400">
          Showing results for: <span className="text-amber-500 font-mono">"{searchQuery}"</span>
        </div>
      )}

      {uploadError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400" role="alert">
          <AlertTriangle className="w-5 h-5" />
          {uploadError}
        </div>
      )}

      {/* Upload Preview / Verification Stage */}
      {(isUploading || previewData) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-white">
               {isUploading && !previewData ? "Analyzing Document..." : "Verify Extracted Metadata"}
             </h3>
             {currentFile && (
               <span className="text-xs font-mono text-slate-500">{currentFile.name}</span>
             )}
          </div>

          {isUploading && !previewData ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
               <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
               <p className="text-sm text-purple-300">JARVIS is scanning for identity markers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                 {/* Form fields for review */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                       <label className="text-xs text-slate-500 uppercase">Document Type</label>
                       <p className="text-slate-200 font-medium">{previewData.documentType}</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                       <label className="text-xs text-slate-500 uppercase">ID Number</label>
                       <p className="text-slate-200 font-medium">{previewData.documentNumber || "N/A"}</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800 col-span-2">
                       <label className="text-xs text-slate-500 uppercase">Full Name</label>
                       <p className="text-slate-200 font-medium">{previewData.fullName}</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                       <label className="text-xs text-slate-500 uppercase">DOB</label>
                       <p className="text-slate-200 font-medium">{previewData.dateOfBirth}</p>
                    </div>
                    <div className="p-3 bg-slate-950 rounded border border-slate-800">
                       <label className="text-xs text-slate-500 uppercase">Issuing Authority</label>
                       <p className="text-slate-200 font-medium">{previewData.issuingStateOrAuthority || "N/A"}</p>
                    </div>
                 </div>
              </div>
              <div className="flex flex-col justify-center items-center gap-4 bg-slate-950/50 rounded-lg border border-dashed border-slate-700 p-4">
                 <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                    <p className="text-emerald-400 font-medium">Extraction Successful</p>
                    <p className="text-sm text-slate-500 mt-1">Please verify accuracy before saving to vault.</p>
                 </div>
                 <div className="flex gap-3 w-full mt-4">
                    <button 
                      onClick={handleCancel}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isUploading}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors flex items-center justify-center gap-2"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin"/> : "Confirm & Save"}
                    </button>
                 </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-4">
        {documents.length === 0 && !previewData && !searchQuery && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
            <Shield className="w-16 h-16 mb-4 opacity-20" />
            <p>No documents in the vault.</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 text-purple-400 hover:text-purple-300 hover:underline"
            >
              Upload your first document
            </button>
          </div>
        )}

        {searchQuery && filteredDocuments.length === 0 && (
           <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-500">
             <SearchX className="w-12 h-12 mb-2 opacity-50" />
             <p>No matching documents found.</p>
           </div>
        )}

        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-purple-500/30 transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-slate-950 rounded-lg">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h4 className="font-medium text-slate-200 truncate">{doc.type}</h4>
            <p className="text-xs text-slate-500 truncate mb-4">{doc.name}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Name</span>
                <span className="text-slate-300 font-mono">{doc.metadata.fullName}</span>
              </div>
               <div className="flex justify-between text-xs">
                <span className="text-slate-500">ID #</span>
                <span className="text-slate-300 font-mono">{doc.metadata.documentNumber || "N/A"}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-600">
               <span>Added {new Date(doc.dateUploaded).toLocaleDateString()}</span>
               <span className="bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded">VERIFIED</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentVault;