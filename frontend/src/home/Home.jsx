import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MessageContainer from './components/MessageContainer';

const Home = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setIsSidebarVisible(false);
    };

    const handleShowSidebar = () => {
        setIsSidebarVisible(true);
        setSelectedUser(null);
    };

    return (
        <div className="flex-1 flex overflow-hidden sm:p-4 md:p-6" style={{ minHeight: 0 }}>
            <div className="flex-1 flex w-full max-w-7xl mx-auto min-h-0 sm:gap-4">
                {/* Sidebar — full screen on mobile when visible */}
                <div className={`
                    ${isSidebarVisible ? 'flex' : 'hidden'}
                    md:flex flex-col
                    w-full md:w-[320px] lg:w-[300px] xl:w-[340px]
                    flex-shrink-0 min-h-0
                `}>
                    <Sidebar onSelectUser={handleUserSelect} />
                </div>

                {/* Message Container — full screen on mobile when selected */}
                <div className={`
                    ${selectedUser ? 'flex' : 'hidden md:flex'}
                    flex-col flex-1 min-h-0 min-w-0
                `}>
                    <MessageContainer onBackUser={handleShowSidebar} />
                </div>
            </div>
        </div>
    );
};

export default Home;
