// 1. Kiểu dữ liệu cho User (Người dùng)
export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    avatar?: string;
    token?: string; // Token chỉ có khi đăng nhập thành công
}

// 2. Kiểu dữ liệu cho Video & Ảnh (Cloudinary)
export interface IAsset {
    url: string;
    public_id: string;
    duration?: number; // Chỉ dành cho video
}

// 3. Kiểu dữ liệu cho Bài học (Lesson)
export interface ILesson {
    _id: string;
    title: string;
    slug: string;
    video?: IAsset;
    isPreview: boolean;
    duration?: number;
}

// 4. Kiểu dữ liệu cho Chương học (Section)
export interface ISection {
    _id: string;
    title: string;
    lessons: ILesson[]; // Một chương chứa nhiều bài học
}

// 5. Kiểu dữ liệu cho Khóa học (Course)
export interface ICourse {
    _id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    thumbnail?: IAsset;

    // Instructor có thể là string (ID) hoặc Object (nếu đã populate)
    instructor: IUser | string;

    // Category có thể là string (ID) hoặc Object (nếu đã populate)
    category: { _id: string; name: string; slug: string } | string;

    sections: ISection[];
    isPublished: boolean;
    updatedAt: string;
}

// 6. Kiểu dữ liệu lỗi trả về từ API (để hiển thị thông báo)
export interface ApiError {
    message: string;
    success?: boolean;
    stack?: string;
}