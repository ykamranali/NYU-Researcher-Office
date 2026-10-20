import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { CheckCircle, XCircle, Clock, RefreshCw, AlertCircle, ShieldAlert } from 'lucide-react';

const ApprovalsList = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('All');
    const [actionModal, setActionModal] = useState<{ open: boolean; type: 'Approve' | 'Reject'; item: any } | null>(null);
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const fetchApprovals = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/approvals');
            setItems(res.data || []);
        } catch (error) {
            console.error('Failed to load approvals queue', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    const handleActionSubmit = async () => {
        if (!actionModal) return;
        setSubmitting(true);
        try {
            const endpoint = actionModal.type === 'Approve' ? '/approvals/approve' : '/approvals/reject';
            await axios.post(endpoint, {
                entity_type: actionModal.item.entity_type,
                raw_id: actionModal.item.raw_id,
                comments: comments || (actionModal.type === 'Approve' ? 'Approved by Research Administration.' : 'Rejected per policy guidelines.'),
            });

            setStatusMsg(`Item ${actionModal.item.id} has been marked as ${actionModal.type === 'Approve' ? 'Approved' : 'Rejected'}.`);
            setActionModal(null);
            setComments('');
            fetchApprovals();
            setTimeout(() => setStatusMsg(''), 4000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Action failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredItems = items.filter(it => {
        if (filterType === 'All') return true;
        if (filterType === 'Projects') return it.entity_type === 'ResearchProject';
        if (filterType === 'Ethics') return it.entity_type === 'EthicsApplication';
        if (filterType === 'Grants') return it.entity_type === 'GrantApplication';
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Institutional Approvals Inbox</h1>
                    <p className="text-sm text-gray-500 mt-1">Unified multi-disciplinary queue for proposals, ethics protocols, and grant funding</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchApprovals}
                        className="btn-secondary flex items-center px-3 py-2 border rounded text-xs bg-white hover:bg-gray-50 shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white text-xs">
                        {['All', 'Projects', 'Ethics', 'Grants'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setFilterType(tab)}
                                className={`px-3 py-2 font-medium transition-colors ${
                                    filterType === tab ? 'bg-nyu-primary text-white' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {statusMsg && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-emerald-800 text-sm rounded shadow-sm flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" /> {statusMsg}
                </div>
            )}

            <div className="card space-y-4 border border-gray-100 shadow-sm">
                {loading ? (
                    <div className="py-12 text-center text-gray-500">Loading pending institutional approvals...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
                        <h3 className="text-base font-bold text-gray-800">All queues up to date</h3>
                        <p className="text-xs text-gray-500 mt-1">There are currently no items awaiting review in this category.</p>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <div key={item.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-nyu-light hover:shadow-sm transition-all bg-white gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{item.id}</span>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        item.entity_type === 'ResearchProject' ? 'bg-blue-100 text-blue-800' :
                                        item.entity_type === 'EthicsApplication' ? 'bg-purple-100 text-purple-800' :
                                        'bg-emerald-100 text-emerald-800'
                                    }`}>
                                        {item.type}
                                    </span>
                                    <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                        Stage: {item.current_stage}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                                <p className="text-xs text-gray-500">
                                    Submitted by <span className="font-semibold text-gray-700">{item.applicant}</span> on {item.date}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2 self-end md:self-auto">
                                {!item.can_approve ? (
                                    <span className="text-xs text-gray-400 italic flex items-center px-2 py-1 bg-gray-50 rounded border">
                                        <ShieldAlert className="w-3.5 h-3.5 mr-1 text-gray-400" /> Self-approval blocked
                                    </span>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setActionModal({ open: true, type: 'Approve', item })}
                                            className="flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-semibold transition-colors shadow-sm"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                                        </button>
                                        <button
                                            onClick={() => setActionModal({ open: true, type: 'Reject', item })}
                                            className="flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-xs font-semibold transition-colors shadow-sm"
                                        >
                                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Action Confirmation Modal */}
            {actionModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            {actionModal.type === 'Approve' ? 'Confirm Approval' : 'Reject Submission'}
                        </h3>
                        <p className="text-xs text-gray-500">
                            You are reviewing <span className="font-bold text-gray-700">{actionModal.item.id}</span>: {actionModal.item.title}
                        </p>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                                {actionModal.type === 'Approve' ? 'Approval Notes (Optional)' : 'Rejection Reason *'}
                            </label>
                            <textarea
                                rows={3}
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder={actionModal.type === 'Approve' ? 'Optional clearance remarks...' : 'Detailed explanation of why this item was rejected...'}
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setActionModal(null)}
                                className="px-4 py-2 border rounded text-xs text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={handleActionSubmit}
                                className={`px-4 py-2 rounded text-xs font-semibold text-white shadow ${
                                    actionModal.type === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {submitting ? 'Processing...' : `Confirm ${actionModal.type}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApprovalsList;
