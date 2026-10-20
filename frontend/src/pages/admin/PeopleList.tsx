import React, { useEffect, useState } from 'react';
import { Users, Search, Trash2, Plus, UserPlus, Filter, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import axios from '../../api/axios';

const PeopleList = () => {
    const [people, setPeople] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Professor',
    });

    const roles = ['All', 'Super Admin', 'Office Admin', 'Professor', 'Student', 'Reviewer', 'Finance Officer'];

    const fetchPeople = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search.trim()) params.search = search.trim();
            if (roleFilter !== 'All') params.role = roleFilter;

            const res = await axios.get('/people', { params });
            setPeople(res.data || []);
        } catch (error) {
            console.error('Failed to load user roster', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchPeople(), 300);
        return () => clearTimeout(timer);
    }, [search, roleFilter]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('/people', newUser);
            setFeedbackMsg({ text: `User account for ${newUser.email} provisioned successfully.` });
            setModalOpen(false);
            setNewUser({ name: '', email: '', password: '', role: 'Professor' });
            fetchPeople();
            setTimeout(() => setFeedbackMsg(null), 4000);
        } catch (err: any) {
            setFeedbackMsg({ text: err.response?.data?.message || 'Failed to create user.', error: true });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`Are you sure you want to permanently delete user ${name}?`)) return;
        try {
            await axios.delete(`/people/${id}`);
            setFeedbackMsg({ text: 'User removed from institutional directory.' });
            fetchPeople();
            setTimeout(() => setFeedbackMsg(null), 3000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete user.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">University People & Roles</h1>
                    <p className="text-sm text-gray-500 mt-1">Authorized faculty, research scholars, reviewers, and administrative staff</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="btn-primary flex items-center shadow-sm"
                >
                    <UserPlus className="w-4 h-4 mr-2" /> Add University User
                </button>
            </div>

            {feedbackMsg && (
                <div className={`p-3 rounded text-sm shadow-sm flex items-center border-l-4 ${
                    feedbackMsg.error ? 'bg-red-50 border-red-500 text-red-800' : 'bg-emerald-50 border-emerald-500 text-emerald-800'
                }`}>
                    {feedbackMsg.error ? <AlertCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    {feedbackMsg.text}
                </div>
            )}

            <div className="card shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-nyu-primary focus:border-nyu-primary"
                            placeholder="Search by name or email..."
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Role:</span>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-nyu-primary focus:border-nyu-primary bg-white"
                        >
                            {roles.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assigned Role</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading user directory...</td></tr>
                            ) : people.length === 0 ? (
                                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No users found.</td></tr>
                            ) : (
                                people.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-gray-900">{p.name}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600 font-mono">{p.email}</td>
                                        <td className="px-4 py-3 text-xs">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-semibold ${
                                                p.role === 'Super Admin' ? 'bg-purple-100 text-purple-800' :
                                                p.role === 'Office Admin' ? 'bg-blue-100 text-blue-800' :
                                                p.role === 'Professor' ? 'bg-emerald-100 text-emerald-800' :
                                                p.role === 'Reviewer' ? 'bg-indigo-100 text-indigo-800' :
                                                p.role === 'Finance Officer' ? 'bg-amber-100 text-amber-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {p.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{p.department}</td>
                                        <td className="px-4 py-3 text-xs">
                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleDelete(p.id, p.name)}
                                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                                title="Delete user"
                                            >
                                                <Trash2 className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create User Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <form onSubmit={handleCreateUser} className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Provision University User</h3>
                        <p className="text-xs text-gray-500">Create an authenticated institutional account with explicit Spatie permission assignments.</p>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name *</label>
                            <input
                                type="text"
                                required
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="Dr. Jennifer Sterling"
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">University Email *</label>
                            <input
                                type="email"
                                required
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="jennifer.sterling@nyu.edu"
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Password * (min 8 chars)</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="••••••••••••"
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Role Permission Level *</label>
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                            >
                                <option value="Professor">Professor / Faculty Researcher</option>
                                <option value="Student">Student / Research Scholar</option>
                                <option value="Reviewer">Reviewer (Ethics & Project Committee)</option>
                                <option value="Finance Officer">Finance / Grants Officer</option>
                                <option value="Office Admin">Office Admin (Research Operations)</option>
                                <option value="Super Admin">Super Admin</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 border rounded text-xs text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary text-xs shadow disabled:opacity-50"
                            >
                                {submitting ? 'Provisioning...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PeopleList;
