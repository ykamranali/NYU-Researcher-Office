import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import { Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/projects', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProjects(res.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch projects", error);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-gray-900">Research Projects</h1>
                <Link to="/admin/research/new" className="btn-primary flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    New Project
                </Link>
            </div>

            <div className="card">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-nyu-primary focus:border-nyu-primary sm:text-sm transition duration-150 ease-in-out"
                            placeholder="Search projects by ID, title, or PI..."
                        />
                    </div>
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter Status
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="py-3 px-4 font-semibold text-gray-600">Project Code</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">Title</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">Status</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">Visibility</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="py-8 text-center text-gray-500">Loading projects...</td></tr>
                            ) : projects.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-gray-500">No projects found. Create one to get started.</td></tr>
                            ) : (
                                projects.map((project: any) => (
                                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-gray-900">{project.project_code}</td>
                                        <td className="py-3 px-4 text-gray-700 font-medium">{project.title}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                project.status === 'Approved' || project.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                project.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                                'bg-orange-100 text-orange-800'
                                            }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500">{project.visibility}</td>
                                        <td className="py-3 px-4">
                                            <Link to={`/admin/research/${project.id}`} className="text-nyu-primary hover:text-nyu-deep font-medium mr-3">Edit</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminProjects;
