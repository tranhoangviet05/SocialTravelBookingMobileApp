import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CreatePostModal from '../../components/tourist/news_feed/CreatePostModal';
import Sidebar from '../../components/tourist/news_feed/Slidebar';
import RightSidebar from '../../components/tourist/news_feed/FollowerRecommend';
import FloatingMessageButton from '../../components/tourist/news_feed/FloatingMessageButton';
import { SocialDataProvider } from '../../contexts/SocialDataContext';

const NewsFeed = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshFeed = () => setRefreshTrigger(prev => prev + 1);

    return (
        <SocialDataProvider>
            <div className="min-h-screen bg-white text-black font-sans flex justify-center">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                `}} />

                <div className="w-full flex justify-between relative px-2 md:px-6">

                    <Sidebar
                        openCreateModal={() => setIsCreateModalOpen(true)}
                    />

                    <main className="flex-1 max-w-[620px] min-h-screen border-x border-gray-100 bg-white shadow-[0_0_40px_rgba(0,0,0,0.02)]">
                        <Outlet context={{
                            openCreateModal: () => setIsCreateModalOpen(true),
                            refreshTrigger
                        }} />
                    </main>

                    <RightSidebar />

                </div>

                <CreatePostModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onPostCreated={refreshFeed}
                />


                <FloatingMessageButton />
            </div>
        </SocialDataProvider>
    );
}

export default NewsFeed;
