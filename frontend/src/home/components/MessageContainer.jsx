import React, { useEffect, useState, useRef } from 'react';
import userConversation from '../../Zustand/useConversation.js';
import { useAuth } from '../../context/AuthContext';
import { FiSend, FiMoreVertical, FiArrowLeft, FiShield, FiAlertCircle, FiImage, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from '../../utils/axiosInstance.js';
import { useSocketContext } from '../../context/socketContext.jsx';
import notify from '../../assets/sound/frontend_src_assets_sound_notification.mp3';
import UserProfileModal from './UserProfileModal.jsx';

const MessageContainer = ({ onBackUser }) => {
    const { messages, selectedConversation, setMessage } = userConversation();
    const { socket, onlineUser } = useSocketContext();
    const { authUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendData, setSendData] = useState('');
    const lastMessageRef = useRef();
    const [isBlocked, setIsBlocked] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [viewImage, setViewImage] = useState(null);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const fileInputRef = useRef();
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        if (showMenu) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    useEffect(() => {
        const handler = (newMessage) => {
            const sound = new Audio(notify);
            sound.play();
            setMessage((prev) => [...prev, newMessage]);
        };
        socket?.on('newMessage', handler);
        return () => socket?.off('newMessage', handler);
    }, [socket, setMessage]);

    useEffect(() => {
        if (selectedConversation?._id) {
            const checkBlockStatus = async () => {
                try {
                    const response = await axios.get(`/api/user/checkBlockStatus/${selectedConversation._id}`);
                    setIsBlocked(response.data.isBlocked);
                } catch (error) {
                    console.error('Error fetching block status:', error);
                }
            };

            checkBlockStatus();
        }
    }, [selectedConversation]);

    useEffect(() => {
        setTimeout(() => {
            lastMessageRef?.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, [messages, selectedConversation]);

    useEffect(() => {
        const getMessages = async () => {
            setLoading(true);
            try {
                const get = await axios.get(`/api/message/${selectedConversation?._id}`);
                const data = await get.data;
                if (data.success === false) {
                    setLoading(false);
                    console.log(data.message);
                }
                setLoading(false);
                setMessage(data);
            } catch (error) {
                setLoading(false);
                console.log(error);
            }
        };

        if (selectedConversation?._id) getMessages();
    }, [selectedConversation?._id, setMessage]);

    const handleMessages = (e) => {
        setSendData(e.target.value);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!sendData.trim() && !selectedImage) return;
        
        if (isBlocked) {
            toast.warning('You have blocked this user. Unblock to send messages.');
            return;
        }

        setSending(true);
        try {
            const formData = new FormData();
            if (selectedImage) {
                formData.append('image', selectedImage);
            }
            formData.append('messages', sendData);

            const res = await axios.post(`/api/message/send/${selectedConversation?._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const data = await res.data;

            if (data.success === false) {
                setSending(false);
                return;
            }
            setSending(false);
            setSendData('');
            clearImage();
            setMessage((prev) => [...prev, data]);
        } catch (error) {
            setSending(false);
            if (error.response?.status === 403) {
                toast.warning('You cannot send a message. The user has blocked you.');
            } else {
                toast.error('Failed to send message');
            }
        }
    };

    const handleBlockUnblock = async () => {
        try {
            if (isBlocked) {
                await axios.post('/api/user/unblock', {
                    blockedId: selectedConversation._id,
                });
                setIsBlocked(false);
                toast.success('User unblocked successfully!');
                socket.emit('setOnlineStatus');
            } else {
                await axios.post('/api/user/block', {
                    blockedId: selectedConversation._id,
                });
                setIsBlocked(true);
                toast.success('User blocked successfully!');
            }
            setShowMenu(false);
        } catch (error) {
            console.error('Error during block/unblock:', error);
            toast.error('An error occurred during block/unblock action.');
        }
    };

    if (!selectedConversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 sm:rounded-2xl min-h-0">
                <div className="text-center p-6 sm:p-8">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome, {authUser.username}!</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Select a conversation to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 sm:rounded-2xl shadow-xl overflow-hidden min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                        onClick={() => onBackUser(true)}
                        className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                    >
                        <FiArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
                        onClick={() => setShowUserProfile(true)}
                    >
                        <div className="relative flex-shrink-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-slate-700 group-hover:ring-purple-400 transition-all">
                                <img src={selectedConversation?.profilepic} alt={selectedConversation?.username} className="w-full h-full object-cover" />
                            </div>
                            {onlineUser.includes(selectedConversation?._id) && (
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-slate-900"></div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate text-sm sm:text-base">{selectedConversation?.username}</h3>
                            <p className={`text-xs ${onlineUser.includes(selectedConversation?._id) ? 'text-green-500' : 'text-slate-400'}`}>
                                {onlineUser.includes(selectedConversation?._id) ? 'Online' : 'Offline'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <FiMoreVertical className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-10 animate-scale-in">
                            <button
                                onClick={handleBlockUnblock}
                                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-lg"
                            >
                                <FiShield className={isBlocked ? 'text-green-500' : 'text-red-500'} />
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {isBlocked ? 'Unblock User' : 'Block User'}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Block Warning */}
            {isBlocked && (
                <div className="mx-4 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
                    <FiAlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">You have blocked this user. Unblock to send messages.</p>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar p-3 sm:p-4 space-y-3 sm:space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : messages?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <FiSend className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages?.map((message, index) => {
                        const isOwn = message.senderId?.toString() === authUser._id?.toString();
                        return (
                            <div
                                key={message?._id}
                                ref={index === messages.length - 1 ? lastMessageRef : null}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
                            >
                                <div className={`max-w-[85%] sm:max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                    {message.messageType === 'image' ? (
                                        <div
                                            className={`rounded-2xl overflow-hidden message-bubble cursor-pointer ${
                                                isOwn ? 'rounded-br-sm' : 'rounded-bl-sm'
                                            }`}
                                            onClick={() => setViewImage(message.imageUrl)}
                                        >
                                            <img
                                                src={message.imageUrl}
                                                alt="Shared image"
                                                className="max-w-full h-auto max-h-96 object-cover"
                                            />
                                            {message.message && (
                                                <div className={`px-4 py-2 ${
                                                    isOwn
                                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                                }`}>
                                                    <p className="text-sm break-words">{message.message}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl message-bubble ${
                                                isOwn
                                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-sm'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm'
                                            }`}
                                        >
                                            <p className="text-sm break-words">{message?.message}</p>
                                        </div>
                                    )}
                                    <span className="text-xs text-slate-400 px-1">
                                        {new Date(message?.createdAt).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div className="mx-4 mb-2 relative">
                    <div className="relative inline-block">
                        <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
                        <button
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Message Input */}
            <div className="p-2 sm:p-4 border-t border-slate-200 dark:border-slate-800">
                <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        disabled={isBlocked}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isBlocked}
                        className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
                    >
                        <FiImage className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                    <input
                        value={sendData}
                        onChange={handleMessages}
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                        disabled={isBlocked}
                    />
                    <button
                        type="submit"
                        disabled={sending || (!sendData.trim() && !selectedImage) || isBlocked}
                        className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                        {sending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <FiSend className="w-5 h-5" />
                        )}
                    </button>
                </form>
            </div>

            {/* Image Viewer Modal */}
            {viewImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                    onClick={() => setViewImage(null)}
                >
                    <button
                        onClick={() => setViewImage(null)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <FiX className="w-6 h-6" />
                    </button>
                    <img
                        src={viewImage}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* User Profile Modal */}
            {showUserProfile && (
                <UserProfileModal
                    user={selectedConversation}
                    onClose={() => setShowUserProfile(false)}
                    onMessage={(user) => {
                        setShowUserProfile(false);
                    }}
                />
            )}
        </div>
    );
};

export default MessageContainer;
