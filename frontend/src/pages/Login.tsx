import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState<'Student' | 'Professor'>('Student');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const quickLogins = [
        { label: 'Super Admin', email: 'admin@nyu.edu', pass: 'AdminSecret2026!', badge: 'bg-purple-100 text-purple-800' },
        { label: 'Office Admin', email: 'office@nyu.edu', pass: 'OfficeAdmin2026!', badge: 'bg-blue-100 text-blue-800' },
        { label: 'Professor', email: 'professor@nyu.edu', pass: 'Professor2026!', badge: 'bg-emerald-100 text-emerald-800' },
        { label: 'Reviewer', email: 'reviewer@nyu.edu', pass: 'Reviewer2026!', badge: 'bg-indigo-100 text-indigo-800' },
        { label: 'Finance', email: 'finance@nyu.edu', pass: 'Finance2026!', badge: 'bg-amber-100 text-amber-800' },
        { label: 'Student', email: 'student@nyu.edu', pass: 'Student2026!', badge: 'bg-gray-100 text-gray-800' },
    ];

    const handleQuickLogin = (quickEmail: string, quickPass: string) => {
        setEmail(quickEmail);
        setPassword(quickPass);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (isRegister) {
                const res = await axios.post('/register', {
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                    role,
                });

                localStorage.setItem('token', res.data.access_token);
                localStorage.setItem('user', JSON.stringify({
                    ...res.data.user,
                    role: res.data.role,
                }));

                setSuccessMessage('Registration successful! Redirecting...');
                setTimeout(() => {
                    if (res.data.role === 'Professor') {
                        navigate('/professor');
                    } else {
                        navigate('/student');
                    }
                }, 800);
            } else {
                const response = await axios.post('/login', { email, password });
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify({
                    ...response.data.user,
                    role: response.data.role,
                }));

                const userRole = response.data.role;
                if (userRole === 'Super Admin' || userRole === 'Office Admin' || userRole === 'Reviewer' || userRole === 'Finance Officer') {
                    navigate('/admin');
                } else if (userRole === 'Professor') {
                    navigate('/professor');
                } else {
                    navigate('/student');
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-nyu-veryLight py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-nyu-light/20">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-nyu-primary text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-nyu-deep">NYU Research Office Portal</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        {isRegister ? 'Create an institutional researcher or student account' : 'Sign in to access your research dashboard'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm rounded">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3 text-green-700 text-sm rounded">
                        {successMessage}
                    </div>
                )}

                {/* Quick Demo Credentials Bar */}
                {!isRegister && (
                    <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                            <UserCheck className="w-3.5 h-3.5 mr-1 text-nyu-primary" /> Quick Demo Role Logins:
                        </p>
                        <div className="grid grid-cols-3 gap-1.5 text-xs">
                            {quickLogins.map((ql) => (
                                <button
                                    key={ql.label}
                                    type="button"
                                    onClick={() => handleQuickLogin(ql.email, ql.pass)}
                                    className={`py-1 px-2 rounded font-medium border text-center hover:opacity-80 transition-opacity ${ql.badge}`}
                                >
                                    {ql.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {isRegister && (
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                    placeholder="Dr. Jordan Hayes"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase">Account Type</label>
                                <select
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                    value={role}
                                    onChange={(e: any) => setRole(e.target.value)}
                                >
                                    <option value="Student">Student / Research Scholar</option>
                                    <option value="Professor">Faculty / Principal Investigator</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Administrative roles are strictly provisioned by the Research Office.
                                </p>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase">University Email</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                placeholder="netid@nyu.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase">Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="block w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    {isRegister && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase">Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-nyu-primary focus:border-nyu-primary"
                                placeholder="••••••••"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-nyu-primary hover:bg-nyu-deep focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nyu-primary transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
                        </button>
                    </div>

                    <div className="text-center pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                                setSuccessMessage('');
                            }}
                            className="text-xs font-medium text-nyu-primary hover:text-nyu-deep underline"
                        >
                            {isRegister ? 'Already have an institutional account? Sign In' : 'New researcher or student? Register for access'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
