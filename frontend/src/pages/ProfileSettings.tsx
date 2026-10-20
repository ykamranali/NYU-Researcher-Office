import React from 'react';
import { Save } from 'lucide-react';

const ProfileSettings = () => {
    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-heading font-bold text-gray-900">Profile Settings</h1>
            
            <div className="card space-y-6">
                <div>
                    <h3 className="text-xl font-bold border-b pb-2 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input type="text" className="w-full border border-gray-300 rounded p-2" defaultValue="User" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input type="text" className="w-full border border-gray-300 rounded p-2" defaultValue="Name" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" className="w-full border border-gray-300 rounded p-2 bg-gray-50" defaultValue="user@nyu.edu" disabled />
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold border-b pb-2 mb-4">Notification Preferences</h3>
                    <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" className="form-checkbox h-5 w-5 text-nyu-primary rounded" defaultChecked />
                            <span className="text-gray-700">Email me when a project status changes</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" className="form-checkbox h-5 w-5 text-nyu-primary rounded" defaultChecked />
                            <span className="text-gray-700">Send weekly digest of new opportunities</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button className="btn-primary flex items-center"><Save className="w-4 h-4 mr-2" /> Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
