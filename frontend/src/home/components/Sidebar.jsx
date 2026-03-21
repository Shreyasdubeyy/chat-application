import React, { useEffect, useState } from 'react';
import { FiSearch, FiLogOut, FiUser, FiX } from 'react-icons/fi';
import axios from '../../utils/axiosInstance.js';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import userConversation from '../../Zustand/useConversation.js';
import { useSocketContext } from '../../context/socketContext.jsx';
import UserProfileModal from './UserProfileModal.jsx';

const Sidebar = ({ onSelectUser }) => {
    const navigate = useNavigate();
    const { authUser, setAuthUser } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const [searchUser, setSearchuser] = useState([]);
    const [chatUser, setChatUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSetSelectedUserId] = useState(null);
    const [newMessage, setNewMessage] = useState(null);
    const [showSelfProfile, setShowSelfProfile] = useState(false);
    const { messages, selectedConversation, setSelectedConversation } = userConversation();
    const { onlineUser, socket } = useSocketContext();

    useEffect(() => {
        const handler = (message) => {
            setNewMessage(message);
            setChatUser((prevChatUser) =>
                prevChatUser.map((user) => (user._id === message.senderId ? { ...user, hasNewMessage: true } : user))
            );
        };
        socket?.on('newMessage', handler);
        return () => socket?.off('newMessage', handler);
    }, [socket]);

    useEffect(() => {
        const fetchChatUsers = async () => {
            try {
                const chatters = await axios.get(`/api/user/currentchatters`);
                setChatUser(chatters.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchChatUsers();

        socket?.on('updateChatUsers', fetchChatUsers);

        return () => {
            socket?.off('updateChatUsers', fetchChatUsers);
        };
    }, [socket]);

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchInput.trim()) return;
        
        setLoading(true);
        try {
            const search = await axios.get(`/api/user/search?search=${searchInput}`);
            const data = search.data;
            if (data.success === false) {
                setLoading(false);
                console.log(data.message);
            }
            setLoading(false);
            if (data.length === 0) {
                toast.info('User Not Found');
            } else {
                setSearchuser(data);
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    const handleUserClick = (user) => {
        onSelectUser(user);
        setSelectedConversation(user);
        setSetSelectedUserId(user._id);

        setChatUser((prevChatUser) =>
            prevChatUser.map((chatUser) => {
                if (chatUser._id === user._id) {
                    return { ...chatUser, hasNewMessage: false };
                }
                return chatUser;
            })
        );

        setNewMessage(null);
    };

    const handleSearchback = () => {
        setSearchuser([]);
        setSearchInput('');
    };

    const handleLogOut = async () => {
        setLoading(true);
        try {
            const logout = await axios.post('/api/auth/logout');
            const data = logout.data;
            if (data?.success === false) {
                setLoading(false);
                console.log(data?.message);
            }
            toast.info(data?.message);
            localStorage.removeItem('chatapp');
            setAuthUser(null);
            setLoading(false);
            navigate('/login');
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    const UserItem = ({ user, isSearchResult = false }) => {
        const online = !isSearchResult && onlineUser.includes(user._id);
        const hasNew = !isSearchResult && newMessage?.receiverId === authUser._id && newMessage?.senderId === user._id;

        return (
            <div
                onClick={() => handleUserClick(user)}
                className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 hover-lift ${
                    selectedUserId === user._id
                        ? 'bg-purple-100 dark:bg-purple-900/30 shadow-md'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
            >
                <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-700">
                        <img src={user.profilepic} alt={user.username} className="w-full h-full object-cover" />
                    </div>
                    {online && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900"></div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{user.username}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.fullname || 'Available'}</p>
                </div>
                {hasNew && (
                    <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">
                            New
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 sm:rounded-2xl shadow-xl overflow-hidden min-h-0">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSelfProfile(true)}
                            className="p-0.5 rounded-full ring-2 ring-purple-400/50 hover:ring-purple-500 transition-all"
                            title="My Profile"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden">
                                <img src={authUser.profilepic} alt={authUser.username} className="w-full h-full object-cover" />
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Profile"
                        >
                            <FiUser className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to log out?')) {
                                    handleLogOut();
                                }
                            }}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Logout"
                        >
                            <FiLogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        type="text"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                        placeholder="Search users..."
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={handleSearchback}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <FiX />
                        </button>
                    )}
                </form>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto scrollbar p-2 sm:p-4 space-y-1 sm:space-y-2">
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : searchUser?.length > 0 ? (
                    <>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                            Search Results
                        </p>
                        {searchUser.map((user) => (
                            <UserItem key={user._id} user={user} isSearchResult={true} />
                        ))}
                    </>
                ) : chatUser.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <FiSearch className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No conversations yet</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Search for users to start chatting</p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                            Recent Chats
                        </p>
                        {chatUser.map((user) => (
                            <UserItem key={user._id} user={user} />
                        ))}
                    </>
                )}
            </div>

            {showSelfProfile && (
                <UserProfileModal
                    user={authUser}
                    onClose={() => setShowSelfProfile(false)}
                    onMessage={() => setShowSelfProfile(false)}
                    isSelf
                />
            )}
        </div>
    );
};

export default Sidebar;
