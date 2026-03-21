import axios from '../utils/axiosInstance.js';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
    const navigate = useNavigate();
    const { setAuthUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [inputData, setInputData] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleInput = (e) => setInputData({ ...inputData, [e.target.id]: e.target.value });
    const selectGender = (g) => setInputData((prev) => ({ ...prev, gender: g }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!inputData.gender) { setLoading(false); return toast.warning('Please select your gender.'); }
        if (inputData.password !== inputData.confpassword) { setLoading(false); return toast.error("Passwords don't match"); }
        if (inputData.password.length < 6) { setLoading(false); return toast.error('Password must be at least 6 characters'); }

        try {
            const register = await axios.post('/api/auth/register', inputData);
            const data = register.data;
            if (data.success === false) { toast.error(data.message); return; }
            toast.success('Account created successfully!');
            localStorage.setItem('chatapp', JSON.stringify(data));
            setAuthUser(data);
            navigate('/login');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-slate-900 dark:text-white placeholder-slate-400 text-sm";
    const labelClass = "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";

    return (
        <div className="flex-1 overflow-y-auto flex">
            {/* Left branding panel */}
            <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex-col items-center justify-center p-12 overflow-hidden flex-shrink-0">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-2xl shadow-purple-900/50 mb-8">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">LinkUp</h1>
                    <p className="text-slate-400 text-lg max-w-xs leading-relaxed">Join thousands of people already connecting on LinkUp.</p>

                    <div className="flex flex-col gap-3 mt-10">
                        {['Free forever', 'No ads, ever', 'Your data stays private'].map((f) => (
                            <div key={f} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex-shrink-0" />
                                <span className="text-slate-300 text-sm">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                {/* Mobile logo */}
                <div className="lg:hidden text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg mb-3">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">LinkUp</h1>
                </div>

                <div className="w-full max-w-sm animate-scale-in">
                    <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Create account</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Get started for free today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name + Username side by side */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="fullname" className={labelClass}>Full Name</label>
                                <div className="relative">
                                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input id="fullname" type="text" onChange={handleInput} placeholder="Alex Johnson" required className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="username" className={labelClass}>Username</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                                    <input id="username" type="text" onChange={handleInput} placeholder="alexj" required className={inputClass} />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className={labelClass}>Email</label>
                            <div className="relative">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input id="email" type="email" onChange={handleInput} placeholder="alex@gmail.com" required className={inputClass} />
                            </div>
                        </div>

                        {/* Password + Confirm side by side */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="password" className={labelClass}>Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input id="password" type={showPassword ? 'text' : 'password'} onChange={handleInput} placeholder="••••••" required minLength="6" className={`${inputClass} pr-9`} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confpassword" className={labelClass}>Confirm</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input id="confpassword" type={showConfirm ? 'text' : 'password'} onChange={handleInput} placeholder="••••••" required minLength="6" className={`${inputClass} pr-9`} />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <label className={labelClass}>Gender</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['male', 'female'].map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => selectGender(g)}
                                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all capitalize ${
                                            inputData.gender === g
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-300 dark:hover:border-purple-700'
                                        }`}
                                    >
                                        {g === 'male' ? '👨 Male' : '👩 Female'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>Create Account <FiArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>

                    <p className="text-center text-xs text-slate-400 mt-6">© 2024 LinkUp. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Register;
