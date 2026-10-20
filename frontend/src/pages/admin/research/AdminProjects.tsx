import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import { Plus, Search, Filter, Trash2, Send, CheckCircle2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const AdminProjects = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProjects, setTotalProjects] = useState(0);
    const [actionMessage, setActionMessage] = useState('');
    const location = useLocation();

    const isProfessorView = location.pathname.startsWith('/professor');
    const basePath = isProfessorView ? '/professor/projects' : '/admin/research';

    const fetchProjects = async (page = 1, searchQuery = search, status = statusFilter) => {
        setLoading(true);
        try {
            const params: any = { page };
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (status !== 'All') params.status = status;

            const res = await axios.get('/projects', { params });
            setProjects(res.data.data || []);
            setCurrentPage(res.data.current_page || 1);
            setTotalPages(res.data.last_page || 1);
            setTotalProjects(res.data.total || 0);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProjects(1, search, statusFilter);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    const handleSubmitForReview = async (id: number) => {
        if (!window.confirm('Submit this research proposal for institutional review?')) return;
        try {
            await axios.post(`/projects/${id}/submit`);
            setActionMessage('Proposal submitted successfully for institutional review.');
            fetchProjects(currentPage);
            setTimeout(() => setActionMessage(''), 3000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to submit proposal');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this project proposal?')) return;
        try {
            await axios.delete(`/projects/${id}`);
            setActionMessage('Project deleted successfully.');
            fetchProjects(currentPage);
            setTimeout(() => setActionMessage(''), 3000);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete project');
        }
    };

    const statuses = ['All', 'Draft', 'Submitted', 'Under Review', 'Revision Requested', 'Approved', 'Active', 'Completed', 'Rejected'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Research Projects Directory</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isProfessorView ? 'Manage and track your research proposals & active grants' : 'Institutional portfolio, compliance statuses, and project lifecycles'}
                    </p>
                </div>
                <Link to={`${basePath}/new`} className="btn-primary flex items-center shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Research Proposal
                </Link>
            </div>

            {actionMessage && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-emerald-800 text-sm rounded shadow-sm flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /> {actionMessage}
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
                            placeholder="Search by code, title, or investigator..."
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-nyu-primary focus:border-nyu-primary bg-white"
                        >
                            {statuses.map(st => (
                                <option key={st} value={st}>{st}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="py-3 px-3 font-semibold text-gray-600 text-xs uppercase">Code</th>
                                <th className="py-3 px-3 font-semibold text-gray-600 text-xs uppercase">Project Title</th>
                                <th className="py-3 px-3 font-semibold text-gray-600 text-xs uppercase">Category</th>
                                <th className="py-3 px-3 font-semibold text-gray-600 text-xs uppercase">Investigator</th>
                                <th className="py-3 px-3 font-semibold text-gray-600 text-xs uppercase">Status</th>
                                <th className="py-3 px-3 font-semibold text-gray-600 text-xs uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Loading research portfolio...</td></tr>
                            ) : projects.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-400">
                                        No projects found matching the selected criteria.
                                    </td>
                                </tr>
                            ) : (
                                projects.map((project: any) => (
                                    <tr key={project.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-3 px-3 font-mono text-xs font-bold text-gray-900">
                                            {project.project_code}
                                        </td>
                                        <td className="py-3 px-3 text-gray-900 font-medium max-w-md">
                                            <Link to={`${basePath}/${project.id}`} className="hover:text-nyu-primary hover:underline">
                                                {project.title}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-3 text-xs text-gray-600">
                                            {project.category?.name || 'General Research'}
                                        </td>
                                        <td className="py-3 px-3 text-xs text-gray-700 font-medium">
                                            {project.user?.name || project.contact_person || 'Faculty PI'}
                                        </td>
                                        <td className="py-3 px-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                project.status === 'Approved' || project.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                                                project.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                                project.status === 'Submitted' || project.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                                                project.status === 'Revision Requested' ? 'bg-amber-100 text-amber-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                {project.status === 'Draft' && (
                                                    <button
                                                        onClick={() => handleSubmitForReview(project.id)}
                                                        title="Submit for Institutional Review"
                                                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium flex items-center"
                                                    >
                                                        <Send className="w-3 h-3 mr-1" /> Submit
                                                    </button>
                                                )}
                                                <Link 
                                                    to={`${basePath}/${project.id}`} 
                                                    className="p-1 text-nyu-primary hover:text-nyu-deep rounded hover:bg-gray-100"
                                                    title="View or Edit"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {project.status === 'Draft' && (
                                                    <button 
                                                        onClick={() => handleDelete(project.id)}
                                                        className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                                                        title="Delete draft"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 gap-3">
                    <p>Showing {projects.length} of {totalProjects} projects</p>
                    <div className="flex items-center space-x-2">
                        <button
                            disabled={currentPage <= 1}
                            onClick={() => fetchProjects(currentPage - 1)}
                            className="p-1.5 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
                        <button
                            disabled={currentPage >= totalPages}
                            onClick={() => fetchProjects(currentPage + 1)}
                            className="p-1.5 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProjects;
