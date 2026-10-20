import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import { Plus, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPages = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/pages', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPages(res.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch pages", error);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-gray-900">Website Pages</h1>
                <Link to="/admin/content/pages/new" className="btn-primary flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Page
                </Link>
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="py-3 px-4 font-semibold text-gray-600">Page Title</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">URL Slug</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">Status</th>
                            <th className="py-3 px-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={4} className="py-8 text-center text-gray-500">Loading pages...</td></tr>
                        ) : pages.length === 0 ? (
                            <tr><td colSpan={4} className="py-8 text-center text-gray-500">No pages created yet.</td></tr>
                        ) : (
                            pages.map((page: any) => (
                                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 font-medium text-gray-900">{page.title}</td>
                                    <td className="py-3 px-4 text-gray-500">/{page.slug}</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            page.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {page.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Link to={`/admin/content/pages/${page.id}`} className="text-nyu-primary hover:text-nyu-deep font-medium flex items-center">
                                            <Edit className="w-4 h-4 mr-1" /> Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPages;
