import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter } from 'lucide-react';

const AdminReports = () => {
    
    const fundingData = [
        { name: 'Jan', amount: 400000 },
        { name: 'Feb', amount: 300000 },
        { name: 'Mar', amount: 550000 },
        { name: 'Apr', amount: 450000 },
        { name: 'May', amount: 700000 },
        { name: 'Jun', amount: 650000 },
    ];

    const projectDistribution = [
        { name: 'Health & Life Sciences', value: 45 },
        { name: 'Sustainability', value: 25 },
        { name: 'Data Science & AI', value: 30 },
    ];
    
    const COLORS = ['#57068C', '#AB82C5', '#330662'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-heading font-bold text-gray-900">Research Analytics</h1>
                <div className="flex space-x-3">
                    <button className="btn-secondary flex items-center px-4 py-2 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </button>
                    <button className="btn-primary flex items-center px-4 py-2 bg-nyu-primary text-white rounded text-sm hover:bg-nyu-deep">
                        <Download className="w-4 h-4 mr-2" /> Export PDF
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Funding Trend */}
                <div className="card h-96">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Funding Awarded (YTD)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fundingData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                            <Tooltip formatter={(value: any) => `$${Number(value || 0).toLocaleString()}`} />
                            <Bar dataKey="amount" fill="#57068C" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Project Distribution */}
                <div className="card h-96">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Active Projects by Strategic Area</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={projectDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label={({name, percent}: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                            >
                                {projectDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Researchers Table */}
            <div className="card mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Top Funded Principal Investigators</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investigator</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Grants</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Funding</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Dr. Jane Smith</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Computer Science</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">$1,250,000</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Dr. Robert Chen</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Biomedical Engineering</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">$890,000</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
