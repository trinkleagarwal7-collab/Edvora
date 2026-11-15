import React, { useState, useEffect } from 'react';
import { X, Key, Sparkles, Check, AlertCircle, Shield, Sliders } from 'lucide-react';
import { api } from '../../api';
import { AppSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSettingsSaved }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'openai'>('gemini');
  const [selectedMode, setSelectedMode] = useState<'eli15' | 'detailed' | 'exam'>('eli15');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      setSelectedProvider(data.aiProvider || 'gemini');
      setSelectedMode(data.defaultExplanationMode || 'eli15');
      setGeminiKeyInput(data.maskedGeminiKey || '');
      setOpenaiKeyInput(data.maskedOpenaiKey || '');
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const handleTestKey = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const keyToTest = selectedProvider === 'gemini' ? geminiKeyInput : openaiKeyInput;
      const res = await api.testApiKey({
        provider: selectedProvider,
        key: keyToTest.includes('...') ? undefined : keyToTest
      });
      setTestResult({
        success: res.success,
        message: res.message || res.error || 'Key verified.'
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Validation failed.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateSettings({
        aiProvider: selectedProvider,
        defaultExplanationMode: selectedMode,
        geminiApiKey: geminiKeyInput,
        openaiApiKey: openaiKeyInput
      });
      setSaveSuccess(true);
      if (onSettingsSaved) onSettingsSaved();
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EBE7DF] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-[#F5F2EB] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal-900">Edvora Preferences</h3>
              <p className="text-xs text-charcoal-500">AI Model Configuration & Study Settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-[#F5F2EB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* AI Provider Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500">
              AI Engine Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedProvider('gemini')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedProvider === 'gemini'
                    ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                    : 'border-[#EBE7DF] hover:border-brand-200 bg-[#FAF9F5]'
                }`}
              >
                <div className="font-bold text-xs text-charcoal-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                  <span>Google Gemini</span>
                </div>
                <div className="text-[11px] text-charcoal-500 mt-1">
                  gemini-2.0-flash (Recommended, fast & grounded)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProvider('openai')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  selectedProvider === 'openai'
                    ? 'border-brand-500 bg-brand-50/50 ring-1 ring-brand-500'
                    : 'border-[#EBE7DF] hover:border-brand-200 bg-[#FAF9F5]'
                }`}
              >
                <div className="font-bold text-xs text-charcoal-900">OpenAI</div>
                <div className="text-[11px] text-charcoal-500 mt-1">
                  gpt-4o / gpt-4o-mini
                </div>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-500 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-charcoal-400" />
                <span>
                  {selectedProvider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
                </span>
              </label>
              <span className="text-[11px] text-sage-600 font-semibold">Local & Secured</span>
            </div>

            <div className="flex gap-2">
              <input
                type="password"
                placeholder={
                  selectedProvider === 'gemini' ? 'AIzaSy...' : 'sk-...'
                }
                value={selectedProvider === 'gemini' ? geminiKeyInput : openaiKeyInput}
                onChange={(e) => {
                  if (selectedProvider === 'gemini') setGeminiKeyInput(e.target.value);
                  else setOpenaiKeyInput(e.target.value);
                }}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-[#EBE7DF] text-xs font-mono text-charcoal-900 bg-[#FAF9F5] focus:outline-hidden focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-2xl bg-[#FAF9F5] hover:bg-[#F3EFE6] border border-[#EBE7DF] text-xs font-bold text-charcoal-700 transition-colors shrink-0"
              >
                {isTesting ? 'Testing...' : 'Test Key'}
              </button>
            </div>

            {/* Test result message */}
            {testResult && (
              <div
                className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-sage-50 text-sage-700 border border-sage-200'
                    : 'bg-coral-50 text-coral-700 border border-coral-200'
                }`}
              >
                {testResult.success ? (
                  <Check className="w-4 h-4 text-sage-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-coral-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <p className="text-[11px] text-charcoal-500 leading-relaxed">
              Your key is saved locally in Edvora's private database. It is never exposed in client code.
            </p>
          </div>

          {/* Default Explanation Mode */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Default AI Explanation Style
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'eli15',
                  label: 'Simple Intuitive Mode (ELI15)',
                  desc: 'Explains complex MBA concepts with relatable analogies, everyday examples, and zero unnecessary jargon.'
                },
                {
                  id: 'detailed',
                  label: 'Detailed MBA Academic Mode',
                  desc: 'In-depth analysis, strategic frameworks, architectural trade-offs, and quantitative formulas.'
                },
                {
                  id: 'exam',
                  label: 'Exam Ready Mode',
                  desc: 'High-yield points, bulleted summary notes, likely examination questions, and scoring frameworks.'
                }
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedMode === m.id
                      ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500'
                      : 'border-[#EBE7DF] hover:border-brand-200 bg-[#FAF9F5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="defaultMode"
                    value={m.id}
                    checked={selectedMode === m.id}
                    onChange={() => setSelectedMode(m.id as any)}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500 accent-brand-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-charcoal-900">{m.label}</div>
                    <div className="text-[11px] text-charcoal-500 leading-normal mt-0.5">{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-[#F5F2EB] bg-[#FAF9F5] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
            <Shield className="w-3.5 h-3.5 text-sage-600" />
            <span>Academic Source Grounding</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-bold text-charcoal-600 hover:bg-[#F0ECE1] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
            >
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
