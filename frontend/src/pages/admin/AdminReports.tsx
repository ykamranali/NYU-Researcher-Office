import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, RefreshCw, TrendingUp, Award, DollarSign } from 'lucide-react';
import axios from '../../api/axios';

const AdminReports = () => {
    const [analytics, setAnalytics] = useState<{
        funding_data: any[];
        project_distribution: any[];
        top_investigators: any[];
        kpi: any;
    }>({
        funding_data: [],
        project_distribution: [],
        top_investigators: [],
        kpi: { total_funded_ytd: '$0.00', active_project_count: 0, approved_proposals: 0, pending_review: 0 },
    });
    const [loading, setLoading] = useState(true);

    const COLORS = ['#57068C', '#8900E1', '#AB82C5', '#330662', '#D1C4E9'];

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/reports/analytics');
            setAnalytics(res.data);
        } catch (error) {
            console.error('Failed to load research analytics', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleExportCSV = () => {
        const rows = [
            ['Principal Investigator', 'Department', 'Active Grants', 'Total Funding Awarded'],
            ...analytics.top_investigators.map(pi => [
                `"${pi.name}"`,
                `"${pi.department}"`,
                pi.active_grants,
                `"${pi.total_funding}"`
            ])
        ];

        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `NYU_Research_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900">Research Analytics & Reports</h1>
                    <p className="text-sm text-gray-500 mt-1">Aggregated institutional metrics, portfolio distribution, and grant disbursements</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={fetchAnalytics}
                        className="btn-secondary flex items-center px-3 py-2 border rounded text-xs bg-white hover:bg-gray-50 shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="btn-primary flex items-center px-4 py-2 bg-nyu-primary text-white rounded text-xs hover:bg-nyu-deep shadow-sm font-semibold"
                    >
                        <Download className="w-3.5 h-3.5 mr-2" /> Export CSV Report
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Funding Awarded</p>
                    <p className="text-xl font-bold text-nyu-primary mt-1">{analytics.kpi.total_funded_ytd}</p>
                </div>
                <div className="card p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Active Grant Projects</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{analytics.kpi.active_project_count}</p>
                </div>
                <div className="card p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Approved Proposals</p>
                    <p className="text-xl font-bold text-emerald-600 mt-1">{analytics.kpi.approved_proposals}</p>
                </div>
                <div className="card p-4 border border-gray-100 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Pending Review Queue</p>
                    <p className="text-xl font-bold text-amber-600 mt-1">{analytics.kpi.pending_review}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Funding Trend */}
                <div className="card h-96 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-gray-800 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-nyu-primary" />
                            Monthly Funding Influx (USD)
                        </h3>
                    </div>
                    {loading ? (
                        <div className="h-64 flex items-center justify-center text-xs text-gray-400">Loading trend data...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={analytics.funding_data} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tickFormatter={(val) => `$${val / 1000}k`} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(val: any) => [`$${Number(val || 0).toLocaleString()}`, 'Awarded Influx']} />
                                <Bar dataKey="amount" fill="#57068C" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Project Strategic Distribution */}
                <div className="card h-96 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base font-bold text-gray-800 flex items-center">
                            <Award className="w-4 h-4 mr-2 text-nyu-primary" />
                            Research Portfolio by Strategic Priority
                        </h3>
                    </div>
                    {loading ? (
                        <div className="h-64 flex items-center justify-center text-xs text-gray-400">Loading portfolio distribution...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie
                                    data={analytics.project_distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    fill="#8884d8"
                                    paddingAngle={4}
                                    dataKey="value"
                                    label={({ name, percent }: any) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                >
                                    {analytics.project_distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Top Funded PIs */}
            <div className="card border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2 text-emerald-600" />
                        Top Funded Principal Investigators (Institutional Database)
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Investigator</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Active Grants</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total Funding Awarded</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {analytics.top_investigators.length === 0 ? (
                                <tr><td colSpan={4} className="py-6 text-center text-gray-400">No active grant awards recorded yet.</td></tr>
                            ) : (
                                analytics.top_investigators.map((pi, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-gray-900">{pi.name}</td>
                                        <td className="px-4 py-3 text-xs text-gray-600">{pi.department}</td>
                                        <td className="px-4 py-3 text-xs font-bold text-gray-700">{pi.active_grants}</td>
                                        <td className="px-4 py-3 text-right text-xs font-bold text-emerald-700">{pi.total_funding}</td>
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

export default AdminReports;
