import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from '../../../api/axios';
import { ArrowLeft, Save } from 'lucide-react';

const ProjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        short_description: '',
        full_description: '',
        status: 'Draft',
    });

    useEffect(() => {
        if (isEdit) {
            fetchProject();
        }
    }, [id]);

    const fetchProject = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFormData({
                title: res.data.title || '',
                short_description: res.data.short_description || '',
                full_description: res.data.full_description || '',
                status: res.data.status || 'Draft',
            });
        } catch (error) {
            console.error("Error fetching project", error);
        }
    };

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            if (isEdit) {
                await axios.put(`/projects/${id}`, formData, config);
            } else {
                await axios.post('/projects', formData, config);
            }
            
            const userString = localStorage.getItem('user');
            const user = userString ? JSON.parse(userString) : null;
            if (user?.role === 'Professor') {
                navigate('/professor/projects');
            } else {
                navigate('/admin/research');
            }
        } catch (error) {
            console.error("Error saving project", error);
            alert("Error saving project. Please check the console.");
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-8">
                <Link to="/admin/research" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-3xl font-heading font-bold text-gray-900">
                    {isEdit ? 'Edit Research Project' : 'Create New Project'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary focus:border-nyu-primary"
                        placeholder="Enter project title"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
                    <textarea
                        name="short_description"
                        required
                        rows={3}
                        value={formData.short_description}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary focus:border-nyu-primary"
                        placeholder="Brief summary of the research..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                    <textarea
                        name="full_description"
                        rows={8}
                        value={formData.full_description}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary focus:border-nyu-primary"
                        placeholder="Detailed methodology, objectives, etc..."
                    />
                </div>
                
                {isEdit && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary focus:border-nyu-primary"
                        >
                            <option value="Draft">Draft</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button type="button" onClick={() => {
                        const u = localStorage.getItem('user');
                        const parsedUser = u ? JSON.parse(u) : null;
                        navigate(parsedUser?.role === 'Professor' ? '/professor/projects' : '/admin/research');
                    }} className="px-6 py-2 border border-gray-300 rounded text-gray-700 mr-4 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary flex items-center">
                        <Save className="w-5 h-5 mr-2" />
                        Save Project
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProjectForm;
