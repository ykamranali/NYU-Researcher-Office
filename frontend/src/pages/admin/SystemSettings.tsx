import React from 'react';
import { Save, Server, Shield, Database } from 'lucide-react';

const SystemSettings = () => {
    return (
        <div className="space-y-6 max-w-4xl">
            <h1 className="text-3xl font-heading font-bold text-gray-900">System Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 space-y-2">
                    <button className="w-full text-left px-4 py-3 bg-nyu-primary text-white font-medium rounded-lg flex items-center"><Server className="w-5 h-5 mr-3" /> General</button>
                    <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-100 font-medium rounded-lg flex items-center"><Shield className="w-5 h-5 mr-3" /> Security</button>
                    <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-100 font-medium rounded-lg flex items-center"><Database className="w-5 h-5 mr-3" /> Integrations</button>
                </div>
                
                <div className="col-span-2 card space-y-6">
                    <div>
                        <h3 className="text-xl font-bold border-b pb-2 mb-4">General Configuration</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                                <input type="text" className="w-full border border-gray-300 rounded p-2" defaultValue="New York University" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                                <input type="email" className="w-full border border-gray-300 rounded p-2" defaultValue="research-support@nyu.edu" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Mode</label>
                                <select className="w-full border border-gray-300 rounded p-2">
                                    <option>Disabled</option>
                                    <option>Enabled (Only Admins can log in)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t">
                        <button className="btn-primary flex items-center"><Save className="w-4 h-4 mr-2" /> Apply Settings</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
