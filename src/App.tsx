import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Bell, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PolicyList from './components/PolicyList';
import PolicyForm from './components/PolicyForm';
import { usePolicies } from './hooks/usePolicies';
import { Policy } from './types/policy';

type View = 'dashboard' | 'policies';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | undefined>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { policies, addPolicy, updatePolicy, deletePolicy } = usePolicies();

  // Listen for custom events to open policy form
  useEffect(() => {
    const handleOpenPolicyForm = () => {
      handleAddPolicy();
    };

    window.addEventListener('openPolicyForm', handleOpenPolicyForm);
    return () => window.removeEventListener('openPolicyForm', handleOpenPolicyForm);
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

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'policies', label: 'Policies', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-lg">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-white">InsureTrack</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-white hover:text-gray-200 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as View);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-6 py-3 text-left transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">InsureTrack v1.0</p>
            <p className="text-xs text-gray-400 mt-1">Policy Management System</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="hidden lg:block">
              <h1 className="text-2xl font-semibold text-gray-900">
                {currentView === 'dashboard' ? 'Dashboard' : 'Policy Management'}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                {policies.length} {policies.length === 1 ? 'Policy' : 'Policies'}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'policies' && (
            <PolicyList
              policies={policies}
              onEdit={handleEditPolicy}
              onDelete={deletePolicy}
              onAdd={handleAddPolicy}
            />
          )}
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
    </div>
  );
}

export default App;