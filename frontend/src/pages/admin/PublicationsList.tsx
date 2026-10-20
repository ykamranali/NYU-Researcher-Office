import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Plus, ExternalLink, Filter, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import axios from '../../api/axios';

const PublicationsList = () => {
    const [publications, setPublications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

    const [newPub, setNewPub] = useState({
        title: '',
        authors: '',
        author_affiliations: '',
        journal_conference: '',
        publication_year: new Date().getFullYear(),
        doi: '',
        url: '',
        publication_type: 'Journal Article',
        abstract: '',
    });

    const pubTypes = ['All', 'Journal Article', 'Conference Paper', 'Book Chapter', 'Pre-print', 'Patent'];

    const fetchPublications = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search.trim()) params.search = search.trim();
            if (typeFilter !== 'All') params.type = typeFilter;

            const res = await axios.get('/publications', { params });
            setPublications(res.data || []);
        } catch (error) {
            console.error('Failed to load publications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchPublications(), 300);
        return () => clearTimeout(timer);
    }, [search, typeFilter]);

    const handleCreatePublication = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('/publications', newPub);
            setFeedbackMsg({ text: 'Publication added to the university research directory.' });
            setModalOpen(false);
            setNewPub({
                title: '',
                authors: '',
                author_affiliations: '',
                journal_conference: '',
                publication_year: new Date().getFullYear(),
                doi: '',
                url: '',
                publication_type: 'Journal Article',
                abstract: '',
            });
            fetchPublications();
            setTimeout(() => setFeedbackMsg(null), 4000);
        } catch (err: any) {
            setFeedbackMsg({ text: err.response?.data?.message || 'Failed to record publication.', error: true });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this publication?')) return;
        try {
            await axios.delete(`/publications/${id}`);
            setFeedbackMsg({ text: 'Publication removed from directory.' });
            fetchPublications();
            setTimeout(() => setFeedbackMsg(null), 3000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete publication.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Publications Directory</h1>
                    <p className="text-sm text-gray-500 mt-1">Peer-reviewed literature, conference proceedings, pre-prints, and patents</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="btn-primary flex items-center shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Publication
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
                            placeholder="Search by title, author, journal, or DOI..."
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
                            {pubTypes.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="py-12 text-center text-gray-400">Loading publications directory...</div>
                    ) : publications.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">No publications found matching your search.</div>
                    ) : (
                        publications.map(pub => (
                            <div key={pub.id} className="p-4 border border-gray-200 rounded-lg hover:border-nyu-primary transition-all bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="bg-nyu-light/20 text-nyu-primary text-xs px-2.5 py-0.5 rounded font-semibold">
                                            {pub.publication_type}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium">({pub.publication_year})</span>
                                        {pub.verification_status === 'Verified' && (
                                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 leading-snug">{pub.title}</h3>
                                    <p className="text-xs text-gray-600 font-medium">{pub.authors}</p>
                                    <p className="text-xs text-gray-500 italic">{pub.journal_conference}</p>
                                    {pub.doi && (
                                        <p className="text-xs text-nyu-primary font-mono mt-0.5">DOI: {pub.doi}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 self-end md:self-auto">
                                    {(pub.url || pub.doi) && (
                                        <a
                                            href={pub.url || `https://doi.org/${pub.doi}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-500 hover:text-nyu-primary p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                            title="Open External Source"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleDelete(pub.id)}
                                        className="text-red-500 hover:text-red-700 p-2 border border-red-200 rounded hover:bg-red-50 transition-colors"
                                        title="Delete publication"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Publication Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <form onSubmit={handleCreatePublication} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-gray-900">Add Academic Publication</h3>
                        <p className="text-xs text-gray-500">Record bibliographic research outputs with DOI duplicate prevention.</p>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Title *</label>
                            <input
                                type="text"
                                required
                                value={newPub.title}
                                onChange={(e) => setNewPub({ ...newPub, title: e.target.value })}
                                placeholder="Article or conference paper title..."
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Authors (comma-separated) *</label>
                            <input
                                type="text"
                                required
                                value={newPub.authors}
                                onChange={(e) => setNewPub({ ...newPub, authors: e.target.value })}
                                placeholder="Dr. Jane Smith, A. Johnson, Dr. Robert Chen"
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Journal / Conference *</label>
                                <input
                                    type="text"
                                    required
                                    value={newPub.journal_conference}
                                    onChange={(e) => setNewPub({ ...newPub, journal_conference: e.target.value })}
                                    placeholder="IEEE Trans. Medical Imaging"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Publication Year *</label>
                                <input
                                    type="number"
                                    required
                                    value={newPub.publication_year}
                                    onChange={(e) => setNewPub({ ...newPub, publication_year: parseInt(e.target.value) || 2026 })}
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Publication Type</label>
                                <select
                                    value={newPub.publication_type}
                                    onChange={(e) => setNewPub({ ...newPub, publication_type: e.target.value })}
                                    className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                                >
                                    {pubTypes.filter(t => t !== 'All').map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">DOI (Digital Object Identifier)</label>
                                <input
                                    type="text"
                                    value={newPub.doi}
                                    onChange={(e) => setNewPub({ ...newPub, doi: e.target.value })}
                                    placeholder="10.1145/3544548.3581234"
                                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">URL (Publisher or Pre-print Link)</label>
                            <input
                                type="url"
                                value={newPub.url}
                                onChange={(e) => setNewPub({ ...newPub, url: e.target.value })}
                                placeholder="https://doi.org/10.1145/..."
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Abstract Summary</label>
                            <textarea
                                rows={3}
                                value={newPub.abstract}
                                onChange={(e) => setNewPub({ ...newPub, abstract: e.target.value })}
                                placeholder="Brief overview of research findings..."
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
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
                                {submitting ? 'Registering...' : 'Add to Directory'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PublicationsList;
