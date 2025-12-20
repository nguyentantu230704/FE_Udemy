'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import axiosClient from '@/utils/axiosClient';
import { ICourse, IUser } from '@/types';
import { Loader2, TrendingUp, Code, Database, PenTool, Globe } from 'lucide-react';
// --- 1. IMPORT COMPONENT AVATAR MỚI ---
import UserAvatar from '@/components/UserAvatar';

export default function Home() {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    // 1. Lấy user từ LocalStorage để hiện lời chào
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 2. Lấy danh sách khóa học
    const fetchCourses = async () => {
      try {
        const { data } = await axiosClient.get('/courses?isPublished=true');
        if (data.success) {
          setCourses(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="pb-12 bg-white">

      {/* 1. WELCOME SECTION (Lời chào cá nhân hóa) */}
      {/* Chỉ hiện khi user đã đăng nhập */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
          <div className="flex items-center gap-4">

            {/* --- 2. SỬ DỤNG USER AVATAR TẠI ĐÂY --- */}
            {/* Thay thế cho đoạn code div tròn thủ công cũ */}
            <UserAvatar
              src={user.avatar}
              name={user.name}
              className="w-16 h-16 border-transparent" // Kích thước to hơn cho đẹp
              fontSize="text-2xl"
            />

            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Chào mừng {user.name} trở lại!
              </h1>
              <Link href="/my-courses" className="text-purple-600 text-sm font-medium hover:underline">
                Đến trang học tập của bạn &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. HERO BANNER (Phong cách Udemy: Hộp trắng nổi trên nền ảnh) */}
      <div className="max-w-7xl mx-auto px-0 sm:px-6 mt-4">
        <div className="relative h-[300px] md:h-[400px] overflow-hidden sm:rounded-lg shadow-sm">
          {/* Ảnh nền (Background) */}
          <div className="absolute inset-0">
            <img
              // Ảnh minh họa nền đỏ/cam tương tự Udemy
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
              alt="Banner"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* HỘP TRẮNG NỔI (Floating Card) */}
          <div className="absolute top-8 left-4 md:top-12 md:left-12 bg-white p-6 md:p-8 max-w-sm md:max-w-md shadow-2xl rounded-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 font-serif">
              Săn Sale Giáng Sinh
            </h2>
            <p className="text-gray-700 text-base mb-6 leading-relaxed">
              Đầu tư cho tương lai với mức giá ưu đãi. Các khóa học lập trình, ngoại ngữ chỉ từ <span className="font-bold">199.000đ</span>. Kết thúc sau 24h.
            </p>
            <button className="bg-gray-900 text-white font-bold py-3 px-6 hover:bg-gray-800 transition w-auto">
              Khám phá ngay
            </button>
          </div>
        </div>
      </div>

      {/* 3. CATEGORIES (Danh mục nhanh) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Khám phá các chủ đề hàng đầu</h3>
        <div className="flex flex-wrap gap-4">
          <CategoryPill icon={<Code />} label="Lập trình Web" />
          <CategoryPill icon={<Database />} label="Khoa học dữ liệu" />
          <CategoryPill icon={<PenTool />} label="Thiết kế" />
          <CategoryPill icon={<Globe />} label="Ngoại ngữ" />
          <CategoryPill icon={<TrendingUp />} label="Marketing" />
        </div>
      </div>

      {/* 4. COURSE LIST SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Các khóa học nổi bật</h2>
            <p className="text-gray-600 mt-1">Học viên đang xem nhiều nhất tuần qua</p>
          </div>
          {/* Fake Tabs */}
          <div className="hidden md:flex gap-4 text-sm font-bold text-gray-500">
            <span className="text-gray-900 border-b-2 border-gray-900 pb-1 cursor-pointer">Tất cả</span>
            <span className="hover:text-gray-800 cursor-pointer">Lập trình</span>
            <span className="hover:text-gray-800 cursor-pointer">Kinh doanh</span>
            <span className="hover:text-gray-800 cursor-pointer">Thiết kế</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 border border-dashed rounded-lg">
            Chưa có khóa học nào được xuất bản.
          </div>
        )}
      </div>

      {/* 5. TRUST SECTION (Đã sửa link ảnh hoạt động 100%) */}
      <div className="mt-24 w-full bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-gray-500 font-bold text-sm tracking-widest mb-8 uppercase">
            Được tin dùng bởi các tập đoàn công nghệ hàng đầu
          </h3>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Volkswagen */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg"
              alt="Volkswagen"
              className="h-10 w-auto object-contain"
            />

            {/* Samsung */}
            <img
              src="https://images.samsung.com/is/image/samsung/assets/vn/about-us/brand/logo/mo/360_197_1.png?$720_N_PNG$"
              alt="Samsung"
              className="h-12 w-auto object-contain"
            />

            {/* Cisco */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg"
              alt="Cisco"
              className="h-10 w-auto object-contain"
            />

            {/* AT&T */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/AT%26T_logo_2016.svg/1024px-AT%26T_logo_2016.svg.png"
              alt="AT&T"
              className="h-10 w-auto object-contain"
            />

            {/* P&G */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/85/Procter_%26_Gamble_logo.svg"
              alt="P&G"
              className="h-12 w-auto object-contain"
            />

            {/* Hewlett Packard Enterprise (HP) */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/46/Hewlett_Packard_Enterprise_logo.svg"
              alt="HPE"
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component nhỏ hiển thị nút danh mục (Pill)
function CategoryPill({ icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex items-center gap-3 px-6 py-4 border border-gray-300 bg-white font-bold text-gray-700 hover:bg-gray-100 hover:shadow-md transition">
      {icon}
      <span>{label}</span>
    </button>
  )
}