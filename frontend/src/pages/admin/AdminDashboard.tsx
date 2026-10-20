import React, { useEffect, useState } from 'react';
import { Users, FlaskConical, BookOpen, Clock, CheckCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_researchers: 0,
        active_projects: 0,
        approved_projects: 0,
        pending_approvals: 0,
        total_publications: 0,
        total_funding: 0,
    });
    const [recentProjects, setRecentProjects] = useState<any[]>([]);
    const [pendingItems, setPendingItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, projectsRes, approvalsRes] = await Promise.all([
                axios.get('/dashboard/stats'),
                axios.get('/projects?per_page=5'),
                axios.get('/approvals'),
            ]);

            setStats(statsRes.data);
            setRecentProjects(projectsRes.data.data || []);
            setPendingItems(approvalsRes.data.slice(0, 4) || []);
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const statCards = [
        { 
            label: 'Total Researchers', 
            value: stats.total_researchers || 7, 
            icon: Users, 
            color: 'text-nyu-primary', 
            bg: 'bg-nyu-veryLight',
            subtext: 'Faculty & Scholars'
        },
        { 
            label: 'Active Projects', 
            value: stats.active_projects || 0, 
            icon: FlaskConical, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50',
            subtext: `${stats.approved_projects || 0} approved total`
        },
        { 
            label: 'Publications', 
            value: stats.total_publications || 0, 
            icon: BookOpen, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50',
            subtext: 'Peer-reviewed items'
        },
        { 
            label: 'Pending Approvals', 
            value: stats.pending_approvals || pendingItems.length || 0, 
            icon: Clock, 
            color: 'text-orange-500', 
            bg: 'bg-orange-50',
            subtext: 'Action required'
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Institutional Research Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time governance, project lifecycle metrics, and compliance queues</p>
                </div>
                <div className="flex space-x-3">
                    <button 
                        onClick={fetchDashboardData} 
                        className="btn-secondary flex items-center px-3 py-2 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50"
                        title="Refresh metrics"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button 
                        onClick={() => navigate('/admin/reports')} 
                        className="btn-primary flex items-center px-4 py-2 bg-nyu-primary text-white rounded text-sm hover:bg-nyu-deep shadow-sm"
                    >
                        View Reports & Analytics
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="card flex items-center space-x-4 border border-gray-100 shadow-sm">
                        <div className={`p-4 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-7 h-7 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-0.5">
                                {loading ? '...' : stat.value}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{stat.subtext}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects Table */}
                <div className="card lg:col-span-2 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Recent Institutional Projects</h3>
                            <p className="text-xs text-gray-500">Live records from research database</p>
                        </div>
                        <Link to="/admin/research" className="text-nyu-primary text-sm font-semibold hover:underline flex items-center">
                            View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs">Reference</th>
                                    <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs">Title</th>
                                    <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs">Principal Investigator</th>
                                    <th className="py-2.5 px-3 font-semibold text-gray-600 text-xs">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="py-8 text-center text-gray-400">Loading live project data...</td></tr>
                                ) : recentProjects.length === 0 ? (
                                    <tr><td colSpan={4} className="py-8 text-center text-gray-400">No project proposals found.</td></tr>
                                ) : (
                                    recentProjects.map((project: any) => (
                                        <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-3 font-mono text-xs font-semibold text-gray-900">
                                                <Link to={`/admin/research/${project.id}`} className="hover:text-nyu-primary hover:underline">
                                                    {project.project_code}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-3 text-gray-800 font-medium max-w-xs truncate">{project.title}</td>
                                            <td className="py-3 px-3 text-gray-600">{project.user?.name || project.contact_person || 'Faculty PI'}</td>
                                            <td className="py-3 px-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    project.status === 'Active' || project.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                                    project.status === 'Submitted' || project.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                                                    project.status === 'Revision Requested' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Unified Needs Attention / Approvals Panel */}
                <div className="card border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Review Inbox</h3>
                                <p className="text-xs text-gray-500">Requires administrative sign-off</p>
                            </div>
                            <Link to="/admin/approvals" className="text-nyu-primary text-xs font-semibold hover:underline">
                                Inbox ({pendingItems.length})
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <p className="text-xs text-gray-400 text-center py-6">Checking review queue...</p>
                            ) : pendingItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    <p className="text-xs font-medium">All review queues are clear!</p>
                                </div>
                            ) : (
                                pendingItems.map((item, idx) => (
                                    <div key={idx} className="p-3 bg-nyu-veryLight/60 rounded-lg border border-nyu-light/30 hover:border-nyu-primary transition-colors">
                                        <div className="flex items-center justify-between text-xs font-semibold text-nyu-primary mb-1">
                                            <span>{item.type}</span>
                                            <span className="text-gray-400 font-mono">{item.id}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">Submitted by {item.applicant} • {item.date}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <Link 
                            to="/admin/approvals" 
                            className="w-full flex justify-center items-center py-2 px-3 border border-nyu-primary text-nyu-primary rounded-md text-xs font-semibold hover:bg-nyu-veryLight transition-colors"
                        >
                            Open Review & Approvals Center <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
