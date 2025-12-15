import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ScrollText, 
  ScanEye, 
  FileKey, 
  LayoutDashboard, 
  Menu,
  X,
  Scale,
  Database,
  Vault,
  Users,
  BookOpen,
  ShieldAlert,
  FileText,
  LogOut,
  Search,
  Bell,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Fingerprint,
  Stamp,
  PhoneCall,
  Landmark,
  ShieldCheck,
  Milestone,
  Gavel,
  Clock
} from 'lucide-react';
import Shepherd from 'shepherd.js';

import Dashboard from './components/Dashboard';
import SemanticScanner from './components/SemanticScanner';
import InstrumentParser from './components/InstrumentParser';
import StatusCorrection from './components/StatusCorrection';
import A4VTender from './components/A4VTender';
import UCCFiling from './components/UCCFiling';
import DocumentVault from './components/DocumentVault';
import CreditorBook from './components/CreditorBook';
import LegalResources from './components/LegalResources';
import FCRADispute from './components/FCRADispute';
import TemplateLibrary from './components/TemplateLibrary';
import LoginScreen from './components/LoginScreen';
import IdentityProfile from './components/IdentityProfile';
import EndorsementAllonge from './components/EndorsementAllonge';
import TeleCounsel from './components/TeleCounsel';
import TrustBuilder from './components/TrustBuilder';
import NameGuard from './components/NameGuard';
import FilingNavigator from './components/FilingNavigator';
import CourtroomConveyance from './components/CourtroomConveyance';
import RemedyTracker from './components/RemedyTracker';

import { useAppContext } from './contexts/AppContext';
import { UserProfile, Tab, DraftDisputeData } from './types';

const App: React.FC = () => {
  const { 
    user, 
    login, 
    logout, 
    notifications,
    removeNotification,
    activeTab, 
    setActiveTab, 
    draftDisputeData, 
    setDraftDisputeData,
    notify 
  } = useAppContext();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Shepherd Tour Initialization
  useEffect(() => {
    if (user && !localStorage.getItem('tutorial_completed')) {
      const timer = setTimeout(() => {
        try {
          const tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
              classes: 'shadow-md bg-purple-dark',
              scrollTo: true
            }
          });

          tour.addStep({
            id: 'intro',
            text: 'Welcome to VeroBrix. This engine is designed for sovereign document analysis and remedy generation. Let us show you around.',
            attachTo: { element: '#app-logo', on: 'bottom' },
            buttons: [{ text: 'Next', action: tour.next, classes: 'shepherd-button-primary' }]
          });

          tour.addStep({
            id: 'search',
            text: 'Use the Global Search to instantly find files in your Document Vault.',
            attachTo: { element: '#global-search', on: 'bottom' },
            buttons: [{ text: 'Back', action: tour.back }, { text: 'Next', action: tour.next, classes: 'shepherd-button-primary' }]
          });

          tour.addStep({
            id: 'nav-modules',
            text: 'Access powerful AI modules here. "Dialogos" scans for legal traps, while "JARVIS" extracts financial data.',
            attachTo: { element: '#nav-intelligence', on: 'right' },
            buttons: [{ text: 'Back', action: tour.back }, { text: 'Next', action: tour.next, classes: 'shepherd-button-primary' }]
          });

          tour.addStep({
            id: 'nav-remedy',
            text: 'Generate Affidavits, UCC filings, and disputes in the Remedy section.',
            attachTo: { element: '#nav-remedy', on: 'right' },
            buttons: [
              { text: 'Back', action: tour.back },
              { text: 'Finish', action: () => { localStorage.setItem('tutorial_completed', 'true'); tour.complete(); }, classes: 'shepherd-button-primary' }
            ]
          });

          tour.start();
        } catch (err) {
          console.warn("Shepherd tutorial initialization failed:", err);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query && activeTab !== 'document-vault') {
      setActiveTab('document-vault');
    }
  };

  const startTutorial = () => {
    localStorage.removeItem('tutorial_completed');
    window.location.reload();
  };

  const handleNavChange = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleDraftDispute = (data: DraftDisputeData) => {
    setDraftDisputeData(data);
    handleNavChange('fcra-dispute');
  };

  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onChangeTab={handleNavChange} />;
      case 'document-vault':
        return <DocumentVault searchQuery={searchQuery} notify={notify} />;
      case 'semantic-scanner':
        return <SemanticScanner notify={notify} />;
      case 'instrument-parser':
        return <InstrumentParser notify={notify} onDraftAllonge={() => handleNavChange('endorsement-allonge')} onDraftDispute={handleDraftDispute} />;
      case 'creditor-book':
        return <CreditorBook />;
      case 'legal-resources':
        return <LegalResources notify={notify} />;
      case 'status-correction':
        return <StatusCorrection />;
      case 'a4v-tender':
        return <A4VTender />;
      case 'ucc-filing':
        return <UCCFiling />;
      case 'fcra-dispute':
        return <FCRADispute notify={notify} initialData={draftDisputeData} />;
      case 'templates':
        return <TemplateLibrary />;
      case 'identity-profile':
        return <IdentityProfile notify={notify} />;
      case 'endorsement-allonge':
        return <EndorsementAllonge notify={notify} />;
      case 'tele-counsel':
        return <TeleCounsel notify={notify} />;
      case 'trust-builder':
        return <TrustBuilder notify={notify} />;
      case 'name-guard':
        return <NameGuard notify={notify} />;
      case 'filing-navigator':
        return <FilingNavigator />;
      case 'courtroom-conveyance':
        return <CourtroomConveyance />;
      case 'remedy-tracker':
        return <RemedyTracker notify={notify} />;
      default:
        return <Dashboard onChangeTab={handleNavChange} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-200">
      
      {/* Notification Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {notifications.map((n) => (
          <div 
            key={n.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md animate-in slide-in-from-right-full duration-300
              ${n.type === 'error' ? 'bg-red-900/80 border-red-500/50 text-red-100' : 
                n.type === 'success' ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-100' : 
                'bg-blue-900/80 border-blue-500/50 text-blue-100'}
            `}
          >
            {n.type === 'error' && <AlertTriangle className="w-5 h-5" />}
            {n.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {n.type === 'info' && <Bell className="w-5 h-5" />}
            <span className="text-sm font-medium">{n.message}</span>
            <button 
              onClick={() => removeNotification(n.id)}
              className="ml-2 opacity-50 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        id="sidebar"
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <div id="app-logo" className="flex items-center gap-2 text-amber-500 font-bold tracking-wider">
            <Shield className="h-6 w-6" />
            <span>VEROBRIX</span>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => handleNavChange('dashboard')}
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Cockpit Overview"
          />

          <NavButton 
            active={activeTab === 'identity-profile'} 
            onClick={() => handleNavChange('identity-profile')}
            icon={<Fingerprint className="h-5 w-5" />}
            label="Identity Management"
          />
          
          <div id="nav-intelligence">
            <div className="mt-6 mb-2 px-4 text-xs font-mono text-slate-500 uppercase tracking-wider">
              Intelligence Modules
            </div>
            
            <NavButton active={activeTab === 'document-vault'} onClick={() => handleNavChange('document-vault')} icon={<Vault className="h-5 w-5" />} label="Document Vault" />
            <NavButton active={activeTab === 'semantic-scanner'} onClick={() => handleNavChange('semantic-scanner')} icon={<ScanEye className="h-5 w-5" />} label="Dialogos Scanner" />
            <NavButton active={activeTab === 'instrument-parser'} onClick={() => handleNavChange('instrument-parser')} icon={<Database className="h-5 w-5" />} label="JARVIS Parser" />
            <NavButton active={activeTab === 'creditor-book'} onClick={() => handleNavChange('creditor-book')} icon={<Users className="h-5 w-5" />} label="Creditor Book" />
            <NavButton active={activeTab === 'tele-counsel'} onClick={() => handleNavChange('tele-counsel')} icon={<PhoneCall className="h-5 w-5" />} label="TeleCounsel" />
            <NavButton active={activeTab === 'courtroom-conveyance'} onClick={() => handleNavChange('courtroom-conveyance')} icon={<Gavel className="h-5 w-5" />} label="Courtroom Conveyance" />
            <NavButton active={activeTab === 'legal-resources'} onClick={() => handleNavChange('legal-resources')} icon={<BookOpen className="h-5 w-5" />} label="Legal Doctrine" />
            <NavButton active={activeTab === 'templates'} onClick={() => handleNavChange('templates')} icon={<FileText className="h-5 w-5" />} label="Template Library" />
          </div>
          
          <div id="nav-remedy">
            <div className="mt-6 mb-2 px-4 text-xs font-mono text-slate-500 uppercase tracking-wider">
              Remedy Generation
            </div>

            <NavButton active={activeTab === 'remedy-tracker'} onClick={() => handleNavChange('remedy-tracker')} icon={<Clock className="h-5 w-5" />} label="Remedy Tracker" />
            <NavButton active={activeTab === 'status-correction'} onClick={() => handleNavChange('status-correction')} icon={<Scale className="h-5 w-5" />} label="Status Correction" />
            <NavButton active={activeTab === 'filing-navigator'} onClick={() => handleNavChange('filing-navigator')} icon={<Milestone className="h-5 w-5" />} label="Filing Navigator" />
            <NavButton active={activeTab === 'name-guard'} onClick={() => handleNavChange('name-guard')} icon={<ShieldCheck className="h-5 w-5" />} label="Trade Name Authority" />
            <NavButton active={activeTab === 'trust-builder'} onClick={() => handleNavChange('trust-builder')} icon={<Landmark className="h-5 w-5" />} label="Private Trust & Estate" />
            <NavButton active={activeTab === 'ucc-filing'} onClick={() => handleNavChange('ucc-filing')} icon={<FileKey className="h-5 w-5" />} label="UCC Filing" />
            <NavButton active={activeTab === 'a4v-tender'} onClick={() => handleNavChange('a4v-tender')} icon={<ScrollText className="h-5 w-5" />} label="A4V Tender" />
            <NavButton active={activeTab === 'fcra-dispute'} onClick={() => handleNavChange('fcra-dispute')} icon={<ShieldAlert className="h-5 w-5" />} label="FCRA 609 Dispute" />
            <NavButton active={activeTab === 'endorsement-allonge'} onClick={() => handleNavChange('endorsement-allonge')} icon={<Stamp className="h-5 w-5" />} label="Endorsement Allonge" />
          </div>
        </nav>

        <div className="mt-auto p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-amber-500">
              {user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold truncate">{user?.email}</p>
              <button onClick={startTutorial} className="text-xs text-slate-400 hover:text-amber-400">
                Restart Tutorial
              </button>
            </div>
            <button onClick={logout} className="text-slate-400 hover:text-white" aria-label="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/70 backdrop-blur-sm">
          <button onClick={toggleSidebar} className="lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <div id="global-search" className="relative w-full max-w-md ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="search"
              placeholder="Global Search (files, remedies...)"
              value={searchQuery}
              onChange={handleGlobalSearch}
              className="w-full bg-slate-800 border-slate-700 rounded-md pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div className="flex items-center gap-4 ml-auto">
             <button className="text-slate-400 hover:text-white" onClick={startTutorial}>
              <HelpCircle className="h-6 w-6" />
            </button>
            <button className="relative text-slate-400 hover:text-white">
              <Bell className="h-6 w-6" />
              {notifications.length > 0 && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />}
            </button>
            <div className="w-px h-6 bg-slate-700" />
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-amber-500">
                {user?.email.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'bg-amber-500/10 text-amber-400'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    {icon}
    <span className="flex-1 text-left">{label}</span>
  </button>
);

export default App;