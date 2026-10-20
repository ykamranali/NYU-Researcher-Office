import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    FlaskConical, 
    Users, 
    BookOpen, 
    Briefcase, 
    FileText, 
    Files, 
    CheckSquare, 
    BarChart, 
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Shield
} from 'lucide-react';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const role = user?.role || (user?.roles && user?.roles[0]) || 'Student';

    const getMenuItems = () => {
        if (role === 'Super Admin' || role === 'Office Admin') {
            return [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
                { name: 'Research', icon: FlaskConical, path: '/admin/research' },
                { name: 'Approvals Queue', icon: CheckSquare, path: '/admin/approvals' },
                { name: 'People & Roles', icon: Users, path: '/admin/people' },
                { name: 'Publications', icon: BookOpen, path: '/admin/publications' },
                { name: 'Opportunities', icon: Briefcase, path: '/admin/opportunities' },
                { name: 'Document Vault', icon: Files, path: '/admin/documents' },
                { name: 'Website Pages', icon: FileText, path: '/admin/content' },
                { name: 'Analytics & Reports', icon: BarChart, path: '/admin/reports' },
                { name: 'System Settings', icon: Settings, path: '/admin/system' },
            ];
        } else if (role === 'Reviewer') {
            return [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
                { name: 'Research Projects', icon: FlaskConical, path: '/admin/research' },
                { name: 'Approvals Queue', icon: CheckSquare, path: '/admin/approvals' },
                { name: 'Document Vault', icon: Files, path: '/admin/documents' },
                { name: 'Profile Settings', icon: Settings, path: '/admin/settings' },
            ];
        } else if (role === 'Finance Officer') {
            return [
                { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
                { name: 'Research Projects', icon: FlaskConical, path: '/admin/research' },
                { name: 'Grants Approvals', icon: CheckSquare, path: '/admin/approvals' },
                { name: 'Document Vault', icon: Files, path: '/admin/documents' },
                { name: 'Financial Reports', icon: BarChart, path: '/admin/reports' },
                { name: 'Profile Settings', icon: Settings, path: '/admin/settings' },
            ];
        } else if (role === 'Professor') {
            return [
                { name: 'My Dashboard', icon: LayoutDashboard, path: '/professor' },
                { name: 'My Projects', icon: FlaskConical, path: '/professor/projects' },
                { name: 'My Publications', icon: BookOpen, path: '/professor/publications' },
                { name: 'Profile Settings', icon: Settings, path: '/professor/settings' },
            ];
        } else if (role === 'Student') {
            return [
                { name: 'My Dashboard', icon: LayoutDashboard, path: '/student' },
                { name: 'Opportunities', icon: Briefcase, path: '/student/opportunities' },
                { name: 'My Applications', icon: FileText, path: '/student/applications' },
                { name: 'Scholar Profile', icon: Settings, path: '/student/profile' },
            ];
        }
        return [];
    };

    const menuItems = getMenuItems();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="flex h-screen bg-gray-light font-sans">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-nyu-deep text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded bg-nyu-primary flex items-center justify-center font-bold text-white text-sm shadow">
                            NYU
                        </div>
                        <h1 className="text-base font-heading font-bold text-white leading-tight">
                            Research Office
                        </h1>
                    </div>
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        className="text-gray-400 hover:text-white lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <nav className="mt-6 px-3 space-y-1 overflow-y-auto h-[calc(100vh-6rem)] pb-20">
                    {menuItems.map((item) => {
                        const isActive = item.path === '/admin' || item.path === '/professor' || item.path === '/student' 
                            ? location.pathname === item.path
                            : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-3.5 py-2.5 rounded-lg transition-colors group ${
                                    isActive
                                        ? 'bg-nyu-primary text-white shadow' 
                                        : 'text-nyu-veryLight hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <item.icon className={`w-4 h-4 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-nyu-light group-hover:text-white'}`} />
                                <span className="font-medium text-xs tracking-wide">{item.name}</span>
                            </Link>
                        );
                    })}
                    
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-3.5 py-2.5 mt-8 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-lg transition-colors text-xs font-semibold"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        <span>Sign Out</span>
                    </button>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top header */}
                <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-gray-200 shadow-sm z-10">
                    <div className="flex items-center">
                        <button 
                            className="text-gray-dark focus:outline-none lg:hidden mr-4"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-heading font-bold text-gray-800">
                            {role === 'Super Admin' || role === 'Office Admin' ? 'Research Administration' :
                             role === 'Professor' ? 'Faculty Portal' :
                             role === 'Student' ? 'Student Research Portal' :
                             `${role} Portal`}
                        </h2>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <Link 
                            to="/" 
                            target="_blank"
                            className="text-xs text-gray-500 hover:text-nyu-primary font-medium hidden sm:inline-block px-3 py-1.5 border rounded"
                        >
                            Public Website ↗
                        </Link>
                        <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
                            <div className="w-9 h-9 rounded-full bg-nyu-primary flex items-center justify-center text-white font-bold text-sm shadow">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden md:block text-left text-xs">
                                <p className="font-bold text-gray-900 leading-tight">{user?.name || 'User'}</p>
                                <span className="inline-block text-nyu-primary font-semibold text-[10px] uppercase tracking-wider">{role}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main scrollable area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
