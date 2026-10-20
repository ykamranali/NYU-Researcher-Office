import React, { useEffect, useState } from 'react';
import { Briefcase, Search, Plus, Filter, Calendar, DollarSign, Send, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import axios from '../../api/axios';

const OpportunitiesList = () => {
    const [opps, setOpps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [postModalOpen, setPostModalOpen] = useState(false);
    const [applyModalItem, setApplyModalItem] = useState<any | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const isAdmin = currentUser && (currentUser.role === 'Super Admin' || currentUser.role === 'Office Admin');
    const isStudent = currentUser && currentUser.role === 'Student';

    const [newOpp, setNewOpp] = useState({
        title: '',
        type: 'Fellowship',
        description: '',
        department: 'University-wide',
        funding_amount: '',
        deadline: '',
    });

    const [applicationForm, setApplicationForm] = useState({
        statement_of_purpose: '',
        gpa: '',
        academic_level: 'Undergraduate',
    });

    const types = ['All', 'Fellowship', 'Assistantship', 'Postdoc', 'Grant', 'Seed Funding', 'Internship'];

    const fetchOpportunities = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search.trim()) params.search = search.trim();
            if (typeFilter !== 'All') params.type = typeFilter;

            const res = await axios.get('/opportunities', { params });
            setOpps(res.data || []);
        } catch (error) {
            console.error('Failed to load opportunities', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchOpportunities(), 300);
        return () => clearTimeout(timer);
    }, [search, typeFilter]);

    const handleCreateOpportunity = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('/opportunities', {
                ...newOpp,
                funding_amount: newOpp.funding_amount ? parseFloat(newOpp.funding_amount) : null,
                deadline: newOpp.deadline || null,
            });

            setFeedbackMsg({ text: 'Research opportunity published to the board.' });
            setPostModalOpen(false);
            setNewOpp({
                title: '',
                type: 'Fellowship',
                description: '',
                department: 'University-wide',
                funding_amount: '',
                deadline: '',
            });
            fetchOpportunities();
            setTimeout(() => setFeedbackMsg(null), 4000);
        } catch (err: any) {
            setFeedbackMsg({ text: err.response?.data?.message || 'Failed to post opportunity.', error: true });
        } finally {
            setSubmitting(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!applyModalItem) return;

        setSubmitting(true);
        try {
            await axios.post('/opportunity-applications', {
                opportunity_id: applyModalItem.id,
                statement_of_purpose: applicationForm.statement_of_purpose,
                gpa: applicationForm.gpa,
                academic_level: applicationForm.academic_level,
            });

            setFeedbackMsg({ text: `Application submitted successfully for ${applyModalItem.title}!` });
            setApplyModalItem(null);
            setApplicationForm({ statement_of_purpose: '', gpa: '', academic_level: 'Undergraduate' });
            setTimeout(() => setFeedbackMsg(null), 4000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to submit application.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this opportunity post?')) return;
        try {
            await axios.delete(`/opportunities/${id}`);
            setFeedbackMsg({ text: 'Opportunity removed.' });
            fetchOpportunities();
            setTimeout(() => setFeedbackMsg(null), 3000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete opportunity');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Research Opportunities Board</h1>
                    <p className="text-sm text-gray-500 mt-1">Institutional grants, student fellowships, research assistantships, and postdoc appointments</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setPostModalOpen(true)}
                        className="btn-primary flex items-center shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Post Opportunity
                    </button>
                )}
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
                            placeholder="Search opportunities..."
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Type:</span>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-nyu-primary focus:border-nyu-primary bg-white"
                        >
                            {types.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <div className="col-span-3 py-12 text-center text-gray-400">Loading opportunities...</div>
                    ) : opps.length === 0 ? (
                        <div className="col-span-3 py-12 text-center text-gray-400">No opportunities found.</div>
                    ) : (
                        opps.map(opp => (
                            <div key={opp.id} className="border border-gray-200 rounded-xl p-5 hover:border-nyu-primary hover:shadow-md transition-all bg-white flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-1.5 text-nyu-primary">
                                            <Briefcase className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">{opp.type}</span>
                                        </div>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDelete(opp.id)}
                                                className="text-gray-400 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">{opp.title}</h3>
                                    <p className="text-xs text-gray-600 mb-4 line-clamp-3 leading-relaxed">{opp.description}</p>
                                    <p className="text-xs font-medium text-gray-500 mb-2">{opp.department || 'University-wide'}</p>
                                    
                                    {opp.funding_amount && (
                                        <p className="text-xs font-semibold text-emerald-700 flex items-center mb-2">
                                            <DollarSign className="w-3.5 h-3.5 mr-0.5" /> Award: ${Number(opp.funding_amount).toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-3">
                                    <span className="text-xs text-red-600 font-medium flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" /> Deadline: {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : 'Rolling'}
                                    </span>
                                    {isStudent ? (
                                        <button
                                            onClick={() => setApplyModalItem(opp)}
                                            className="px-3 py-1.5 bg-nyu-primary text-white rounded text-xs font-semibold hover:bg-nyu-deep shadow-sm flex items-center"
                                        >
                                            <Send className="w-3 h-3 mr-1" /> Apply
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 font-medium">Active</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Post Opportunity Modal */}
            {postModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <form onSubmit={handleCreateOpportunity} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Post Research Opportunity</h3>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Title *</label>
                            <input
                                type="text"
                                required
                                value={newOpp.title}
                                onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
                                placeholder="e.g. Graduate Research Assistant in Bio-AI"
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Type *</label>
                                <select
                                    value={newOpp.type}
                                    onChange={(e) => setNewOpp({ ...newOpp, type: e.target.value })}
                                    className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                                >
                                    {types.filter(t => t !== 'All').map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Department</label>
                                <input
                                    type="text"
                                    value={newOpp.department}
                                    onChange={(e) => setNewOpp({ ...newOpp, department: e.target.value })}
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Stipend / Award ($)</label>
                                <input
                                    type="number"
                                    value={newOpp.funding_amount}
                                    onChange={(e) => setNewOpp({ ...newOpp, funding_amount: e.target.value })}
                                    placeholder="25000"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Application Deadline</label>
                                <input
                                    type="date"
                                    value={newOpp.deadline}
                                    onChange={(e) => setNewOpp({ ...newOpp, deadline: e.target.value })}
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description & Requirements *</label>
                            <textarea
                                rows={4}
                                required
                                value={newOpp.description}
                                onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
                                placeholder="Candidate prerequisites, laboratory duties, tuition benefits..."
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setPostModalOpen(false)}
                                className="px-4 py-2 border rounded text-xs text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary text-xs shadow disabled:opacity-50"
                            >
                                {submitting ? 'Publishing...' : 'Publish Opportunity'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Student Application Modal */}
            {applyModalItem && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <form onSubmit={handleApply} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Apply: {applyModalItem.title}</h3>
                        <p className="text-xs text-gray-500">Submit your statement of purpose and academic qualifications to the faculty lab.</p>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Academic Level *</label>
                                <select
                                    value={applicationForm.academic_level}
                                    onChange={(e) => setApplicationForm({ ...applicationForm, academic_level: e.target.value })}
                                    className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                                >
                                    <option value="Undergraduate">Undergraduate</option>
                                    <option value="Masters">Masters</option>
                                    <option value="PhD">PhD Candidate</option>
                                    <option value="Postdoc">Postdoctoral Fellow</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Cumulative GPA</label>
                                <input
                                    type="text"
                                    value={applicationForm.gpa}
                                    onChange={(e) => setApplicationForm({ ...applicationForm, gpa: e.target.value })}
                                    placeholder="3.85"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Statement of Purpose * (min 20 characters)</label>
                            <textarea
                                rows={5}
                                required
                                minLength={20}
                                value={applicationForm.statement_of_purpose}
                                onChange={(e) => setApplicationForm({ ...applicationForm, statement_of_purpose: e.target.value })}
                                placeholder="Explain your research interest, relevant technical skills, and academic goals..."
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setApplyModalItem(null)}
                                className="px-4 py-2 border rounded text-xs text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary text-xs shadow disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default OpportunitiesList;
