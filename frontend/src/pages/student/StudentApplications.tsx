import React, { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

const StudentApplications = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/opportunity-applications');
            setApplications(res.data || []);
        } catch (error) {
            console.error('Failed to load applications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">My Research Applications</h1>
                    <p className="text-sm text-gray-500 mt-1">Track the status of your fellowship, assistantship, and grant applications</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchApplications}
                        className="btn-secondary flex items-center px-3 py-2 border rounded text-xs bg-white hover:bg-gray-50 shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <Link to="/student/opportunities" className="btn-primary text-xs shadow-sm">
                        Browse More Opportunities
                    </Link>
                </div>
            </div>

            <div className="card space-y-4 border border-gray-100 shadow-sm">
                {loading ? (
                    <div className="py-12 text-center text-gray-400">Loading your applications...</div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl">
                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <h3 className="text-base font-bold text-gray-700">No applications submitted yet</h3>
                        <p className="text-xs text-gray-500 mt-1 mb-4">Explore funded fellowships and assistantships on the opportunities board.</p>
                        <Link to="/student/opportunities" className="btn-primary text-xs">
                            Find Opportunities
                        </Link>
                    </div>
                ) : (
                    applications.map(app => (
                        <div key={app.id} className="p-5 border border-gray-200 rounded-xl hover:border-nyu-primary hover:shadow-sm transition-all bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start">
                                <div className="p-3 bg-nyu-veryLight text-nyu-primary rounded-xl mr-4 flex-shrink-0">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                            {app.application_number}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Submitted on {new Date(app.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">{app.opportunity?.title || 'Research Opportunity'}</h3>
                                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">{app.statement_of_purpose}</p>
                                    
                                    {app.reviewer_notes && (
                                        <div className="mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-200 text-gray-700">
                                            <span className="font-semibold text-gray-900">Faculty Notes:</span> {app.reviewer_notes}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="self-end md:self-auto">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                    app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                                    app.status === 'Submitted' || app.status === 'Under Review' ? 'bg-amber-100 text-amber-800' :
                                    app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {app.status === 'Accepted' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
                                    {(app.status === 'Submitted' || app.status === 'Under Review') && <Clock className="w-3.5 h-3.5 mr-1" />}
                                    {app.status === 'Rejected' && <XCircle className="w-3.5 h-3.5 mr-1" />}
                                    {app.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentApplications;
