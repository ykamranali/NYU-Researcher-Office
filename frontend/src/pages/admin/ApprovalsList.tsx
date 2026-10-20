import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const ApprovalsList = () => {
    const approvals = [
        { id: 'APP-001', type: 'Grant Application', applicant: 'Dr. Jane Smith', date: 'Oct 3, 2026', status: 'Pending' },
        { id: 'APP-002', type: 'Ethics Review', applicant: 'Alex Johnson', date: 'Oct 2, 2026', status: 'Pending' },
        { id: 'APP-003', type: 'Project Budget Increase', applicant: 'Dr. Robert Chen', date: 'Sep 28, 2026', status: 'Approved' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-heading font-bold text-gray-900">Pending Approvals</h1>
            
            <div className="card space-y-4">
                {approvals.map(approval => (
                    <div key={approval.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div>
                            <div className="flex items-center space-x-3 mb-1">
                                <span className="text-sm font-bold text-gray-500">{approval.id}</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">{approval.type}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{approval.applicant}</h3>
                            <p className="text-sm text-gray-500">Submitted on {approval.date}</p>
                        </div>
                        
                        {approval.status === 'Pending' ? (
                            <div className="flex space-x-2">
                                <button className="flex items-center px-3 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded font-medium text-sm">
                                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                                </button>
                                <button className="flex items-center px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded font-medium text-sm">
                                    <XCircle className="w-4 h-4 mr-1" /> Reject
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center text-green-600 font-bold">
                                <CheckCircle className="w-5 h-5 mr-1" /> Approved
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ApprovalsList;
