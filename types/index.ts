// 1. Kiểu dữ liệu cho User (Người dùng)
export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    avatar?: string;
    token?: string; // Token chỉ có khi đăng nhập thành công
    enrolledCourses: (string | ICourse)[];
}

// 2. Kiểu dữ liệu cho Video & Ảnh (Cloudinary)
export interface IAsset {
    url: string;
    public_id: string;
    duration?: number; // Chỉ dành cho video
}

// Cập nhật Interface Lesson
export interface ILesson {
    _id: string;
    title: string;
    slug: string;

    // --- PHẦN MỚI ---
    type: 'video' | 'text' | 'quiz';
    content?: string; // Cho bài text
    quizQuestions?: IQuizQuestion[]; // Cho bài quiz
    // ----------------

    video?: {
        url: string;
        public_id: string;
        duration: number;
    };
    isPreview: boolean;
    order?: number;
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
    objectives?: string[];
    sections: ISection[];
    isPublished: boolean;
    updatedAt: string;

    progress?: number;

    averageRating?: number; // <--- Thêm
    ratingCount?: number;
    totalStudents?: number;
}

// 6. Kiểu dữ liệu lỗi trả về từ API (để hiển thị thông báo)
export interface ApiError {
    message: string;
    success?: boolean;
    stack?: string;
}

// Thêm Interface cho câu hỏi trắc nghiệm
export interface IQuizQuestion {
    question: string;
    options: string[]; // Mảng 4 đáp án
    correctAnswer: number; // Index 0-3
}

export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    createdAt?: string;
}

export interface IReview {
    _id: string;
    user: IUser; // Populate user info
    course: string;
    rating: number;
    comment: string;
    instructorReply?: {
        user?: IUser;
        comment: string;
        updatedAt: string;
    };
    createdAt: string;
}