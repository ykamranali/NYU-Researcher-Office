import React, { useEffect, useState } from 'react';
import { Save, CheckCircle, AlertCircle, Shield, Award, User } from 'lucide-react';
import axios from '../api/axios';

const ProfileSettings = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: '',
        title: '',
        biography: '',
        orcid: '',
        google_scholar: '',
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/profile');
            const data = res.data;
            const subProfile = data.profile || {};
            setProfile({
                name: data.name || '',
                email: data.email || '',
                role: data.role || '',
                title: subProfile.title || '',
                biography: subProfile.biography || '',
                orcid: subProfile.orcid || '',
                google_scholar: subProfile.google_scholar || '',
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
        } catch (error) {
            console.error('Failed to load profile', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e: any) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFeedback(null);

        const payload: any = {
            name: profile.name,
            title: profile.title,
            biography: profile.biography,
            orcid: profile.orcid,
            google_scholar: profile.google_scholar,
        };

        if (profile.new_password) {
            payload.current_password = profile.current_password;
            payload.new_password = profile.new_password;
            payload.new_password_confirmation = profile.new_password_confirmation;
        }

        try {
            await axios.put('/profile', payload);
            setFeedback({ text: 'Researcher profile and account credentials updated successfully.' });
            setProfile({
                ...profile,
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
            setTimeout(() => setFeedback(null), 4000);
        } catch (err: any) {
            setFeedback({ text: err.response?.data?.message || 'Failed to update profile.', error: true });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-gray-500">Loading your researcher profile...</div>;
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Researcher Profile & Security</h1>
                <p className="text-sm text-gray-500 mt-1">Manage institutional credentials, academic biography, and ORCID linkage</p>
            </div>

            {feedback && (
                <div className={`p-3 rounded text-sm shadow-sm flex items-center border-l-4 ${
                    feedback.error ? 'bg-red-50 border-red-500 text-red-800' : 'bg-emerald-50 border-emerald-500 text-emerald-800'
                }`}>
                    {feedback.error ? <AlertCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    {feedback.text}
                </div>
            )}

            <form onSubmit={handleSave} className="card space-y-6 border border-gray-100 shadow-sm">
                <div>
                    <h3 className="text-base font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                        <User className="w-4 h-4 mr-2 text-nyu-primary" /> Personal & Institutional Identity
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Legal Name *</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={profile.name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Academic Title</label>
                            <input
                                type="text"
                                name="title"
                                value={profile.title}
                                onChange={handleChange}
                                placeholder="Associate Professor, PI"
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">University Email</label>
                            <input
                                type="email"
                                disabled
                                value={profile.email}
                                className="w-full border border-gray-200 rounded p-2 text-sm bg-gray-50 text-gray-500 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">System Role</label>
                            <input
                                type="text"
                                disabled
                                value={profile.role}
                                className="w-full border border-gray-200 rounded p-2 text-sm bg-gray-50 text-gray-600 font-bold"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-base font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                        <Award className="w-4 h-4 mr-2 text-nyu-primary" /> Scholarly Identifiers & Biography
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">ORCID iD</label>
                            <input
                                type="text"
                                name="orcid"
                                value={profile.orcid}
                                onChange={handleChange}
                                placeholder="0000-0002-1825-0097"
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Google Scholar Profile URL</label>
                            <input
                                type="text"
                                name="google_scholar"
                                value={profile.google_scholar}
                                onChange={handleChange}
                                placeholder="https://scholar.google.com/citations?user=..."
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Academic Biography</label>
                        <textarea
                            name="biography"
                            rows={4}
                            value={profile.biography}
                            onChange={handleChange}
                            placeholder="Research history, expertise domains, and laboratory achievements..."
                            className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-base font-bold text-gray-900 border-b pb-2 mb-4 flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-nyu-primary" /> Security & Password Update
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Current Password (required to change password)</label>
                            <input
                                type="password"
                                name="current_password"
                                value={profile.current_password}
                                onChange={handleChange}
                                placeholder="••••••••••••"
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">New Password (min 8 characters)</label>
                                <input
                                    type="password"
                                    name="new_password"
                                    value={profile.new_password}
                                    onChange={handleChange}
                                    placeholder="••••••••••••"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="new_password_confirmation"
                                    value={profile.new_password_confirmation}
                                    onChange={handleChange}
                                    placeholder="••••••••••••"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary flex items-center shadow disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Updating...' : 'Save Profile Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;
