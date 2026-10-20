import React, { useEffect, useState } from 'react';
import { Files, Upload, Download, Trash2, Search, Filter, Lock, Globe, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import axios from '../../api/axios';

const DocumentCenter = () => {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [docTitle, setDocTitle] = useState('');
    const [docCategory, setDocCategory] = useState('General');
    const [isPublic, setIsPublic] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

    const categories = ['All', 'General', 'Proposal', 'Ethics Protocol', 'Financial', 'Consent Form', 'Data Management', 'Report'];

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search.trim()) params.search = search.trim();
            if (categoryFilter !== 'All') params.category = categoryFilter;

            const res = await axios.get('/documents', { params });
            setDocs(res.data || []);
        } catch (error) {
            console.error('Failed to load documents', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchDocuments(), 300);
        return () => clearTimeout(timer);
    }, [search, categoryFilter]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileToUpload) {
            alert('Please select a file to upload.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('title', docTitle || fileToUpload.name);
        formData.append('category', docCategory);
        formData.append('is_public', isPublic ? '1' : '0');

        try {
            await axios.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setFeedbackMsg({ text: 'Document securely uploaded and encrypted into institutional repository.' });
            setUploadModalOpen(false);
            setFileToUpload(null);
            setDocTitle('');
            fetchDocuments();
            setTimeout(() => setFeedbackMsg(null), 4000);
        } catch (err: any) {
            setFeedbackMsg({ text: err.response?.data?.message || 'File upload failed.', error: true });
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (id: number, filename: string) => {
        try {
            const res = await axios.get(`/documents/${id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            alert('Failed to download file. You may not have clearance for this confidential document.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this document from the institutional repository?')) return;
        try {
            await axios.delete(`/documents/${id}`);
            setFeedbackMsg({ text: 'Document removed from storage.' });
            fetchDocuments();
            setTimeout(() => setFeedbackMsg(null), 3000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete document');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Secure Document Repository</h1>
                    <p className="text-sm text-gray-500 mt-1">Encrypted institutional storage for proposals, ethics protocols, and financial reports</p>
                </div>
                <button
                    onClick={() => setUploadModalOpen(true)}
                    className="btn-primary flex items-center shadow-sm"
                >
                    <Upload className="w-4 h-4 mr-2" /> Upload Document
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
                            placeholder="Search documents by title or file name..."
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Category:</span>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-nyu-primary focus:border-nyu-primary bg-white"
                        >
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Document Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Format</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Access</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Uploaded</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-400">Loading document vault...</td></tr>
                            ) : docs.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-400">
                                        No documents found. Use the button above to upload files.
                                    </td>
                                </tr>
                            ) : (
                                docs.map(doc => (
                                    <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 flex items-center">
                                            <Files className="w-4 h-4 text-nyu-primary mr-2 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-900">{doc.name}</p>
                                                {doc.original_name && doc.original_name !== doc.name && (
                                                    <p className="text-xs text-gray-400 font-mono">{doc.original_name}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-600">
                                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">{doc.category}</span>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono font-bold text-gray-600">{doc.type}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500">{doc.size}</td>
                                        <td className="px-4 py-3 text-xs">
                                            {doc.is_public ? (
                                                <span className="inline-flex items-center text-emerald-700 font-medium">
                                                    <Globe className="w-3 h-3 mr-1" /> Public
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-amber-700 font-medium">
                                                    <Lock className="w-3 h-3 mr-1" /> Confidential
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {doc.date}
                                        </td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <button
                                                onClick={() => handleDownload(doc.id, doc.original_name || `${doc.name}.${doc.type.toLowerCase()}`)}
                                                className="text-nyu-primary hover:text-nyu-deep p-1 rounded hover:bg-gray-100"
                                                title="Download Secure File"
                                            >
                                                <Download className="w-4 h-4 inline" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                                title="Delete File"
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

            {/* Upload Modal */}
            {uploadModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <form onSubmit={handleUpload} className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Upload to Repository</h3>
                        <p className="text-xs text-gray-500">Files are stored in private institutional storage with access control checks.</p>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Select File (PDF, DOCX, XLSX, max 15MB) *</label>
                            <input
                                type="file"
                                required
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setFileToUpload(e.target.files[0]);
                                        if (!docTitle) setDocTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                                    }
                                }}
                                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-nyu-veryLight file:text-nyu-primary hover:file:bg-nyu-light/30 border border-gray-300 rounded p-1"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Document Title</label>
                            <input
                                type="text"
                                value={docTitle}
                                onChange={(e) => setDocTitle(e.target.value)}
                                placeholder="Human-readable title..."
                                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                            <select
                                value={docCategory}
                                onChange={(e) => setDocCategory(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2 text-sm bg-white"
                            >
                                {categories.filter(c => c !== 'All').map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_public"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="h-4 w-4 text-nyu-primary focus:ring-nyu-primary border-gray-300 rounded"
                            />
                            <label htmlFor="is_public" className="text-xs text-gray-700 font-medium">
                                Mark as publicly accessible (uncheck for confidential research data)
                            </label>
                        </div>

                        <div className="flex justify-end space-x-3 pt-3 border-t">
                            <button
                                type="button"
                                onClick={() => setUploadModalOpen(false)}
                                className="px-4 py-2 border rounded text-xs text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={uploading}
                                className="btn-primary text-xs shadow disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload & Encrypt'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DocumentCenter;
