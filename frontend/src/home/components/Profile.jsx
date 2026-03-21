import axios from '../../utils/axiosInstance.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiArrowLeft, FiTrash2, FiSave, FiCamera, FiEdit2, FiCheck, FiX, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const navigate = useNavigate();
    const { setAuthUser } = useAuth();
    const [userInput, setUserInput] = useState({});
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const [mounted, setMounted] = useState(false);

    const [savedInput, setSavedInput] = useState({});

    useEffect(() => {
        setTimeout(() => setMounted(true), 100);
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/user/profile');
                if (response.data.success) {
                    setUserInput(response.data.user);
                    setSavedInput(response.data.user);
                    setPreviewImage(response.data.user.profilepic);
                } else {
                    toast.error('Failed to fetch profile.');
                }
            } catch (error) {
                toast.error('Failed to fetch user profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInput = (e) => {
        setUserInput({ ...userInput, [e.target.id]: e.target.value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
        if (file.size > 5 * 1024 * 1024) return toast.error('Image size should be less than 5MB');

        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);

        setUploading(true);
        const formData = new FormData();
        formData.append('profilePicture', file);
        try {
            const response = await axios.post('/api/user/profile/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.data.success) {
                toast.success('Profile picture updated!');
                setUserInput((prev) => ({ ...prev, profilepic: response.data.profilepic }));
            }
        } catch {
            toast.error('Failed to upload profile picture');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put('/api/user/profile', userInput);
            if (!response.data.success) return toast.error(response.data.message);
            toast.success('Profile updated!');
            setSavedInput(userInput);
            setIsEditing(false);
        } catch {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure? This cannot be undone.')) return;
        setDeleting(true);
        try {
            const response = await axios.delete('/api/user/profile');
            if (!response.data.success) return toast.error(response.data.message);
            toast.success('Account deleted.');
            localStorage.removeItem('chatapp');
            navigate('/login');
        } catch {
            toast.error('An error occurred.');
        } finally {
            setDeleting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout');
            localStorage.removeItem('chatapp');
            setAuthUser(null);
            navigate('/login');
        } catch {
            toast.error('Logout failed');
        }
    };

    const getInitials = () => {
        if (!userInput.fullname) return '?';
        return userInput.fullname.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const fields = [
        { id: 'fullname', label: 'Full Name', icon: FiUser, type: 'text', placeholder: 'Alex Johnson' },
        { id: 'username', label: 'Username', icon: FiUser, type: 'text', placeholder: 'alexj', prefix: '@' },
        { id: 'email', label: 'Email', icon: FiMail, type: 'email', placeholder: 'alex@gmail.com' },
        { id: 'about', label: 'About', icon: FiUser, type: 'textarea', placeholder: "Coffee addict, night owl, bad at bios" },
    ];

    return (
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">

            {/* Animated background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Top Nav */}
            <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 backdrop-blur-sm">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                        <FiArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium hidden xs:inline sm:inline">Back</span>
                </button>
                <span className="text-sm font-semibold text-white/80">My Profile</span>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors group"
                >
                    <span className="text-sm font-medium hidden xs:inline sm:inline">Logout</span>
                    <div className="p-2 rounded-xl bg-white/5 group-hover:bg-red-500/10 transition-colors">
                        <FiLogOut className="w-4 h-4" />
                    </div>
                </button>
            </div>

            {loading && !userInput.fullname ? (
                <div className="flex justify-center items-center h-[80vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 text-sm">Loading profile...</p>
                    </div>
                </div>
            ) : (
                <div className={`relative z-10 w-full max-w-4xl mx-auto px-4 py-6 lg:py-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                    {/* Two-col on lg+, single col on mobile */}
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">

                        {/* ── LEFT PANEL: Avatar + identity ── */}
                        <div className="lg:w-72 xl:w-80 flex-shrink-0">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="relative group mb-4">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-md opacity-60 group-hover:opacity-90 transition-opacity scale-110"></div>
                                    <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-white/20">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                                <span className="text-white text-3xl font-bold">{getInitials()}</span>
                                            </div>
                                        )}
                                        <label
                                            htmlFor="profilePicture"
                                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        >
                                            {uploading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <FiCamera className="w-6 h-6 text-white" />
                                            )}
                                        </label>
                                    </div>
                                    <input id="profilePicture" type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                                </div>

                                <h2 className="text-xl font-bold text-white">{userInput.fullname || 'Your Name'}</h2>
                                <p className="text-slate-400 text-sm mt-1">@{userInput.username || 'username'}</p>

                                <div className="flex items-center gap-2 mt-3">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-medium">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                        Online
                                    </span>
                                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-medium capitalize">
                                        {userInput.gender || 'Not set'}
                                    </span>
                                </div>

                                <p className="text-slate-500 text-xs mt-4">Hover over avatar to change photo</p>

                                {/* Danger Zone — sits below avatar on desktop */}
                                <div className="hidden lg:block w-full mt-6 bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                                    <h3 className="text-sm font-semibold text-red-400 mb-0.5">Delete Account</h3>
                                    <p className="text-xs text-slate-500 mb-3">Permanently remove your account and all data</p>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleting}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl transition-all text-sm border border-red-500/20 hover:border-red-500/40 disabled:opacity-50"
                                    >
                                        {deleting ? (
                                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <FiTrash2 className="w-4 h-4" />
                                        )}
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT PANEL: Fields + danger zone (mobile) ── */}
                        <div className="flex-1 flex flex-col gap-4 min-w-0">
                            {/* Info / Edit Card */}
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
                                    <span className="text-sm font-semibold text-white">Account Information</span>
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditing(!isEditing); if (isEditing) setUserInput(savedInput); }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            isEditing
                                                ? 'bg-white/10 text-slate-300 hover:bg-white/15'
                                                : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30'
                                        }`}
                                    >
                                        {isEditing ? <><FiX className="w-3 h-3" /> Cancel</> : <><FiEdit2 className="w-3 h-3" /> Edit</>}
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="divide-y divide-white/5">
                                        {fields.map(({ id, label, icon: Icon, type, placeholder, prefix }) => (
                                            <div
                                                key={id}
                                                className={`px-5 py-3.5 transition-colors ${isEditing && activeField === id ? 'bg-white/5' : ''}`}
                                            >
                                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                    {label}
                                                </label>
                                                {isEditing ? (
                                                    <div className="relative">
                                                        {type === 'textarea' ? (
                                                            <textarea
                                                                id={id}
                                                                value={userInput[id] || ''}
                                                                onChange={handleInput}
                                                                onFocus={() => setActiveField(id)}
                                                                onBlur={() => setActiveField(null)}
                                                                placeholder={placeholder}
                                                                maxLength={150}
                                                                rows={3}
                                                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-slate-500 text-sm resize-none"
                                                            />
                                                        ) : (
                                                            <>
                                                                {prefix ? (
                                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>
                                                                ) : (
                                                                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                                )}
                                                                <input
                                                                    id={id}
                                                                    type={type}
                                                                    value={userInput[id] || ''}
                                                                    onChange={handleInput}
                                                                    onFocus={() => setActiveField(id)}
                                                                    onBlur={() => setActiveField(null)}
                                                                    placeholder={placeholder}
                                                                    required={id !== 'about'}
                                                                    className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder-slate-500 text-sm"
                                                                />
                                                            </>
                                                        )}
                                                        {id === 'about' && (
                                                            <p className="text-xs text-slate-500 mt-1 text-right">{(userInput.about || '').length}/150</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-white font-medium text-sm">
                                                        {prefix && <span className="text-slate-400">{prefix}</span>}
                                                        {userInput[id] || <span className="text-slate-500 italic">Not set</span>}
                                                    </p>
                                                )}
                                            </div>
                                        ))}

                                        {/* Gender */}
                                        <div className="px-5 py-3.5">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                                            {isEditing ? (
                                                <div className="flex gap-3">
                                                    {['male', 'female'].map((g) => (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => setUserInput((prev) => ({ ...prev, gender: g }))}
                                                            className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all capitalize ${
                                                                userInput.gender === g
                                                                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                                                                    : 'border-white/10 text-slate-400 hover:border-white/20'
                                                            }`}
                                                        >
                                                            {userInput.gender === g && <FiCheck className="inline w-3 h-3 mr-1" />}
                                                            {g}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-white font-medium text-sm capitalize">{userInput.gender || <span className="text-slate-500 italic">Not set</span>}</p>
                                            )}
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="px-5 pb-5 pt-2">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <><FiSave className="w-4 h-4" /> Save Changes</>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Danger Zone — mobile only (desktop version is in left panel) */}
                            <div className="lg:hidden bg-red-500/5 border border-red-500/20 rounded-2xl p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-red-400">Delete Account</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Permanently remove your account and all data</p>
                                    </div>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleting}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-xl transition-all text-sm border border-red-500/20 hover:border-red-500/40 disabled:opacity-50"
                                    >
                                        {deleting ? (
                                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <FiTrash2 className="w-4 h-4" />
                                        )}
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <p className="text-center text-slate-600 text-xs pb-2">LinkUp</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
