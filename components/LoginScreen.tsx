
import React, { useState } from 'react';
import { Shield, Github, Chrome, Loader2, KeyRound } from 'lucide-react';
import { UserProfile } from '../types';
import { saveUserProfile } from '../services/storage';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleLogin = (provider: 'google' | 'github') => {
    setLoadingProvider(provider);
    
    // Simulate OAuth 2.0 Network Delay
    setTimeout(() => {
      const mockProfile: UserProfile = {
        uid: crypto.randomUUID(),
        displayName: 'Sovereign User',
        email: provider === 'google' ? 'user@gmail.com' : 'user@github.com',
        provider: provider
      };
      saveUserProfile(mockProfile);
      onLogin(mockProfile);
      setLoadingProvider(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">VEROBRIX</h1>
          <p className="text-slate-400 mt-2">Sovereign Intelligence Engine</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => handleLogin('google')}
            disabled={!!loadingProvider}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
             {loadingProvider === 'google' ? (
               <Loader2 className="w-5 h-5 animate-spin" />
             ) : (
               <Chrome className="w-5 h-5 text-red-500" />
             )}
             <span>Continue with Google</span>
          </button>

          <button 
            onClick={() => handleLogin('github')}
            disabled={!!loadingProvider}
            className="w-full flex items-center justify-center gap-3 bg-[#24292e] text-white hover:bg-[#2f363d] font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {loadingProvider === 'github' ? (
               <Loader2 className="w-5 h-5 animate-spin" />
             ) : (
               <Github className="w-5 h-5" />
             )}
             <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
            <KeyRound className="w-3 h-3" />
            Secured via OAuth 2.0 Simulation
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;