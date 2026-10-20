import React from 'react';
import { BookOpen, Search, Plus, ExternalLink } from 'lucide-react';

const PublicationsList = () => {
    const publications = [
        { id: 1, title: 'Machine Learning for Early Cancer Detection', authors: 'Dr. Jane Smith, A. Johnson', year: '2026', journal: 'Journal of Medical AI', type: 'Journal Article' },
        { id: 2, title: 'Sustainable Concrete using Recycled Plastics', authors: 'Dr. Robert Chen', year: '2025', journal: 'Civil Engineering Materials', type: 'Conference Paper' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-gray-900">Publications Directory</h1>
                <button className="btn-primary flex items-center"><Plus className="w-4 h-4 mr-2" /> Add Publication</button>
            </div>

            <div className="card">
                <div className="flex justify-between mb-4">
                    <div className="relative w-64">
                        <input type="text" placeholder="Search publications..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-nyu-primary focus:border-nyu-primary" />
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>
                
                <div className="space-y-4">
                    {publications.map(pub => (
                        <div key={pub.id} className="p-4 border border-gray-200 rounded-lg hover:border-nyu-primary transition-colors bg-white flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{pub.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{pub.authors} ({pub.year})</p>
                                <div className="flex items-center space-x-2">
                                    <span className="bg-nyu-light/20 text-nyu-primary text-xs px-2 py-1 rounded font-medium">{pub.type}</span>
                                    <span className="text-xs text-gray-500 italic">{pub.journal}</span>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-nyu-primary p-2 border border-gray-200 rounded hover:bg-gray-50">
                                <ExternalLink className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PublicationsList;
