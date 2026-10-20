import React, { useEffect, useState } from 'react';
import { Book, Award, Briefcase, ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

const StudentDashboard = () => {
    
    const [opportunities, setOpportunities] = useState<any[]>([]);
    
    useEffect(() => {
        axios.get('/opportunities').then(res => {
            setOpportunities(res.data);
        }).catch(err => console.error(err));
    }, []);

    const myApplications = [
        { id: 'APP-1092', title: 'Data Science Fellowship', status: 'Under Review' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Student Research Portal</h1>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/student/opportunities" className="card group hover:bg-nyu-primary transition-colors cursor-pointer flex flex-col items-center text-center">
                    <Briefcase className="w-10 h-10 text-nyu-primary group-hover:text-white mb-4" />
                    <h3 className="font-bold text-gray-900 group-hover:text-white mb-2">Find Opportunities</h3>
                    <p className="text-sm text-gray-500 group-hover:text-nyu-veryLight">Browse assistantships, grants, and fellowships.</p>
                </Link>

                <Link to="/student/applications" className="card group hover:bg-nyu-primary transition-colors cursor-pointer flex flex-col items-center text-center">
                    <FileText className="w-10 h-10 text-nyu-primary group-hover:text-white mb-4" />
                    <h3 className="font-bold text-gray-900 group-hover:text-white mb-2">My Applications</h3>
                    <p className="text-sm text-gray-500 group-hover:text-nyu-veryLight">Track the status of your research applications.</p>
                </Link>

                <Link to="/student/profile" className="card group hover:bg-nyu-primary transition-colors cursor-pointer flex flex-col items-center text-center">
                    <Award className="w-10 h-10 text-nyu-primary group-hover:text-white mb-4" />
                    <h3 className="font-bold text-gray-900 group-hover:text-white mb-2">Researcher Profile</h3>
                    <p className="text-sm text-gray-500 group-hover:text-nyu-veryLight">Update your CV, skills, and academic interests.</p>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Featured Opportunities */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <Book className="w-5 h-5 mr-2 text-nyu-primary" />
                            Featured Opportunities
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {opportunities.map(opp => (
                            <div key={opp.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-nyu-light transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-900">{opp.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">Deadline: {opp.deadline}</p>
                                    </div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-nyu-veryLight text-nyu-primary">
                                        {opp.type}
                                    </span>
                                </div>
                                <button className="mt-3 text-sm font-semibold text-nyu-primary hover:text-nyu-deep flex items-center">
                                    View Details <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Application Status */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-800">My Application Status</h3>
                    </div>
                    
                    {myApplications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            You have no active applications.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myApplications.map(app => (
                                <div key={app.id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-900">{app.title}</p>
                                        <p className="text-xs text-gray-500">ID: {app.id}</p>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
