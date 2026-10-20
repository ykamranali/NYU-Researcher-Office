import React from 'react';
import { Briefcase, Search, Plus } from 'lucide-react';

const OpportunitiesList = () => {
    const opps = [
        { id: 1, title: 'Summer Undergraduate Research Fellowship', department: 'University-wide', deadline: 'Nov 1, 2026', type: 'Fellowship' },
        { id: 2, title: 'Graduate Assistant: AI Lab', department: 'Computer Science', deadline: 'Dec 15, 2026', type: 'Assistantship' },
        { id: 3, title: 'Postdoctoral Position in Renewable Energy', department: 'Engineering', deadline: 'Rolling', type: 'Postdoc' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-gray-900">Opportunities Board</h1>
                <button className="btn-primary flex items-center"><Plus className="w-4 h-4 mr-2" /> Post Opportunity</button>
            </div>

            <div className="card">
                <div className="flex justify-between mb-6">
                    <div className="relative w-72">
                        <input type="text" placeholder="Search opportunities..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-nyu-primary focus:border-nyu-primary" />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    <select className="border border-gray-300 rounded-lg px-4 py-2">
                        <option>All Types</option>
                        <option>Fellowships</option>
                        <option>Assistantships</option>
                        <option>Postdoc</option>
                    </select>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {opps.map(opp => (
                        <div key={opp.id} className="border border-gray-200 rounded-lg p-5 hover:border-nyu-primary hover:shadow-md transition-all bg-white flex flex-col h-full">
                            <div className="flex items-center space-x-2 text-nyu-primary mb-2">
                                <Briefcase className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">{opp.type}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{opp.title}</h3>
                            <p className="text-sm text-gray-600 mb-4 flex-grow">{opp.department}</p>
                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                <span className="text-sm text-red-600 font-medium">Deadline: {opp.deadline}</span>
                                <button className="text-nyu-primary font-bold text-sm hover:underline">Edit</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OpportunitiesList;
