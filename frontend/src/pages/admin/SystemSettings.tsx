import React, { useEffect, useState } from 'react';
import { Save, Server, Shield, Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import axios from '../../api/axios';

const SystemSettings = () => {
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'integrations'>('general');
    const [settings, setSettings] = useState({
        university_name: 'New York University',
        support_email: 'research-support@nyu.edu',
        maintenance_mode: 'Disabled',
        allowed_file_types: 'pdf,docx,xlsx,csv,png,jpg',
        max_upload_size_mb: '15',
        require_ethics_for_human_subjects: 'true',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/system/settings');
            setSettings(res.data);
        } catch (error) {
            console.error('Failed to load system settings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleChange = (e: any) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);
        try {
            await axios.put('/system/settings', settings);
            setFeedback({ text: 'Institutional system settings updated and saved to database successfully.' });
            setTimeout(() => setFeedback(null), 4000);
        } catch (err: any) {
            setFeedback({ text: err.response?.data?.message || 'Failed to update settings.', error: true });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Institutional System Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Configure global parameters, security restrictions, upload constraints, and institutional contact points</p>
            </div>

            {feedback && (
                <div className={`p-3 rounded text-sm shadow-sm flex items-center border-l-4 ${
                    feedback.error ? 'bg-red-50 border-red-500 text-red-800' : 'bg-emerald-50 border-emerald-500 text-emerald-800'
                }`}>
                    {feedback.error ? <AlertCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    {feedback.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`w-full text-left px-4 py-3 font-medium rounded-lg flex items-center text-sm transition-colors ${
                            activeTab === 'general' ? 'bg-nyu-primary text-white shadow' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <Server className="w-4 h-4 mr-3" /> General Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full text-left px-4 py-3 font-medium rounded-lg flex items-center text-sm transition-colors ${
                            activeTab === 'security' ? 'bg-nyu-primary text-white shadow' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <Shield className="w-4 h-4 mr-3" /> Security & File Vault
                    </button>
                    <button
                        onClick={() => setActiveTab('integrations')}
                        className={`w-full text-left px-4 py-3 font-medium rounded-lg flex items-center text-sm transition-colors ${
                            activeTab === 'integrations' ? 'bg-nyu-primary text-white shadow' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <Database className="w-4 h-4 mr-3" /> ORCID & DOI Integrations
                    </button>
                </div>

                <div className="col-span-2 card border border-gray-100 shadow-sm">
                    {loading ? (
                        <div className="py-12 text-center text-gray-400">Loading system parameters...</div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-6">
                            {activeTab === 'general' && (
                                <div className="space-y-4">
                                    <h3 className="text-base font-bold text-gray-900 border-b pb-2">Institutional Identification</h3>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">University Name</label>
                                        <input
                                            type="text"
                                            name="university_name"
                                            value={settings.university_name}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Office of Research Support Email</label>
                                        <input
                                            type="email"
                                            name="support_email"
                                            value={settings.support_email}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Maintenance Mode</label>
                                        <select
                                            name="maintenance_mode"
                                            value={settings.maintenance_mode}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                                        >
                                            <option value="Disabled">Disabled (Full Campus Access)</option>
                                            <option value="Enabled">Enabled (Research Administrators Only)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-4">
                                    <h3 className="text-base font-bold text-gray-900 border-b pb-2">Upload Restrictions & Compliance</h3>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Allowed File MIME Extensions (comma-separated)</label>
                                        <input
                                            type="text"
                                            name="allowed_file_types"
                                            value={settings.allowed_file_types}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Maximum Document Upload Size (MB)</label>
                                        <input
                                            type="number"
                                            name="max_upload_size_mb"
                                            value={settings.max_upload_size_mb}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'integrations' && (
                                <div className="space-y-4">
                                    <h3 className="text-base font-bold text-gray-900 border-b pb-2">External API Integrations</h3>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Crossref DOI Resolver Status</label>
                                        <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-800 flex items-center">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Active (Local and Crossref format resolution enabled)
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">ORCID Registry Synchronization</label>
                                        <div className="p-3 bg-blue-50 rounded border border-blue-200 text-xs text-blue-800 flex items-center">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Connected (Institutional ORCID iD linkage enabled for faculty)
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary flex items-center shadow disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Applying...' : 'Apply System Settings'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
