import React from 'react';
import { FileText, Clock, CheckCircle } from 'lucide-react';

const StudentApplications = () => {
    const applications = [
        { id: 'APP-992', title: 'Summer Undergraduate Research Fellowship', dateSubmitted: 'Oct 1, 2026', status: 'Under Review' },
        { id: 'APP-844', title: 'AI Ethics Lab Assistant', dateSubmitted: 'Sep 15, 2026', status: 'Accepted' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-heading font-bold text-gray-900">My Applications</h1>
            
            <div className="card space-y-4">
                {applications.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p>You have not submitted any applications yet.</p>
                    </div>
                ) : (
                    applications.map(app => (
                        <div key={app.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                            <div className="flex items-start">
                                <FileText className="w-8 h-8 text-nyu-primary mr-4 mt-1" />
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{app.title}</h3>
                                    <p className="text-sm text-gray-500">ID: {app.id} • Submitted on {app.dateSubmitted}</p>
                                </div>
                            </div>
                            <div>
                                {app.status === 'Under Review' ? (
                                    <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                        <Clock className="w-4 h-4 mr-1" /> Under Review
                                    </span>
                                ) : (
                                    <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        <CheckCircle className="w-4 h-4 mr-1" /> Accepted
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentApplications;
