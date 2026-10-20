import React, { useEffect, useState } from 'react';
import { Book, Award, Briefcase, ChevronRight, FileText, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

const StudentDashboard = () => {
    const [opportunities, setOpportunities] = useState<any[]>([]);
    const [myApplications, setMyApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [oppsRes, appsRes] = await Promise.all([
                    axios.get('/opportunities?active_only=1'),
                    axios.get('/opportunity-applications'),
                ]);
                setOpportunities(oppsRes.data.slice(0, 4) || []);
                setMyApplications(appsRes.data.slice(0, 4) || []);
            } catch (err) {
                console.error('Failed to load student dashboard', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Student & Scholar Research Portal</h1>
                <p className="text-sm text-gray-500 mt-1">Discover funded research opportunities, manage applications, and maintain your academic CV</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/student/opportunities" className="card group hover:bg-nyu-primary transition-all cursor-pointer flex flex-col items-center text-center p-6 border border-gray-100 shadow-sm">
                    <div className="p-3 bg-nyu-veryLight rounded-full text-nyu-primary group-hover:bg-white/20 group-hover:text-white mb-3 transition-colors">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-white mb-1">Find Opportunities</h3>
                    <p className="text-xs text-gray-500 group-hover:text-nyu-veryLight">Browse assistantships, fellowships, and lab positions.</p>
                </Link>

                <Link to="/student/applications" className="card group hover:bg-nyu-primary transition-all cursor-pointer flex flex-col items-center text-center p-6 border border-gray-100 shadow-sm">
                    <div className="p-3 bg-nyu-veryLight rounded-full text-nyu-primary group-hover:bg-white/20 group-hover:text-white mb-3 transition-colors">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-white mb-1">My Applications ({myApplications.length})</h3>
                    <p className="text-xs text-gray-500 group-hover:text-nyu-veryLight">Track submissions and review decisions.</p>
                </Link>

                <Link to="/student/profile" className="card group hover:bg-nyu-primary transition-all cursor-pointer flex flex-col items-center text-center p-6 border border-gray-100 shadow-sm">
                    <div className="p-3 bg-nyu-veryLight rounded-full text-nyu-primary group-hover:bg-white/20 group-hover:text-white mb-3 transition-colors">
                        <Award className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-white mb-1">Researcher Profile</h3>
                    <p className="text-xs text-gray-500 group-hover:text-nyu-veryLight">Update ORCID, research interests, and bio.</p>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Featured Opportunities */}
                <div className="card border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-gray-800 flex items-center">
                            <Book className="w-4 h-4 mr-2 text-nyu-primary" />
                            Open Research Opportunities
                        </h3>
                        <Link to="/student/opportunities" className="text-xs text-nyu-primary font-semibold hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-xs text-gray-400 py-6 text-center">Loading opportunities...</p>
                        ) : opportunities.length === 0 ? (
                            <p className="text-xs text-gray-400 py-6 text-center">No active postings at this time.</p>
                        ) : (
                            opportunities.map(opp => (
                                <div key={opp.id} className="p-3 bg-gray-50 rounded-lg border border-gray-150 hover:border-nyu-light transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{opp.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{opp.department} • Deadline: {opp.deadline || 'Rolling'}</p>
                                        </div>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-nyu-veryLight text-nyu-primary">
                                            {opp.type}
                                        </span>
                                    </div>
                                    <Link to="/student/opportunities" className="mt-2 text-xs font-semibold text-nyu-primary hover:text-nyu-deep flex items-center">
                                        Apply Now <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Application Status */}
                <div className="card border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-gray-800">Recent Applications</h3>
                        <Link to="/student/applications" className="text-xs text-nyu-primary font-semibold hover:underline">
                            View All
                        </Link>
                    </div>
                    
                    {loading ? (
                        <p className="text-xs text-gray-400 py-6 text-center">Loading applications...</p>
                    ) : myApplications.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg">
                            <p className="text-xs">You have no active applications.</p>
                            <Link to="/student/opportunities" className="text-xs text-nyu-primary font-semibold underline mt-2 inline-block">
                                Find an opportunity to apply
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myApplications.map(app => (
                                <div key={app.id} className="p-3 border border-gray-200 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{app.opportunity?.title || 'Research Position'}</p>
                                        <p className="text-xs text-gray-400 font-mono mt-0.5">{app.application_number}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                        app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                                        app.status === 'Submitted' || app.status === 'Under Review' ? 'bg-amber-100 text-amber-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
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
