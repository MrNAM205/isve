
import React, { useState, useEffect, useRef } from 'react';
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

import { getUserProfile, clearUserProfile } from './services/storage';
import { UserProfile, NotifyFn, NotificationType } from './types';

// Define navigation tabs
type Tab = 'dashboard' | 'document-vault' | 'semantic-scanner' | 'instrument-parser' | 'status-correction' | 'a4v-tender' | 'ucc-filing' | 'creditor-book' | 'legal-resources' | 'fcra-dispute' | 'templates' | 'identity-profile' | 'endorsement-allonge' | 'tele-counsel' | 'trust-builder' | 'name-guard' | 'filing-navigator' | 'courtroom-conveyance' | 'remedy-tracker';

interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Data Passing State
  const [draftDisputeData, setDraftDisputeData] = useState<any>(null);

  // Notification System
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const notify: NotifyFn = (type, message) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    // Auto dismiss
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) setUser(profile);
  }, []);

  // Shepherd Tour Initialization
  useEffect(() => {
    if (user && !localStorage.getItem('tutorial_completed')) {
      // Slight delay to ensure DOM elements are rendered
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
            buttons: [
              {
                text: 'Next',
                action: tour.next,
                classes: 'shepherd-button-primary'
              }
            ]
          });

          tour.addStep({
            id: 'search',
            text: 'Use the Global Search to instantly find files in your Document Vault.',
            attachTo: { element: '#global-search', on: 'bottom' },
            buttons: [
              { text: 'Back', action: tour.back },
              { text: 'Next', action: tour.next, classes: 'shepherd-button-primary' }
            ]
          });

          tour.addStep({
            id: 'nav-modules',
            text: 'Access powerful AI modules here. "Dialogos" scans for legal traps, while "JARVIS" extracts financial data.',
            attachTo: { element: '#nav-intelligence', on: 'right' },
            buttons: [
              { text: 'Back', action: tour.back },
              { text: 'Next', action: tour.next, classes: 'shepherd-button-primary' }
            ]
          });

          tour.addStep({
            id: 'nav-remedy',
            text: 'Generate Affidavits, UCC filings, and disputes in the Remedy section.',
            attachTo: { element: '#nav-remedy', on: 'right' },
            buttons: [
              { text: 'Back', action: tour.back },
              {
                text: 'Finish',
                action: () => {
                  localStorage.setItem('tutorial_completed', 'true');
                  tour.complete();
                },
                classes: 'shepherd-button-primary'
              }
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

  const handleLogin = (profile: UserProfile) => {
    setUser(profile);
  };

  const handleLogout = () => {
    clearUserProfile();
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    // If user starts typing, switch to Vault to show results
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

  const handleDraftDispute = (data: any) => {
    setDraftDisputeData(data);
    handleNavChange('fcra-dispute');
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
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
        return (
          <InstrumentParser 
            notify={notify} 
            onDraftAllonge={() => handleNavChange('endorsement-allonge')} 
            onDraftDispute={handleDraftDispute}
          />
        );
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
              onClick={() => setNotifications(notifications.filter(x => x.id !== n.id))}
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
            
            <NavButton 
              active={activeTab === 'document-vault'} 
              onClick={() => handleNavChange('document-vault')}
              icon={<Vault className="h-5 w-5" />}
              label="Document Vault"
            />
            <NavButton 
              active={activeTab === 'semantic-scanner'} 
              onClick={() => handleNavChange('semantic-scanner')}
              icon={<ScanEye className="h-5 w-5" />}
              label="Dialogos Scanner"
            />
            <NavButton 
              active={activeTab === 'instrument-parser'} 
              onClick={() => handleNavChange('instrument-parser')}
              icon={<Database className="h-5 w-5" />}
              label="JARVIS Parser"
            />
            <NavButton 
              active={activeTab === 'creditor-book'} 
              onClick={() => handleNavChange('creditor-book')}
              icon={<Users className="h-5 w-5" />}
              label="Creditor Book"
            />
            <NavButton 
              active={activeTab === 'tele-counsel'} 
              onClick={() => handleNavChange('tele-counsel')}
              icon={<PhoneCall className="h-5 w-5" />}
              label="TeleCounsel"
            />
             <NavButton 
              active={activeTab === 'courtroom-conveyance'} 
              onClick={() => handleNavChange('courtroom-conveyance')}
              icon={<Gavel className="h-5 w-5" />}
              label="Courtroom Conveyance"
            />
            <NavButton 
              active={activeTab === 'legal-resources'} 
              onClick={() => handleNavChange('legal-resources')}
              icon={<BookOpen className="h-5 w-5" />}
              label="Legal Doctrine"
            />
            <NavButton 
              active={activeTab === 'templates'} 
              onClick={() => handleNavChange('templates')}
              icon={<FileText className="h-5 w-5" />}
              label="Template Library"
            />
          </div>
          
          <div id="nav-remedy">
            <div className="mt-6 mb-2 px-4 text-xs font-mono text-slate-500 uppercase tracking-wider">
              Remedy Generation
            </div>

            <NavButton 
              active={activeTab === 'remedy-tracker'} 
              onClick={() => handleNavChange('remedy-tracker')}
              icon={<Clock className="h-5 w-5" />}
              label="Remedy Tracker"
            />
            <NavButton 
              active={activeTab === 'status-correction'} 
              onClick={() => handleNavChange('status-correction')}
              icon={<Scale className="h-5 w-5" />}
              label="Status Correction"
            />
             <NavButton 
              active={activeTab === 'filing-navigator'} 
              onClick={() => handleNavChange('filing-navigator')}
              icon={<Milestone className="h-5 w-5" />}
              label="Filing Navigator"
            />
            <NavButton 
              active={activeTab === 'name-guard'} 
              onClick={() => handleNavChange('name-guard')}
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Trade Name Authority"
            />
             <NavButton 
              active={activeTab === 'trust-builder'} 
              onClick={() => handleNavChange('trust-builder')}
              icon={<Landmark className="h-5 w-5" />}
              label="Private Trust & Estate"
            />
            <NavButton 
              active={activeTab === 'ucc-filing'} 
              onClick={() => handleNavChange('ucc-filing')}
              icon={<FileKey className="h-5 w-5" />}
              label="UCC Filing"
            />
            <NavButton 
              active={activeTab === 'a4v-tender'} 
              onClick={() => handleNavChange('a4v-tender')}
              icon={<ScrollText className="h-5 w-5" />}
              label="A4V Tender"
            />
             <NavButton 
              active={activeTab === 'fcra-dispute'} 
              onClick={() => handleNavChange('fcra-dispute')}
              icon={<ShieldAlert className="h-5 w-5" />}
              label="FCRA 609 Dispute"
            />
            <NavButton 
              active={activeTab === 'endorsement-allonge'} 
              onClick={() => handleNavChange('endorsement-allonge')}
              icon={<Stamp className="h-5 w-5" />}
              label="Endorsement Allonge"
            />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between gap-3 px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 font-bold text-xs">
                {user.displayName.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-200 truncate">{user.displayName}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user.provider} User</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
           <button onClick={startTutorial} className="mt-2 w-full text-xs text-slate-600 hover:text-amber-500 flex items-center justify-center gap-1">
              <HelpCircle className="w-3 h-3" /> Replay Tutorial
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Global Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 lg:mx-8" id="global-search">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-500 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={handleGlobalSearch}
                placeholder="Search Document Vault (Press '/' to focus)"
                className="block w-full p-2 pl-10 text-sm text-slate-200 border border-slate-700 rounded-lg bg-slate-800/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 focus:bg-slate-900 placeholder-slate-500 transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-xs text-slate-600 border border-slate-700 rounded px-1.5 py-0.5">/</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              SYSTEM ONLINE
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-950" id="main-content">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
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
  disabled?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
      ${active 
        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    {icon}
    {label}
  </button>
);

export default App;
