import React, { useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, FileText, Database, Trash2, AlertTriangle, CheckCircle, X, RefreshCw } from 'lucide-react';
import { Policy } from '../types/policy';
import { exportToCSV, saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';

interface SettingsProps {
  policies: Policy[];
  onImportPolicies: (policies: Policy[]) => void;
  onClearAllData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ policies, onImportPolicies, onClearAllData }) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [isImporting, setIsImporting] = useState(false);

  const handleExportCSV = () => {
    exportToCSV(policies);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(policies, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `insurance_policies_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus({ type: null, message: '' });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedPolicies = JSON.parse(content) as Policy[];
        
        // Validate the imported data
        if (!Array.isArray(importedPolicies)) {
          throw new Error('Invalid file format: Expected an array of policies');
        }

        // Basic validation of policy structure
        const requiredFields = ['id', 'policyNumber', 'policyholderName', 'dateOfBirth', 'policyRenewalDate', 'mobileNumber', 'policyPremiumAmount', 'insuranceCategory'];
        const isValid = importedPolicies.every(policy => 
          requiredFields.every(field => field in policy)
        );

        if (!isValid) {
          throw new Error('Invalid policy data structure');
        }

        // Migrate policies to include renewalFrequency if missing
        const migratedPolicies = importedPolicies.map(policy => ({
          ...policy,
          renewalFrequency: policy.renewalFrequency || 'yearly' as const,
          createdAt: policy.createdAt || new Date().toISOString(),
          updatedAt: policy.updatedAt || new Date().toISOString()
        }));

        onImportPolicies(migratedPolicies);
        setImportStatus({ 
          type: 'success', 
          message: `Successfully imported ${migratedPolicies.length} policies` 
        });
      } catch (error) {
        setImportStatus({ 
          type: 'error', 
          message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      } finally {
        setIsImporting(false);
        // Reset file input
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      setImportStatus({ type: 'error', message: 'Failed to read file' });
      setIsImporting(false);
    };

    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    onClearAllData();
    setShowClearConfirm(false);
  };

  const getStorageSize = () => {
    try {
      const data = JSON.stringify(policies);
      return (new Blob([data]).size / 1024).toFixed(2);
    } catch {
      return '0';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-white via-gray-50 to-slate-50 rounded-3xl p-8 border border-white/20 shadow-xl">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-400 to-slate-600 rounded-full translate-x-32 -translate-y-32"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-gray-800 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-600 text-lg">Manage your data and application preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Import Status */}
      {importStatus.type && (
        <div className={`p-4 rounded-2xl border ${
          importStatus.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {importStatus.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="font-medium">{importStatus.message}</span>
            <button
              onClick={() => setImportStatus({ type: null, message: '' })}
              className="ml-auto text-current hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Data Management */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Database className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Data Management</h3>
        </div>

        {/* Data Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100/50">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-600">Total Policies</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{policies.length}</p>
            <p className="text-xs text-gray-500 mt-1">Active insurance policies</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100/50">
            <div className="flex items-center gap-3 mb-2">
              <Database className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-600">Storage Used</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{getStorageSize()} KB</p>
            <p className="text-xs text-gray-500 mt-1">Local storage usage</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-100/50">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-600">Last Updated</span>
            </div>
            <p className="text-lg font-bold text-purple-600">
              {policies.length > 0 
                ? new Date(Math.max(...policies.map(p => new Date(p.updatedAt).getTime()))).toLocaleDateString()
                : 'Never'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">Most recent change</p>
          </div>
        </div>

        {/* Export Options */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Export Data</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleExportCSV}
              disabled={policies.length === 0}
              className="group flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Download className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              Export as CSV
            </button>
            
            <button
              onClick={handleExportJSON}
              disabled={policies.length === 0}
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Download className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              Export as JSON
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Export your policy data for backup or transfer to another system
          </p>
        </div>

        {/* Import Options */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Import Data</h4>
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              disabled={isImporting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              id="import-file"
            />
            <label
              htmlFor="import-file"
              className={`group flex items-center gap-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-4 rounded-2xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold cursor-pointer ${
                isImporting ? 'opacity-50 cursor-not-allowed transform-none' : ''
              }`}
            >
              {isImporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  Import from JSON
                </>
              )}
            </label>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Import policy data from a previously exported JSON file. This will replace all existing data.
          </p>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-gray-200 pt-8">
          <h4 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </h4>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h5 className="font-semibold text-red-800 mb-2">Clear All Data</h5>
                <p className="text-sm text-red-700">
                  Permanently delete all policies and reset the application. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={policies.length === 0}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl hover:bg-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 scale-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Clear All Data</h3>
                <p className="text-sm text-gray-600 mt-1">This action is irreversible</p>
              </div>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to delete all {policies.length} policies? This will permanently remove all data from your system and cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-6 py-4 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-200 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;