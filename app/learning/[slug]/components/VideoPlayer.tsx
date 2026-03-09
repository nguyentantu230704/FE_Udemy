import { useRef } from 'react';

interface Props {
    videoUrl: string;
    lessonId: string;
    onEnded: () => void;
}

export default function VideoPlayer({ videoUrl, lessonId, onEnded }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);

    // 1. Tự động tải lại thời gian đang xem dở khi video tải xong dữ liệu
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const savedTime = localStorage.getItem(`video-progress-${lessonId}`);
            if (savedTime) {
                // Nhảy đến đúng số giây đã lưu
                videoRef.current.currentTime = parseFloat(savedTime);
            }
        }
    };

    // 2. Liên tục lưu thời gian xem vào LocalStorage (lưu mỗi 2 giây để tránh lag)
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            if (Math.floor(currentTime) % 2 === 0) {
                localStorage.setItem(`video-progress-${lessonId}`, currentTime.toString());
            }
        }
    };

    // 3. Khi xem xong, dọn dẹp bộ nhớ và đánh dấu hoàn thành bài học
    const handleEnded = () => {
        localStorage.removeItem(`video-progress-${lessonId}`);
        onEnded();
    };

    return (
        <div className="w-full bg-black aspect-video flex items-center justify-center sticky top-0 z-10 shadow-lg">
            <video
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full max-h-[80vh]"
                controlsList="nodownload"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
            />
        </div>
    );
}