import React from 'react';
import { Files, Upload, Download, Trash2 } from 'lucide-react';

const DocumentCenter = () => {
    const docs = [
        { id: 1, name: 'University Research Ethics Guidelines 2026.pdf', type: 'PDF', size: '2.4 MB', date: 'Oct 1, 2026' },
        { id: 2, name: 'Grant Proposal Template.docx', type: 'DOCX', size: '1.1 MB', date: 'Sep 15, 2026' },
        { id: 3, name: 'Quarterly Research Budget Report.xlsx', type: 'XLSX', size: '4.5 MB', date: 'Aug 20, 2026' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-gray-900">Document Center</h1>
                <button className="btn-primary flex items-center"><Upload className="w-4 h-4 mr-2" /> Upload Document</button>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {docs.map(doc => (
                                <tr key={doc.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                        <Files className="w-5 h-5 text-gray-400 mr-2" /> {doc.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.size}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-nyu-primary hover:text-nyu-deep mr-3"><Download className="w-4 h-4" /></button>
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

export default DocumentCenter;
