'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import axiosClient from '@/utils/axiosClient';
import { Toaster } from 'react-hot-toast';

// Import Components
import AdminSidebar from './components/AdminSidebar';
import AdminStats from './components/AdminStats';
import PayoutsTab from './components/PayoutsTab';
import UsersTab from './components/UsersTab';
import CategoriesTab from './components/CategoriesTab';
import CoursesTab from './components/CoursesTab';


// (Bạn có thể tách UsersTab và CategoriesTab tương tự nếu muốn code gọn hơn nữa)
// Ở đây tôi giữ lại logic User/Category cũ của bạn trong file này để tránh việc refactor quá nhiều 1 lúc gây lỗi, 
// nhưng cấu trúc đã sẵn sàng để tách tiếp.

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalRevenue: 0, pendingPayouts: 0 });

    // --- LOGIC USER/CATEGORY CŨ (Giữ nguyên các state & hàm fetchUsers/Category cũ ở đây) ---
    // ... [Dán lại code quản lý User/Category cũ của bạn vào đây] ...

    // Hàm fetch stats dùng chung
    const fetchStats = async () => {
        try {
            const { data } = await axiosClient.get('/admin/stats');
            if (data.success) setStats(data.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchStats();
        // logic fetchUsers/Categories cũ của bạn
    }, []);

    if (loading) return <div className="flex justify-center h-screen items-center"><Loader2 className="animate-spin text-blue-600 w-10 h-10" /></div>;

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            <Toaster position="top-right" />

            {/* 1. SIDEBAR COMPONENT */}
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                pendingPayouts={stats.pendingPayouts}
            />

            {/* 2. MAIN CONTENT */}
            <div className="flex-1 p-8 overflow-y-auto">

                {activeTab === 'dashboard' && (
                    <AdminStats stats={stats} />
                )}

                {activeTab === 'payouts' && (
                    <PayoutsTab onUpdateStats={fetchStats} />
                )}

                {activeTab === 'users' && <UsersTab />}

                {activeTab === 'categories' && <CategoriesTab />}

                {activeTab === 'courses' && <CoursesTab />}


            </div>
        </div>
    );
}