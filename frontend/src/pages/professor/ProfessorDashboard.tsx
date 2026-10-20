import React, { useEffect, useState } from 'react';
import { FlaskConical, CheckCircle, Clock, ArrowRight, Plus, BookOpen, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

const ProfessorDashboard = () => {
    const [stats, setStats] = useState({
        active_projects: 0,
        pending_approvals: 0,
        completed_grants: 0,
    });
    const [myProjects, setMyProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        const fetchProfessorData = async () => {
            try {
                const [statsRes, projectsRes] = await Promise.all([
                    axios.get('/dashboard/stats'),
                    axios.get('/projects?per_page=5'),
                ]);

                if (statsRes.data?.professor_stats) {
                    setStats(statsRes.data.professor_stats);
                }
                setMyProjects(projectsRes.data.data || []);
            } catch (err) {
                console.error('Failed to load faculty dashboard', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfessorData();
    }, []);

    const statCards = [
        { label: 'Active Projects', value: stats.active_projects || myProjects.filter(p => p.status === 'Active').length, icon: FlaskConical, color: 'text-nyu-primary', bg: 'bg-nyu-veryLight' },
        { label: 'In Review / Revisions', value: stats.pending_approvals || myProjects.filter(p => p.status === 'Submitted' || p.status === 'Under Review' || p.status === 'Revision Requested').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Completed Grants', value: stats.completed_grants || myProjects.filter(p => p.status === 'Completed').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Faculty Research Hub</h1>
                    <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name || 'Professor'}. Manage your laboratory projects, grant lifecycle, and research directory.</p>
                </div>
                <Link to="/professor/projects/new" className="btn-primary flex items-center shadow-sm">
                    <Plus className="w-4 h-4 mr-2" /> New Research Proposal
                </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="card flex items-center space-x-4 border border-gray-100 shadow-sm">
                        <div className={`p-4 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-8 h-8 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-0.5">{loading ? '...' : stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* My Recent Projects */}
                <div className="card border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-gray-800">My Research Proposals & Grants</h3>
                        <Link to="/professor/projects" className="text-xs text-nyu-primary font-semibold hover:underline">View All</Link>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-xs text-gray-400 py-6 text-center">Loading your projects...</p>
                        ) : myProjects.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                                <p className="text-xs mb-3">You have not drafted any research proposals yet.</p>
                                <Link to="/professor/projects/new" className="btn-primary text-xs">
                                    Create First Proposal
                                </Link>
                            </div>
                        ) : (
                            myProjects.map(project => (
                                <div key={project.id} className="p-3 bg-gray-50 rounded-lg border border-gray-150 flex justify-between items-center">
                                    <div>
                                        <Link to={`/professor/projects/${project.id}`} className="font-bold text-gray-900 text-sm hover:text-nyu-primary">
                                            {project.title}
                                        </Link>
                                        <p className="text-xs text-gray-500 font-mono mt-0.5">{project.project_code} • {project.category?.name || 'General'}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        project.status === 'Active' || project.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                        project.status === 'Draft' ? 'bg-gray-200 text-gray-800' :
                                        'bg-amber-100 text-amber-800'
                                    }`}>
                                        {project.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100">
                        <Link to="/professor/projects/new" className="btn-primary w-full flex justify-center items-center text-xs shadow-sm">
                            Submit New Research Proposal <ArrowRight className="ml-2 w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Faculty Fast Links & Compliance */}
                <div className="card border border-gray-100 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-gray-800">Faculty Tools & Compliance</h3>
                    
                    <div className="space-y-3">
                        <Link to="/professor/publications" className="p-3 bg-gray-50 rounded-lg border border-gray-150 flex items-center justify-between hover:border-nyu-primary transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-50 text-nyu-primary rounded-lg">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Manage Publications</p>
                                    <p className="text-xs text-gray-500">Record articles, DOIs, and link to active grants</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                        </Link>

                        <Link to="/professor/settings" className="p-3 bg-gray-50 rounded-lg border border-gray-150 flex items-center justify-between hover:border-nyu-primary transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Profile & ORCID Settings</p>
                                    <p className="text-xs text-gray-500">Update academic biography, department, and research keywords</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                        </Link>
                    </div>

                    <div className="p-3 bg-nyu-veryLight/80 rounded-lg border border-nyu-light/30 text-xs text-gray-700">
                        <p className="font-semibold text-nyu-deep mb-1">Institutional Reminder:</p>
                        Human-subject and clinical protocols require prior clearance from the University IRB before grant fund disbursement.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessorDashboard;
