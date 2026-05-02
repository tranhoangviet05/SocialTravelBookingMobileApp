import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LoginModal from '../components/common/LoginModal';
import RegisterModal from '../components/common/RegisterModal';
import { useState } from 'react';

const MainLayout = () => {
    const [activeModal, setActiveModal] = useState(null);

    const openLogin = () => setActiveModal('login');
    const openRegister = () => setActiveModal('register');
    const closeModal = () => setActiveModal(null);

    return (
        <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-sky-100 selection:text-sky-900">
            <Header onLoginClick={openLogin} />
            
            <main className="flex-grow">
                {/* Pages will be injected here */}
                <Outlet context={{ openLogin, openRegister }} />
            </main>

            <Footer />

            <LoginModal 
                isOpen={activeModal === 'login'} 
                onClose={closeModal} 
                onSwitchToRegister={openRegister} 
            />
            <RegisterModal 
                isOpen={activeModal === 'register'} 
                onClose={closeModal} 
                onSwitchToLogin={openLogin} 
            />
        </div>
    );
};

export default MainLayout;
