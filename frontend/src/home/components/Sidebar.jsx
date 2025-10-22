import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IoArrowBackSharp } from 'react-icons/io5';
import { BiLogOut } from "react-icons/bi";
import userConversation from "../../Zustand/useConversation.js";
import { useSocketContext } from '../../context/socketContext.jsx';

const Sidebar = ({ onSelectUser }) => {
    const navigate = useNavigate();
    const { authUser, setAuthUser } = useAuth();
    const [searchInput, setSearchInput] = useState('');
    const [searchUser, setSearchuser] = useState([]);
    const [chatUser, setChatUser] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUserId, setSetSelectedUserId] = useState(null);
    const [newMessage, setNewMessage] = useState(null); // Track the new message
    const { messages, selectedConversation, setSelectedConversation } = userConversation();
    const { onlineUser, socket } = useSocketContext();

    const nowOnline = chatUser.map((user) => user._id);
    const isOnline = nowOnline.map((userId) => onlineUser.includes(userId));

    useEffect(() => {
        socket?.on("newMessage", (message) => {
            setNewMessage(message);
            console.log("New message received:", message);
            // Update the chatUser state
            setChatUser((prevChatUser) => {
                return prevChatUser.map((user) => {
                    if (user._id === message.senderId) {
                        return { ...user, hasNewMessage: true };
                    }
                    return user;
                });
            });
        });
    
        return () => socket?.off("newMessage");
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
    
        // Fetch initially
        fetchChatUsers();
    
        // Set up socket listener for real-time updates
        socket?.on("updateChatUsers", () => {
            fetchChatUsers(); // Refresh users when an update event is received
        });
    
        // Set up periodic fetch as a fallback
        const intervalId = setInterval(() => {
            fetchChatUsers();
        }, 3000); // Refresh every 3 seconds
    
        return () => {
            clearInterval(intervalId);
            socket?.off("updateChatUsers");
        };
    }, [socket]);
    

    
    const handelSearchSubmit = async (e) => {
        e.preventDefault();
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
                toast.info("User Not Found");
            } else {
                setSearchuser(data);
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    const handelUserClick = (user) => {
        onSelectUser(user);
        setSelectedConversation(user);
        setSetSelectedUserId(user._id);
    
        // Reset the new message indicator for this user
        setChatUser((prevChatUser) =>
            prevChatUser.map((chatUser) => {
                if (chatUser._id === user._id) {
                    return { ...chatUser, hasNewMessage: false };
                }
                return chatUser;
            })
        );
    
        setNewMessage(null); // Reset the new message state
    };
    

    const handSearchback = () => {
        setSearchuser([]);
        setSearchInput('');
    };

    const handelLogOut = async () => {
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
    

    return (
        <div className='h-full w-auto px-1 bg-gray-300 rounded-lg'>
            <div className='flex justify-between gap-2 mt-4'>

     <form onSubmit={handelSearchSubmit} className='w-full flex items-center justify-between bg-white rounded-full p-0.3'>
            <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                type='text'
                className='px-4 py-2 w-full sm:w-[250px] bg-transparent outline-none rounded-full text-gray-900'
                placeholder='Search user'
            />
            <button className='btn btn-circle bg-sky-700 hover:bg-gray-950 sm:ml-2'>
                <FaSearch />
            </button>
     </form>

                <img
                    onClick={() => navigate(`/profile`)}
                    src={authUser?.profilepic}
                    className='self-center h-12 w-12 hover:scale-110 cursor-pointer' />
            </div>

            <div className='divider px-3 h-[1px] bg-gray-0'></div>

            {searchUser?.length > 0 ? (
                <>
                    <div className="min-h-[70%] max-h-[80%] m overflow-y-auto scrollbar">
                        <div className='w-auto'>
                            {searchUser.map((user, index) => (
                                <div key={user._id}>
                                    <div
                                        onClick={() => handelUserClick(user)}
                                        className={`flex gap-3 items-center rounded p-2 py-1 cursor-pointer
                                        ${selectedUserId === user._id ? 'bg-purple-400' : ''}`}>
                                        <div className={`avatar ${isOnline[index] ? 'online' : ''}`}>
                                            <div className="w-12 rounded-full">
                                                <img src={user.profilepic} alt='user.img' />
                                            </div>
                                        </div>
                                        <div className='flex flex-col flex-1'>
                                            <p className='font-bold text-gray-900'>{user.username}</p>
                                        </div>
                                    </div>
                                    <div className='divider divide-solid px-1 h-[1px] bg-gray-600'></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* <div className='mt-auto px-1 py-1 flex'>
                        <button onClick={handSearchback} className='bg-white rounded-full px-3 py-1 self-center'>
                            <IoArrowBackSharp size={25} />
                        </button>
                    </div> */}
                    <div className="mt-auto px-1 py-1 flex fixed bottom-0 left-0 right-0">
                        <button
                            onClick={handSearchback}
                            className="flex items-center justify-center gap-2 px-3 py-1 rounded-full text-gray-600 bg-white font-medium transition duration-300 ease-in-out transform hover:bg-gray-300 hover:text-gray-900 hover:scale-105 shadow-md cursor-pointer"
                            title="Back"
                        >
                            <IoArrowBackSharp size={25} />
                            <span>Back</span>
                        </button>
                    </div>


                </>
            ) : (
                <>
                    <div className="min-h-[70%] max-h-[80%] m overflow-y-auto scrollbar">
                        <div className='w-auto'>
                            {chatUser.length === 0 ? (
                                <div className='font-bold items-center flex flex-col text-xl text-yellow-500'>
                                    <h1>No User to chat</h1>
                                    <h1>Search username to chat</h1>
                                </div>
                            ) : (
                                chatUser.map((user, index) => (
                                    <div key={user._id}>
                                        <div
                                            onClick={() => handelUserClick(user)}
                                            className={`flex gap-3 items-center rounded p-2 py-1 cursor-pointer
                                            ${selectedUserId === user._id ? 'bg-purple-400' : ''}`}>
                                            <div className={`avatar ${isOnline[index] ? 'online' : ''}`}>
                                                <div className="w-12 rounded-full">
                                                    <img src={user.profilepic} alt='user.img' />
                                                </div>
                                            </div>
                                            <div className='flex flex-col flex-1'>
                                                <p className='font-bold text-gray-950'>{user.username}</p>
                                            </div>
                                            {/* Check if this user has a new message */}
                                            {newMessage?.receiverId === authUser._id && newMessage?.senderId === user._id && (
                                                <div className="rounded-full bg-green-700 text-sm text-white px-[4px]">+new message</div>
                                            )}
                                        </div>
                                        <div className='divider divide-solid px-5 h-[1px] bg-gray-900'></div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mt-auto px-1 py-1 flex fixed bottom-0 left-0 right-0">
                            <button
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to log out?")) {
                                        handelLogOut();
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-red-600 bg-gray-300 font-medium transition duration-300 ease-in-out transform hover:bg-red-600 hover:text-white hover:scale-105 shadow-lg cursor-pointer"
                                title="Logout"
                            >
                                <BiLogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>

                </>
            )}
        </div>
    );
};

export default Sidebar;
