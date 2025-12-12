
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, PenTool, Loader2, Copy } from 'lucide-react';
import { Template } from '../types';
import { getTemplates, saveTemplate, deleteCustomTemplate } from '../services/storage';
import { generateCustomDocument } from '../services/geminiService';

const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'draft'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  // Form states
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({});
  const [draftPrompt, setDraftPrompt] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  const handleCreate = () => {
    if (!newTemplate.name || !newTemplate.systemInstruction) return;
    const t: Template = {
      id: crypto.randomUUID(),
      name: newTemplate.name,
      description: newTemplate.description || 'Custom Template',
      systemInstruction: newTemplate.systemInstruction,
      userPromptTemplate: newTemplate.userPromptTemplate || 'Draft a document based on these details: {{details}}',
      isCustom: true
    };
    saveTemplate(t);
    setTemplates(getTemplates());
    setView('list');
    setNewTemplate({});
  };

  const handleDelete = (id: string) => {
    deleteCustomTemplate(id);
    setTemplates(getTemplates());
  };

  const startDraft = (t: Template) => {
    setSelectedTemplate(t);
    setDraftPrompt(t.userPromptTemplate);
    setView('draft');
    setGeneratedDoc('');
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !draftPrompt) return;
    setIsGenerating(true);
    try {
      const text = await generateCustomDocument(selectedTemplate.systemInstruction, draftPrompt);
      setGeneratedDoc(text || 'No response generated.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-teal-500" />
            Template Library
          </h2>
          <p className="text-slate-400">Manage custom document templates and generate content.</p>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => setView('create')}
            className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Create Template
          </button>
        )}
        {view !== 'list' && (
          <button 
            onClick={() => setView('list')}
            className="text-slate-400 hover:text-white px-4 py-2"
          >
            Back to Library
          </button>
        )}
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-teal-500/40 transition group relative">
              <h3 className="font-bold text-slate-200 text-lg">{t.name}</h3>
              <p className="text-sm text-slate-400 mt-2 min-h-[40px]">{t.description}</p>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase ${t.isCustom ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-800 text-slate-500'}`}>
                  {t.isCustom ? 'Custom' : 'System'}
                </span>
                <button 
                  onClick={() => startDraft(t)}
                  className="text-sm text-teal-400 hover:underline flex items-center gap-1"
                >
                  Use Template <PenTool className="w-3 h-3" />
                </button>
              </div>

              {t.isCustom && (
                <button 
                  onClick={() => handleDelete(t.id)}
                  className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create View */}
      {view === 'create' && (
        <div className="max-w-2xl mx-auto w-full bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xl font-semibold text-white mb-4">Design New Template</h3>
          <input 
            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white" 
            placeholder="Template Name"
            value={newTemplate.name || ''}
            onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
          />
          <input 
            className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white" 
            placeholder="Description"
            value={newTemplate.description || ''}
            onChange={e => setNewTemplate({...newTemplate, description: e.target.value})}
          />
          <div className="space-y-2">
             <label className="text-xs font-mono text-slate-500 uppercase">System Prompt (Context/Persona)</label>
             <textarea 
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white h-24" 
                placeholder="e.g. You are a commercial law expert..."
                value={newTemplate.systemInstruction || ''}
                onChange={e => setNewTemplate({...newTemplate, systemInstruction: e.target.value})}
             />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-mono text-slate-500 uppercase">User Prompt Template (Default Input)</label>
             <textarea 
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white h-24" 
                placeholder="e.g. Draft a notice for {{party}} regarding {{issue}}..."
                value={newTemplate.userPromptTemplate || ''}
                onChange={e => setNewTemplate({...newTemplate, userPromptTemplate: e.target.value})}
             />
          </div>
          <button 
            onClick={handleCreate}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-lg font-medium"
          >
            Save Template
          </button>
        </div>
      )}

      {/* Draft View */}
      {view === 'draft' && selectedTemplate && (
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="font-bold text-slate-200 mb-4">{selectedTemplate.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{selectedTemplate.description}</p>
              <label className="text-xs font-mono text-slate-500 uppercase mb-2 block">Drafting Details</label>
              <textarea 
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white h-48 focus:border-teal-500 focus:outline-none"
                value={draftPrompt}
                onChange={e => setDraftPrompt(e.target.value)}
              />
              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-4 bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                Generate Document
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-100 rounded-xl p-8 text-slate-900 overflow-y-auto relative shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-12 bg-slate-200 border-b border-slate-300 flex items-center justify-between px-4">
                <span className="text-xs font-bold text-slate-500 uppercase">Document Preview</span>
                <button className="text-slate-500 hover:text-slate-800" title="Copy Text">
                   <Copy className="w-4 h-4" />
                </button>
             </div>
             <div className="mt-8 font-serif text-sm leading-relaxed whitespace-pre-wrap">
               {generatedDoc || <span className="text-slate-400 italic">Document will appear here...</span>}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateLibrary;