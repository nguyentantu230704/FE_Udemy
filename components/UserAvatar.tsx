'use client';

import { useState, useEffect } from 'react';

interface Props {
    src?: string | null; // Link ảnh có thể null
    name: string;        // Tên user để lấy chữ cái đầu
    className?: string;  // Class tùy chỉnh kích thước (vd: w-8 h-8, w-16 h-16)
    fontSize?: string;   // Cỡ chữ (vd: text-sm, text-xl)
}

export default function UserAvatar({ src, name, className = 'w-8 h-8', fontSize = 'text-sm' }: Props) {
    // State để theo dõi xem ảnh có bị lỗi khi tải không
    const [imageError, setImageError] = useState(false);

    // Logic lấy chữ cái đầu của tên cuối cùng (Ví dụ: Nguyễn Văn A -> A)
    const initials = name ? name.trim().split(' ').pop()?.charAt(0).toUpperCase() : '?';

    // Reset trạng thái lỗi mỗi khi link ảnh (src) thay đổi
    // Điều này quan trọng khi user vừa đổi ảnh mới, ta cần thử tải lại ảnh mới đó
    useEffect(() => {
        setImageError(false);
    }, [src]);

    return (
        <div
            className={`relative rounded-full overflow-hidden bg-gray-900 text-purple-100 flex items-center justify-center font-bold ${className}`}
            // Thêm border để tạo hiệu ứng hover ở header nếu cần
            style={{ borderWidth: '2px' }}
        >
            {/* Ưu tiên 1: Hiển thị ảnh nếu có link VÀ chưa xác định là lỗi */}
            {src && !imageError ? (
                <img
                    src={src}
                    alt={name}
                    className="w-full h-full object-cover"
                    // Nếu ảnh tải lỗi, set state imageError thành true ngay lập tức
                    onError={() => setImageError(true)}
                />
            ) : (
                // Ưu tiên 2: Hiển thị chữ cái đầu nếu không có ảnh hoặc ảnh lỗi
                <span className={`${fontSize} select-none`}>{initials}</span>
            )}
        </div>
    );
}