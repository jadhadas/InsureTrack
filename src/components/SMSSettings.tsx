import React, { useState, useEffect } from 'react';
import { Settings, MessageSquare, Save, Eye, EyeOff, TestTube, CheckCircle, XCircle, X } from 'lucide-react';
import { SMSConfig, saveSMSConfig, loadSMSConfig, sendSMS, formatPhoneNumber } from '../utils/smsService';

interface SMSSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const SMSSettings: React.FC<SMSSettingsProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<SMSConfig>({
    accountSid: '',
    authToken: '',
    fromNumber: '',
    enabled: false
  });
  
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedConfig = loadSMSConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      }
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      saveSMSConfig(config);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save delay
      onClose();
    } catch (error) {
      console.error('Error saving SMS config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testNumber.trim()) {
      setTestResult({ success: false, message: 'Please enter a test phone number' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const formattedNumber = formatPhoneNumber(testNumber);
      const success = await sendSMS({
        to: formattedNumber,
        message: '🧪 Test message from InsureTrack SMS service. If you received this, your SMS configuration is working correctly!',
        type: 'policy_added'
      });

      setTestResult({
        success,
        message: success 
          ? 'Test SMS sent successfully!' 
          : 'Failed to send test SMS. Please check your configuration.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error sending test SMS. Please verify your settings.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">SMS Settings</h2>
              <p className="text-xs sm:text-sm text-gray-600">Configure SMS notifications for policies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Enable/Disable SMS */}
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Enable SMS Notifications</h3>
              <p className="text-xs sm:text-sm text-gray-600">Send automatic SMS for policy events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Twilio Configuration */}
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Twilio Configuration</h3>
              <p className="text-xs sm:text-sm text-blue-700 mb-2 sm:mb-3">
                To enable SMS notifications, you'll need a Twilio account. Get your credentials from the 
                <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer" className="font-medium underline ml-1">
                  Twilio Console
                </a>
              </p>
              <div className="text-xs text-blue-600 space-y-1">
                <p>• Account SID: Found in your Twilio Console dashboard</p>
                <p>• Auth Token: Found in your Twilio Console dashboard</p>
                <p>• From Number: Your Twilio phone number (e.g., +1234567890)</p>
              </div>
            </div>

            {/* Account SID */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Twilio Account SID *
              </label>
              <input
                type="text"
                value={config.accountSid}
                onChange={(e) => setConfig(prev => ({ ...prev, accountSid: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter your Twilio Account SID"
              />
            </div>

            {/* Auth Token */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Twilio Auth Token *
              </label>
              <div className="relative">
                <input
                  type={showAuthToken ? 'text' : 'password'}
                  value={config.authToken}
                  onChange={(e) => setConfig(prev => ({ ...prev, authToken: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter your Twilio Auth Token"
                />
                <button
                  type="button"
                  onClick={() => setShowAuthToken(!showAuthToken)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showAuthToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* From Number */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Twilio Phone Number *
              </label>
              <input
                type="text"
                value={config.fromNumber}
                onChange={(e) => setConfig(prev => ({ ...prev, fromNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="+1234567890"
              />
              <p className="mt-1 text-xs text-gray-500">
                Include country code (e.g., +1 for US, +91 for India)
              </p>
            </div>
          </div>

          {/* Test SMS */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Test SMS Configuration</h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Test Phone Number
                </label>
                <input
                  type="tel"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Enter phone number to test"
                />
              </div>
              
              <button
                onClick={handleTest}
                disabled={isTesting || !config.accountSid || !config.authToken || !config.fromNumber}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
              >
                {isTesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending Test...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4" />
                    Send Test SMS
                  </>
                )}
              </button>

              {testResult && (
                <div className={`flex items-center gap-2 p-3 rounded-lg ${
                  testResult.success 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm font-medium">{testResult.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* SMS Event Types */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">SMS Notifications Will Be Sent For:</h3>
            <div className="space-y-2 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span>New policy additions (welcome message)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>Birthday wishes for policyholders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                <span>Policy renewal reminders (7 days before expiry)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 text-sm order-1 sm:order-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SMSSettings;