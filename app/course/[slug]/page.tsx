import { Metadata } from 'next';
import axios from 'axios';
import { notFound } from 'next/navigation';
import CourseDetailClient from './CourseDetailClient';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Khai báo kiểu dữ liệu dạng Promise cho params (Chuẩn Next.js 15)
type ParamsProps = {
    params: Promise<{ slug: string }>
};

// 1. HÀM TẠO THẺ SEO ĐỘNG
export async function generateMetadata({ params }: ParamsProps): Promise<Metadata> {
    try {
        // Bắt buộc phải "await params" trước khi lấy slug
        const resolvedParams = await params;
        const slug = resolvedParams.slug;

        const res = await axios.get(`${baseUrl}/courses/${slug}`);
        const course = res.data.data;
        const courseUrl = `${siteUrl}/course/${slug}`;

        return {
            title: `${course.title} | Udemy Clone`,
            description: course.description,
            openGraph: {
                title: course.title,
                description: course.description,
                url: courseUrl,
                siteName: 'Udemy Clone',
                images: [
                    {
                        url: course.thumbnail?.url || '',
                        width: 1200,
                        height: 630,
                        alt: course.title,
                    },
                ],
                locale: 'vi_VN',
                type: 'website',
            },
        };
    } catch (error) {
        return { title: 'Khóa học không tồn tại' };
    }
}

// 2. COMPONENT CHÍNH (Server)
export default async function CourseDetailPage({ params }: ParamsProps) {
    try {
        // Tương tự, phải "await params" ở đây
        const resolvedParams = await params;
        const slug = resolvedParams.slug;

        const res = await axios.get(`${baseUrl}/courses/${slug}`);
        const course = res.data.data;

        if (!course) {
            notFound();
        }

        return <CourseDetailClient initialCourse={course} />;

    } catch (error) {
        console.error("Lỗi fetch khóa học server:", error);
        notFound();
    }
}