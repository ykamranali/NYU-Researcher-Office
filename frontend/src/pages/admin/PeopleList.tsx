import React from 'react';
import { Users, Search, Edit, Trash2 } from 'lucide-react';

const PeopleList = () => {
    const people = [
        { id: 1, name: 'Dr. Jane Smith', role: 'Professor', department: 'Computer Science', status: 'Active' },
        { id: 2, name: 'Alex Johnson', role: 'Student', department: 'Biology', status: 'Active' },
        { id: 3, name: 'Dr. Robert Chen', role: 'Professor', department: 'Engineering', status: 'Inactive' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-gray-900">People Management</h1>
                <button className="btn-primary">Add New User</button>
            </div>

            <div className="card">
                <div className="flex justify-between mb-4">
                    <div className="relative w-64">
                        <input type="text" placeholder="Search users..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-nyu-primary focus:border-nyu-primary" />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {people.map(person => (
                                <tr key={person.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{person.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.role}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.department}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${person.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {person.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-nyu-primary hover:text-nyu-deep mr-3"><Edit className="w-4 h-4" /></button>
                                        <button className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PeopleList;
