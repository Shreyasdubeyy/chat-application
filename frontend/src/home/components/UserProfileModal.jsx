import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosInstance.js';
import { FiX, FiUser, FiMessageCircle, FiCalendar } from 'react-icons/fi';
import { useSocketContext } from '../../context/socketContext';

const UserProfileModal = ({ user, onClose, onMessage }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { onlineUser } = useSocketContext();
    const isOnline = onlineUser.includes(user?._id);

    useEffect(() => {
        if (!user?._id) return;
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/user/view/${user._id}`);
                if (res.data.success) setProfile(res.data.user);
            } catch (err) {
                console.error('Error fetching user profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user?._id]);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const joinedDate = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
                onClick={onClose}
            />

            {/* Slide-in Panel */}
            <div className="fixed right-0 top-0 h-full w-full sm:max-w-sm bg-slate-900 z-50 shadow-2xl flex flex-col"
                style={{ animation: 'slideInFromRight 0.3s ease-out' }}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-10"
                >
                    <FiX className="w-5 h-5" />
                </button>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {/* Header with gradient */}
                        <div className="relative h-48 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex-shrink-0">
                            {/* Animated blobs */}
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                            </div>

                            {/* Avatar */}
                            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-md opacity-70 scale-110"></div>
                                    <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-slate-900">
                                        {profile?.profilepic ? (
                                            <img src={profile.profilepic} alt={profile.fullname} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                                <span className="text-white text-3xl font-bold">{getInitials(profile?.fullname)}</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Online indicator */}
                                    <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full ring-4 ring-slate-900 ${isOnline ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto scrollbar pt-16 px-6 pb-6">
                            {/* Name & Status */}
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-white">{profile?.fullname}</h2>
                                <p className="text-slate-400 text-sm mt-1">@{profile?.username}</p>
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                        isOnline
                                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                            : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></span>
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-medium capitalize">
                                        {profile?.gender}
                                    </span>
                                </div>
                            </div>

                            {/* About */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FiUser className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">About</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {profile?.about || 'Hey there! I am using LinkUp.'}
                                </p>
                            </div>

                            {/* Joined Date */}
                            {joinedDate && (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiCalendar className="w-4 h-4 text-blue-400" />
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Member Since</span>
                                    </div>
                                    <p className="text-slate-300 text-sm">{joinedDate}</p>
                                </div>
                            )}

                            {/* Message Button */}
                            <button
                                onClick={() => { onMessage(user); onClose(); }}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50"
                            >
                                <FiMessageCircle className="w-5 h-5" />
                                Send Message
                            </button>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @keyframes slideInFromRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default UserProfileModal;
