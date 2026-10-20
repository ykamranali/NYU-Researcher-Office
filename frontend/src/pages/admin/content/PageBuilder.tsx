import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from '../../../api/axios';
import { ArrowLeft, Save, Plus, GripVertical, Trash2 } from 'lucide-react';

const PageBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [pageData, setPageData] = useState({
        title: '',
        status: 'Draft',
    });

    const [blocks, setBlocks] = useState<any[]>([]);

    useEffect(() => {
        if (isEdit) fetchPage();
    }, [id]);

    const fetchPage = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/pages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPageData({
                title: res.data.title,
                status: res.data.status,
            });
            setBlocks(res.data.blocks || []);
        } catch (error) {
            console.error("Failed to fetch page", error);
        }
    };

    const addBlock = (type: string) => {
        setBlocks([...blocks, { type, content: '', order: blocks.length }]);
    };

    const updateBlockContent = (index: number, content: string) => {
        const newBlocks = [...blocks];
        newBlocks[index].content = content;
        setBlocks(newBlocks);
    };

    const removeBlock = (index: number) => {
        const newBlocks = blocks.filter((_, i) => i !== index);
        setBlocks(newBlocks);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const payload = { ...pageData, blocks };
            if (isEdit) {
                await axios.put(`/pages/${id}`, payload, { headers: { Authorization: `Bearer ${token}` }});
            } else {
                await axios.post('/pages', payload, { headers: { Authorization: `Bearer ${token}` }});
            }
            navigate('/admin/content');
        } catch (error) {
            console.error("Failed to save page", error);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <Link to="/admin/content" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">
                        {isEdit ? 'Edit Page' : 'Create New Page'}
                    </h1>
                </div>
                <button onClick={handleSave} className="btn-primary flex items-center">
                    <Save className="w-5 h-5 mr-2" />
                    Save Page
                </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    {/* Page Meta */}
                    <div className="card space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary focus:border-nyu-primary text-xl font-bold"
                                value={pageData.title}
                                onChange={e => setPageData({...pageData, title: e.target.value})}
                                placeholder="Enter page title"
                            />
                        </div>
                    </div>

                    {/* Block Builder Area */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Page Content Blocks</h3>
                        {blocks.map((block, index) => (
                            <div key={index} className="card p-4 flex items-start space-x-3 group relative border-l-4 border-nyu-primary">
                                <div className="cursor-move text-gray-400 mt-2">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-500 uppercase">{block.type}</span>
                                        <button onClick={() => removeBlock(index)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {block.type === 'Heading' && (
                                        <input 
                                            type="text" 
                                            value={block.content} 
                                            onChange={e => updateBlockContent(index, e.target.value)}
                                            className="w-full text-2xl font-bold border-0 border-b border-gray-300 focus:ring-0 focus:border-nyu-primary px-0 bg-transparent"
                                            placeholder="Heading text..."
                                        />
                                    )}
                                    {block.type === 'Paragraph' && (
                                        <textarea 
                                            value={block.content} 
                                            onChange={e => updateBlockContent(index, e.target.value)}
                                            className="w-full border border-gray-300 rounded p-3 min-h-[100px] focus:ring-nyu-primary focus:border-nyu-primary"
                                            placeholder="Paragraph content..."
                                        />
                                    )}
                                    {block.type === 'Image' && (
                                        <div className="border-2 border-dashed border-gray-300 rounded p-6 text-center text-gray-500 bg-gray-50">
                                            <p>Image URL Input</p>
                                            <input 
                                                type="text"
                                                value={block.content}
                                                onChange={e => updateBlockContent(index, e.target.value)}
                                                className="mt-2 w-full border border-gray-300 rounded px-2 py-1 text-sm text-center"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="card bg-gray-50 border-dashed border-2 flex justify-center py-6">
                            <div className="flex space-x-2">
                                <button onClick={() => addBlock('Heading')} className="px-3 py-1 bg-white border rounded shadow-sm text-sm hover:bg-gray-50">+ Heading</button>
                                <button onClick={() => addBlock('Paragraph')} className="px-3 py-1 bg-white border rounded shadow-sm text-sm hover:bg-gray-50">+ Paragraph</button>
                                <button onClick={() => addBlock('Image')} className="px-3 py-1 bg-white border rounded shadow-sm text-sm hover:bg-gray-50">+ Image</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-1">
                    <div className="card space-y-4 sticky top-6">
                        <h3 className="text-lg font-bold text-gray-800">Publishing</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={pageData.status}
                                onChange={e => setPageData({...pageData, status: e.target.value})}
                                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-nyu-primary"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Published">Published</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">
                            The visual page builder allows administrators to dynamically manage all website content using semantic blocks.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageBuilder;
