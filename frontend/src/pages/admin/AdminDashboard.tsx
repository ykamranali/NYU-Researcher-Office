import React from 'react';
import { Users, FlaskConical, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
    
    // Placeholder statistics
    const stats = [
        { label: 'Total Researchers', value: '1,254', icon: Users, color: 'text-nyu-primary', bg: 'bg-nyu-veryLight' },
        { label: 'Active Projects', value: '482', icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Publications', value: '3,205', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Pending Approvals', value: '18', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    ];

    const recentProjects = [
        { id: 'PRJ-2026-001', title: 'AI-Based Healthcare Diagnostics', pi: 'Dr. Alan Turing', status: 'Active' },
        { id: 'PRJ-2026-002', title: 'Smart City Infrastructure Modeling', pi: 'Dr. Jane Jacobs', status: 'Under Review' },
        { id: 'PRJ-2026-003', title: 'Renewable Energy Optimization', pi: 'Dr. Nikola Tesla', status: 'Active' },
        { id: 'PRJ-2026-004', title: 'Cybersecurity Threat Detection', pi: 'Dr. Grace Hopper', status: 'Completed' },
    ];

    return (
        <div className="space-y-6">
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-gray-900">Dashboard Overview</h1>
                <button className="btn-primary">Generate Report</button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Projects Table */}
                <div className="card lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Recent Projects</h3>
                        <a href="/admin/research" className="text-nyu-primary text-sm font-medium hover:underline">View All</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="py-3 px-4 font-semibold text-gray-600">ID</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">Title</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">Principal Investigator</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProjects.map(project => (
                                    <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-900">{project.id}</td>
                                        <td className="py-3 px-4 text-gray-700">{project.title}</td>
                                        <td className="py-3 px-4 text-gray-600">{project.pi}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                project.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                'bg-orange-100 text-orange-800'
                                            }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notifications/Approvals Panel */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Needs Attention</h3>
                    </div>
                    <div className="space-y-4">
                        
                        <div className="flex items-start space-x-3 p-3 bg-nyu-veryLight rounded-lg border border-nyu-light/30">
                            <AlertCircle className="w-5 h-5 text-nyu-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">New Project Submission</p>
                                <p className="text-xs text-gray-600 mt-1">Dr. Smith submitted "Quantum Computing Advances".</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 bg-nyu-veryLight rounded-lg border border-nyu-light/30">
                            <AlertCircle className="w-5 h-5 text-nyu-primary flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Ethics Approval Required</p>
                                <p className="text-xs text-gray-600 mt-1">Clinical trials documentation pending review.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Grant Funded</p>
                                <p className="text-xs text-gray-600 mt-1">$2.5M NSF grant approved for AI Lab.</p>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
