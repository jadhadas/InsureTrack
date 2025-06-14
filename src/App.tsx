import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Bell, Menu, X, MessageSquare, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PolicyList from './components/PolicyList';
import PolicyForm from './components/PolicyForm';
import SMSSettings from './components/SMSSettings';
import Settings from './components/Settings';
import { usePolicies } from './hooks/usePolicies';
import { Policy } from './types/policy';
import { saveToLocalStorage } from './utils/localStorage';

type View = 'dashboard' | 'policies' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSMSSettingsOpen, setIsSMSSettingsOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | undefined>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { policies, addPolicy, updatePolicy, deletePolicy } = usePolicies();

  // Listen for custom events to open policy form and SMS settings
  useEffect(() => {
    const handleOpenPolicyForm = () => {
      handleAddPolicy();
    };

    const handleOpenSMSSettings = () => {
      setIsSMSSettingsOpen(true);
    };

    window.addEventListener('openPolicyForm', handleOpenPolicyForm);
    window.addEventListener('openSMSSettings', handleOpenSMSSettings);
    
    return () => {
      window.removeEventListener('openPolicyForm', handleOpenPolicyForm);
      window.removeEventListener('openSMSSettings', handleOpenSMSSettings);
    };
  }, []);

  const handleAddPolicy = () => {
    setEditingPolicy(undefined);
    setIsFormOpen(true);
  };

  const handleEditPolicy = (policy: Policy) => {
    setEditingPolicy(policy);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (policyData: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPolicy) {
      updatePolicy(editingPolicy.id, policyData);
    } else {
      addPolicy(policyData);
    }
    setIsFormOpen(false);
    setEditingPolicy(undefined);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPolicy(undefined);
  };

  const handleImportPolicies = (importedPolicies: Policy[]) => {
    saveToLocalStorage(importedPolicies);
    window.location.reload(); // Refresh to load new data
  };

  const handleClearAllData = () => {
    saveToLocalStorage([]);
    window.location.reload(); // Refresh to clear all data
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'policies', label: 'Policies', icon: Users },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/20 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 lg:w-64 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="relative h-16 sm:h-20 px-4 sm:px-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
          </div>
          
          <div className="relative flex items-center justify-between h-full">
            <div className="flex items-center min-w-0">
              <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg flex-shrink-0">
                <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-2 sm:ml-3 min-w-0">
                <span className="text-lg sm:text-xl font-bold text-white tracking-tight block truncate">InsureTrack</span>
                <p className="text-xs text-blue-100 font-medium hidden sm:block">Policy Management</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden text-white/80 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-xl flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="mt-4 sm:mt-8 px-3 sm:px-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as View);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 sm:px-4 py-3 sm:py-4 text-left transition-all duration-300 group rounded-xl sm:rounded-2xl mb-2 sm:mb-3 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-lg border border-blue-100 scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 hover:scale-102'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl sm:rounded-2xl"></div>
                )}
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 mr-3 sm:mr-4 transition-all duration-300 relative z-10 flex-shrink-0 ${
                  isActive ? 'scale-110 text-blue-600' : 'group-hover:scale-110'
                }`} />
                <span className="font-semibold text-sm sm:text-base relative z-10 truncate">{item.label}</span>
                {isActive && (
                  <div className="absolute right-3 sm:right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                )}
              </button>
            );
          })}
          
          {/* SMS Settings Button */}
          <button
            onClick={() => {
              setIsSMSSettingsOpen(true);
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center px-3 sm:px-4 py-3 sm:py-4 text-left transition-all duration-300 group text-gray-600 hover:text-gray-900 hover:bg-gray-50/80 hover:scale-102 rounded-xl sm:rounded-2xl mb-2 sm:mb-3"
          >
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-3 sm:mr-4 transition-all duration-300 group-hover:scale-110 flex-shrink-0" />
            <span className="font-semibold text-sm sm:text-base truncate">SMS Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-600 font-semibold">InsureTrack v2.0</p>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">Smart Policy Management</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Enhanced Top Bar */}
        <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden text-gray-400 hover:text-gray-600 p-2 sm:p-3 hover:bg-gray-100/80 rounded-xl sm:rounded-2xl transition-all duration-200 hover:scale-105 flex-shrink-0"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                  {currentView === 'dashboard' ? 'Dashboard' : 
                   currentView === 'policies' ? 'Policies' : 'Settings'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block truncate">
                  {currentView === 'dashboard' 
                    ? 'Overview of your insurance portfolio' 
                    : currentView === 'policies'
                    ? 'Manage all your insurance policies'
                    : 'Configure application settings and data management'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* SMS Settings Button - Desktop */}
              <button
                onClick={() => setIsSMSSettingsOpen(true)}
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border border-emerald-200/50 shadow-sm hover:from-emerald-100 hover:to-green-100 hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden lg:inline">SMS Settings</span>
              </button>
              
              {/* SMS Settings Button - Mobile */}
              <button
                onClick={() => setIsSMSSettingsOpen(true)}
                className="md:hidden p-2 sm:p-3 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-xl sm:rounded-2xl border border-emerald-200/50 shadow-sm hover:from-emerald-100 hover:to-green-100 hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              
              {/* Policy Count Badge */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold border border-blue-200/50 shadow-sm">
                <span className="hidden sm:inline">
                  {policies.length} {policies.length === 1 ? 'Policy' : 'Policies'}
                </span>
                <span className="sm:hidden">{policies.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-3 sm:p-4 lg:p-6 pb-20 sm:pb-6 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
          <div className="w-full max-w-full overflow-hidden">
            {currentView === 'dashboard' && <Dashboard />}
            {currentView === 'policies' && (
              <PolicyList
                policies={policies}
                onEdit={handleEditPolicy}
                onDelete={deletePolicy}
                onAdd={handleAddPolicy}
              />
            )}
            {currentView === 'settings' && (
              <Settings
                policies={policies}
                onImportPolicies={handleImportPolicies}
                onClearAllData={handleClearAllData}
              />
            )}
          </div>
        </main>
      </div>

      {/* Policy Form Modal */}
      <PolicyForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        policy={editingPolicy}
        mode={editingPolicy ? 'edit' : 'create'}
      />

      {/* SMS Settings Modal */}
      <SMSSettings
        isOpen={isSMSSettingsOpen}
        onClose={() => setIsSMSSettingsOpen(false)}
      />
    </div>
  );
}

export default App;