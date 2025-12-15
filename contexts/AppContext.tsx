
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { getUserProfile, saveUserProfile, clearUserProfile } from '../services/storage';
import { UserProfile, NotifyFn, NotificationType, Tab, AppNotification, DraftDisputeData } from '../types';

// Define the shape of the context state
interface AppContextType {
  user: UserProfile | null;
  login: (profile: UserProfile) => void;
  logout: () => void;
  notify: NotifyFn;
  notifications: AppNotification[];
  removeNotification: (id: string) => void;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  draftDisputeData: DraftDisputeData | null;
  setDraftDisputeData: (data: DraftDisputeData | null) => void;
}

// Create the context with a default undefined value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [draftDisputeData, setDraftDisputeData] = useState<DraftDisputeData | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const profile = getUserProfile();
    if (profile) {
      setUser(profile);
    }
  }, []);

  const login = (profile: UserProfile) => {
    saveUserProfile(profile);
    setUser(profile);
  };

  const logout = () => {
    clearUserProfile();
    setUser(null);
    setActiveTab('dashboard'); // Reset to dashboard on logout
  };

  const notify: NotifyFn = useCallback((type, message) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    // Auto dismiss
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const value = {
    user,
    login,
    logout,
    notify,
    notifications,
    removeNotification,
    activeTab,
    setActiveTab,
    draftDisputeData,
    setDraftDisputeData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Create a custom hook for easy consumption of the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
