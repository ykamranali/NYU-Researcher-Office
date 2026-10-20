import React from 'react';
import { FlaskConical, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfessorDashboard = () => {
    
    // Placeholder data for the professor's dashboard
    const stats = [
        { label: 'Active Projects', value: '3', icon: FlaskConical, color: 'text-nyu-primary', bg: 'bg-nyu-veryLight' },
        { label: 'Pending Approvals', value: '1', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Completed Grants', value: '7', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    const myProjects = [
        { id: 'PRJ-2026-003', title: 'Renewable Energy Optimization', status: 'Active' },
        { id: 'PRJ-2026-008', title: 'Carbon Capture Nanotech', status: 'Under Review' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">My Faculty Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="card flex items-center space-x-4">
                        <div className={`p-4 rounded-full ${stat.bg}`}>
                            <stat.icon className={`w-8 h-8 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* My Active Projects */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">My Recent Projects</h3>
                        <Link to="/professor/projects" className="text-nyu-primary text-sm font-medium hover:underline">View All</Link>
                    </div>
                    <div className="space-y-3">
                        {myProjects.map(project => (
                            <div key={project.id} className="p-4 bg-gray-50 rounded border border-gray-100 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-900">{project.title}</p>
                                    <p className="text-xs text-gray-500">{project.id}</p>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    project.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                }`}>
                                    {project.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6">
                        <Link to="/professor/projects/new" className="btn-primary w-full flex justify-center items-center">
                            Submit New Research Proposal <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {/* Tasks & Notifications */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Required Actions</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                            <Clock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Compliance Training Overdue</p>
                                <p className="text-xs text-gray-600 mt-1">Please complete the Human Subjects Ethics training by Friday.</p>
                                <button className="mt-2 text-xs font-bold text-red-600 hover:underline">Take Training</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessorDashboard;
