import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import axios from '../../../api/axios';
import { ArrowLeft, Save, Send, CheckCircle, AlertTriangle, XCircle, FileText, Clock, UserCheck } from 'lucide-react';

const ProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isEdit = Boolean(id);
    const isProfessor = location.pathname.startsWith('/professor');
    const backUrl = isProfessor ? '/professor/projects' : '/admin/research';

    const [metadata, setMetadata] = useState<{ faculties: any[]; departments: any[]; categories: any[] }>({
        faculties: [],
        departments: [],
        categories: [],
    });

    const [formData, setFormData] = useState({
        title: '',
        short_description: '',
        full_description: '',
        research_abstract: '',
        research_category_id: '',
        department_id: '',
        faculty_id: '',
        start_date: '',
        expected_completion_date: '',
        funding_source: '',
        funding_amount: '',
        visibility: 'Private',
        status: 'Draft',
        project_code: '',
        user: null as any,
        reviews: [] as any[],
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewDecision, setReviewDecision] = useState<'Approved' | 'Revision Requested' | 'Rejected'>('Approved');
    const [reviewComments, setReviewComments] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const canReview = currentUser && (currentUser.role === 'Super Admin' || currentUser.role === 'Office Admin' || currentUser.role === 'Reviewer');
    const isOwner = currentUser && formData.user && currentUser.id === formData.user.id;

    useEffect(() => {
        // Fetch Taxonomies
        axios.get('/metadata').then(res => {
            setMetadata(res.data);
        }).catch(err => console.error(err));

        if (isEdit) {
            fetchProject();
        }
    }, [id]);

    const fetchProject = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/projects/${id}`);
            const data = res.data;
            setFormData({
                title: data.title || '',
                short_description: data.short_description || '',
                full_description: data.full_description || '',
                research_abstract: data.research_abstract || '',
                research_category_id: data.research_category_id || '',
                department_id: data.department_id || '',
                faculty_id: data.faculty_id || '',
                start_date: data.start_date ? data.start_date.split('T')[0] : '',
                expected_completion_date: data.expected_completion_date ? data.expected_completion_date.split('T')[0] : '',
                funding_source: data.funding_source || '',
                funding_amount: data.funding_amount || '',
                visibility: data.visibility || 'Private',
                status: data.status || 'Draft',
                project_code: data.project_code || '',
                user: data.user || null,
                reviews: data.reviews || [],
            });
        } catch (error: any) {
            setErrorMsg('Failed to load project details.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setSaving(true);

        const payload = {
            title: formData.title,
            short_description: formData.short_description,
            full_description: formData.full_description,
            research_abstract: formData.research_abstract,
            research_category_id: formData.research_category_id || null,
            department_id: formData.department_id || null,
            faculty_id: formData.faculty_id || null,
            start_date: formData.start_date || null,
            expected_completion_date: formData.expected_completion_date || null,
            funding_source: formData.funding_source || null,
            funding_amount: formData.funding_amount ? parseFloat(formData.funding_amount) : null,
            visibility: formData.visibility,
        };

        try {
            if (isEdit) {
                await axios.put(`/projects/${id}`, payload);
                setSuccessMsg('Project updated successfully.');
            } else {
                const res = await axios.post('/projects', payload);
                setSuccessMsg('Project created successfully in Draft status.');
                setTimeout(() => navigate(`${backUrl}/${res.data.project.id}`), 1000);
            }
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || 'Error saving project. Please check required fields.');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmitForReview = async () => {
        if (!window.confirm('Submit this research proposal for institutional review?')) return;
        try {
            await axios.post(`/projects/${id}/submit`);
            setSuccessMsg('Proposal submitted for institutional review.');
            fetchProject();
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Failed to submit proposal.');
        }
    };

    const handleExecuteReview = async () => {
        if (!reviewComments.trim()) {
            alert('Please provide review comments or rationale.');
            return;
        }

        try {
            await axios.post(`/projects/${id}/review`, {
                decision: reviewDecision,
                comments: reviewComments,
                stage: 'Research Office Review',
            });
            setReviewModalOpen(false);
            setReviewComments('');
            setSuccessMsg(`Review decision '${reviewDecision}' recorded successfully.`);
            fetchProject();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to submit review decision.');
        }
    };

    if (loading) {
        return <div className="p-12 text-center text-gray-500">Loading project records...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                    <Link to={backUrl} className="p-2 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200 bg-white shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </Link>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-heading font-bold text-gray-900">
                                {isEdit ? `Project: ${formData.project_code || 'Proposal'}` : 'Submit Research Proposal'}
                            </h1>
                            {isEdit && (
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    formData.status === 'Approved' || formData.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                    formData.status === 'Submitted' || formData.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                                    formData.status === 'Revision Requested' ? 'bg-amber-100 text-amber-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {formData.status}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {isEdit ? `Principal Investigator: ${formData.user?.name || 'Assigned Faculty'}` : 'Initialize a new research proposal lifecycle'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {isEdit && (formData.status === 'Draft' || formData.status === 'Revision Requested') && (
                        <button
                            type="button"
                            onClick={handleSubmitForReview}
                            className="btn-secondary flex items-center text-xs px-3 py-2 border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded shadow-sm"
                        >
                            <Send className="w-3.5 h-3.5 mr-1.5" /> Submit for Review
                        </button>
                    )}

                    {isEdit && canReview && !isOwner && formData.status !== 'Draft' && (
                        <button
                            type="button"
                            onClick={() => setReviewModalOpen(true)}
                            className="btn-primary flex items-center text-xs px-3 py-2 bg-nyu-primary text-white hover:bg-nyu-deep rounded shadow-sm"
                        >
                            <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Execute Review
                        </button>
                    )}
                </div>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-800 text-sm rounded shadow-sm flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" /> {errorMsg}
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-emerald-800 text-sm rounded shadow-sm flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" /> {successMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} className="card space-y-6 border border-gray-100 shadow-sm">
                {/* Core Title & Category */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">1. Research Proposal Overview</h3>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Project Title *</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary focus:border-nyu-primary text-sm"
                            placeholder="e.g. Federated Learning for Multi-Clinic Oncology Diagnostics"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Strategic Category</label>
                            <select
                                name="research_category_id"
                                value={formData.research_category_id}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary focus:border-nyu-primary text-sm bg-white"
                            >
                                <option value="">Select Research Category</option>
                                {metadata.categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">School / Faculty</label>
                            <select
                                name="faculty_id"
                                value={formData.faculty_id}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary focus:border-nyu-primary text-sm bg-white"
                            >
                                <option value="">Select Faculty</option>
                                {metadata.faculties.map(fac => (
                                    <option key={fac.id} value={fac.id}>{fac.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Department</label>
                            <select
                                name="department_id"
                                value={formData.department_id}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary focus:border-nyu-primary text-sm bg-white"
                            >
                                <option value="">Select Department</option>
                                {metadata.departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Narrative Descriptions */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">2. Research Narrative & Abstract</h3>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Short Description (Executive Summary) *</label>
                        <textarea
                            name="short_description"
                            required
                            rows={2}
                            value={formData.short_description}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary focus:border-nyu-primary text-sm"
                            placeholder="Brief summary of research impact and objectives..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Academic Abstract</label>
                        <textarea
                            name="research_abstract"
                            rows={3}
                            value={formData.research_abstract}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary focus:border-nyu-primary text-sm"
                            placeholder="Formal abstract suitable for academic publication..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Methodology & Scope</label>
                        <textarea
                            name="full_description"
                            rows={5}
                            value={formData.full_description}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary focus:border-nyu-primary text-sm"
                            placeholder="Detailed experimental procedures, milestones, equipment, etc..."
                        />
                    </div>
                </div>

                {/* Timeline & Funding */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">3. Timeline & Financial Budget</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Target Start Date</label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Expected Completion Date</label>
                            <input
                                type="date"
                                name="expected_completion_date"
                                value={formData.expected_completion_date}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Funding Agency / Source</label>
                            <input
                                type="text"
                                name="funding_source"
                                value={formData.funding_source}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                placeholder="e.g. NSF, NIH, DOE, or NYU Internal Seed"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Total Budget ($ USD)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="funding_amount"
                                value={formData.funding_amount}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate(backUrl)}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                    >
                        Back to List
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary flex items-center shadow-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* Review Decision Audit Trail */}
            {isEdit && formData.reviews && formData.reviews.length > 0 && (
                <div className="card space-y-4 border border-gray-100 shadow-sm mt-8">
                    <h3 className="text-base font-bold text-gray-900 border-b pb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-nyu-primary" /> Institutional Review & Decision History
                    </h3>
                    <div className="space-y-3">
                        {formData.reviews.map((rev: any, idx: number) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-gray-800">{rev.stage} • Decision: 
                                        <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                                            rev.decision === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                            rev.decision === 'Revision Requested' ? 'bg-amber-100 text-amber-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {rev.decision}
                                        </span>
                                    </span>
                                    <span className="text-xs text-gray-500">{new Date(rev.decided_at || rev.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{rev.comments}</p>
                                <p className="text-xs text-gray-400 mt-1 font-medium">Reviewer: {rev.reviewer?.name || 'Research Administrator'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal: Execute Review */}
            {reviewModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900">Official Research Review Decision</h3>
                        <p className="text-xs text-gray-500">Record institutional governance evaluation for {formData.project_code}</p>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Review Decision</label>
                            <select
                                value={reviewDecision}
                                onChange={(e: any) => setReviewDecision(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                            >
                                <option value="Approved">Approved (Public clearance granted)</option>
                                <option value="Revision Requested">Revision Requested (Return to PI for amendments)</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Review Comments & Justification *</label>
                            <textarea
                                rows={4}
                                required
                                value={reviewComments}
                                onChange={(e) => setReviewComments(e.target.value)}
                                placeholder="Enter committee notes, required modifications, or approval justification..."
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setReviewModalOpen(false)}
                                className="px-4 py-2 border rounded text-xs text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteReview}
                                className="px-4 py-2 bg-nyu-primary text-white rounded text-xs font-semibold hover:bg-nyu-deep shadow"
                            >
                                Submit Review Decision
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectForm;
