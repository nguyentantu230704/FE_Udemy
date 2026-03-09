'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import thêm useRouter
import CourseCard from '@/components/CourseCard';
import axiosClient from '@/utils/axiosClient';
import { ICourse, IUser } from '@/types';
// Import thêm BookOpen cho icon mặc định
import { Loader2, TrendingUp, Code, Database, PenTool, Globe, BookOpen } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

// Định nghĩa interface cho Category
interface ICategory {
  _id: string;
  name: string;
  slug: string;
}

export default function Home() {
  const router = useRouter(); // Dùng để chuyển trang

  const [courses, setCourses] = useState<ICourse[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]); // State chứa danh mục thật
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IUser | null>(null);

  // State quản lý Tab đang được chọn (Mặc định là 'all')
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Gộp hàm lấy Danh mục và Khóa học chạy lúc trang vừa load
    const fetchInitialData = async () => {
      try {
        // 1. Lấy danh sách danh mục để làm Tabs và Pills
        const catRes = await axiosClient.get('/categories');
        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }

        // 2. Lấy danh sách tất cả khóa học ban đầu
        await fetchCourses('all');
      } catch (error) {
        console.error("Lỗi tải dữ liệu trang chủ", error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Hàm gọi API khóa học có kèm theo bộ lọc (nếu có)
  const fetchCourses = async (categoryId: string) => {
    setLoading(true);
    try {
      let url = '/courses?isPublished=true';

      // Nếu không phải là tab "Tất cả", thì nối thêm query category vào URL
      if (categoryId !== 'all') {
        url += `&category=${categoryId}`;
      }

      const { data } = await axiosClient.get(url);
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error("Lỗi tải khóa học", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi user bấm vào các Tab
  const handleTabClick = (categoryId: string) => {
    setActiveTab(categoryId);    // Đổi màu tab đang active
    fetchCourses(categoryId);    // Gọi API lọc danh sách mới
  };

  // Hàm thông minh tự động gán Icon dựa vào tên danh mục
  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('lập trình') || n.includes('web') || n.includes('it')) return <Code className="w-6 h-6 text-purple-600" />;
    if (n.includes('dữ liệu') || n.includes('data')) return <Database className="w-6 h-6 text-blue-600" />;
    if (n.includes('thiết kế') || n.includes('design')) return <PenTool className="w-6 h-6 text-pink-600" />;
    if (n.includes('ngôn ngữ') || n.includes('tiếng')) return <Globe className="w-6 h-6 text-green-600" />;
    if (n.includes('kinh doanh') || n.includes('marketing')) return <TrendingUp className="w-6 h-6 text-orange-600" />;
    return <BookOpen className="w-6 h-6 text-gray-600" />;
  };

  return (
    <div className="pb-12 bg-white">

      {/* 1. WELCOME SECTION */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
          <div className="flex items-center gap-4">
            <UserAvatar src={user.avatar} name={user.name} className="w-16 h-16 border-transparent shadow-sm" fontSize="text-2xl" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Chào mừng {user.name} trở lại!</h1>
              <Link href="/my-courses" className="text-purple-600 text-sm font-medium hover:underline">
                Đến trang học tập của bạn &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. HERO BANNER */}
      <div className="max-w-7xl mx-auto px-0 sm:px-6 mt-4">
        <div className="relative h-[300px] md:h-[400px] overflow-hidden sm:rounded-lg shadow-sm">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
              alt="Banner"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="absolute top-8 left-4 md:top-12 md:left-12 bg-white p-6 md:p-8 max-w-sm md:max-w-md shadow-2xl rounded-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">Săn Sale Giáng Sinh</h2>
            <p className="text-gray-700 text-base mb-6 leading-relaxed">
              Đầu tư cho tương lai với mức giá ưu đãi. Các khóa học lập trình, ngoại ngữ chỉ từ <span className="font-bold">199.000đ</span>. Kết thúc sau 24h.
            </p>
            {/* Đã gán sự kiện chuyển hướng cho nút này */}
            <button
              onClick={() => router.push('/search')}
              className="bg-purple-600 text-white font-bold py-3 px-6 hover:bg-purple-700 transition w-auto rounded-lg shadow-md"
            >
              Khám phá ngay
            </button>
          </div>
        </div>
      </div>

      {/* 3. CATEGORIES PILLS (Danh mục động từ DB) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Khám phá các chủ đề hàng đầu</h3>
        <div className="flex flex-wrap gap-4">
          {categories.length > 0 ? (
            // Cắt lấy 5 danh mục đầu tiên để hiển thị
            categories.slice(0, 5).map(cat => (
              <button
                key={cat._id}
                onClick={() => router.push(`/search?category=${cat._id}`)}
                className="flex items-center gap-3 px-6 py-4 border border-gray-200 bg-white font-bold text-gray-700 hover:bg-gray-50 hover:border-purple-300 hover:shadow-md hover:text-purple-700 transition rounded-xl"
              >
                {getCategoryIcon(cat.name)}
                <span>{cat.name}</span>
              </button>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Đang tải danh mục...</span>
          )}
        </div>
      </div>

      {/* 4. COURSE LIST VỚI TABS HOẠT ĐỘNG THỰC TẾ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Các khóa học nổi bật</h2>
            <p className="text-gray-600 mt-1">Học viên đang xem nhiều nhất tuần qua</p>
          </div>

          {/* Dãy Tabs (Cuộn ngang được trên Mobile) */}
          <div className="flex gap-6 text-sm font-bold text-gray-500 overflow-x-auto pb-1 no-scrollbar">
            <span
              onClick={() => handleTabClick('all')}
              className={`cursor-pointer whitespace-nowrap pb-1 transition-all ${activeTab === 'all' ? 'text-purple-700 border-b-2 border-purple-700' : 'hover:text-gray-900'}`}
            >
              Tất cả
            </span>
            {/* Lấy 4 danh mục làm Tab */}
            {categories.slice(0, 4).map(cat => (
              <span
                key={cat._id}
                onClick={() => handleTabClick(cat._id)}
                className={`cursor-pointer whitespace-nowrap pb-1 transition-all ${activeTab === cat._id ? 'text-purple-700 border-b-2 border-purple-700' : 'hover:text-gray-900'}`}
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10 min-h-[300px]">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 border border-dashed rounded-2xl bg-gray-50 min-h-[300px] flex items-center justify-center">
            Chưa có khóa học nào thuộc danh mục này được xuất bản.
          </div>
        )}
      </div>

      {/* 5. TRUST SECTION */}
      <div className="mt-24 w-full bg-gray-50 border-t border-gray-200 py-12">
        {/* ... (Đoạn code logo đối tác mình giữ nguyên y hệt của bạn) ... */}
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-gray-500 font-bold text-sm tracking-widest mb-8 uppercase">
            Được tin dùng bởi các tập đoàn công nghệ hàng đầu
          </h3>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Volkswagen */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg" alt="Volkswagen" className="h-10 w-auto object-contain" />
            {/* Samsung */}
            <img src="https://images.samsung.com/is/image/samsung/assets/vn/about-us/brand/logo/mo/360_197_1.png?$720_N_PNG$" alt="Samsung" className="h-12 w-auto object-contain" />
            {/* Cisco */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg" alt="Cisco" className="h-10 w-auto object-contain" />
            {/* AT&T */}
            <img src="https://1000logos.net/wp-content/uploads/2016/10/Color-ATT-Logo-500x281.jpg" alt="AT&T" className="h-10 w-auto object-contain" />
            {/* P&G */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/85/Procter_%26_Gamble_logo.svg" alt="P&G" className="h-12 w-auto object-contain" />
            {/* Hewlett Packard Enterprise (HP) */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Hewlett_Packard_Enterprise_logo.svg" alt="HPE" className="h-10 w-auto object-contain" />
          </div>
        </div>
      </div>

    </div>
  );
}