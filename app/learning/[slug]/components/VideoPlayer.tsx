import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { FastForward, Rewind, Play, Pause } from 'lucide-react'; // 💡 1. Import thêm các Icon đẹp mắt

export interface VideoPlayerRef {
    getCurrentTime: () => number;
    seekTo: (time: number) => void;
}

interface Props {
    videoUrl: string;
    lessonId: string;
    onEnded: () => void;
}

const VideoPlayer = forwardRef<VideoPlayerRef, Props>(({ videoUrl, lessonId, onEnded }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // 💡 2. State để quản lý hiệu ứng hiển thị Icon (Lưu loại icon và ID để animation chạy mượt khi bấm liên tục)
    const [indicator, setIndicator] = useState<{ type: 'forward' | 'rewind' | 'play' | 'pause', id: number } | null>(null);

    useImperativeHandle(ref, () => ({
        getCurrentTime: () => {
            return videoRef.current ? videoRef.current.currentTime : 0;
        },
        seekTo: (time: number) => {
            if (videoRef.current) {
                videoRef.current.currentTime = time;
                videoRef.current.play();
            }
        }
    }));

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const savedTime = localStorage.getItem(`video-progress-${lessonId}`);
            if (savedTime) {
                videoRef.current.currentTime = parseFloat(savedTime);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            if (Math.floor(currentTime) % 2 === 0) {
                localStorage.setItem(`video-progress-${lessonId}`, currentTime.toString());
            }
        }
    };

    const handleEnded = () => {
        localStorage.removeItem(`video-progress-${lessonId}`);
        onEnded();
    };

    // 💡 3. Bắt sự kiện phím và kích hoạt State Icon
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeTag = document.activeElement?.tagName.toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea') return;

            if (!videoRef.current) return;

            if (e.key === 'ArrowRight') {
                videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 5, videoRef.current.duration);
                setIndicator({ type: 'forward', id: Date.now() });
            }
            else if (e.key === 'ArrowLeft') {
                videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 5, 0);
                setIndicator({ type: 'rewind', id: Date.now() });
            }
            else if (e.key === ' ') {
                // 💡 SỬA TẠI ĐÂY: Xử lý xung đột phím Space
                if (e.target === videoRef.current) {
                    // Trình duyệt ĐÃ TỰ XỬ LÝ play/pause rồi.
                    // Chúng ta KHÔNG ngăn chặn (preventDefault) và KHÔNG đảo state nữa.
                    // Chỉ cần delay 10 mili-giây để lấy chính xác trạng thái mới của video và hiện Icon.
                    setTimeout(() => {
                        if (videoRef.current) {
                            setIndicator({ type: videoRef.current.paused ? 'pause' : 'play', id: Date.now() });
                        }
                    }, 10);
                } else {
                    // Đang click ra ngoài màn hình trắng: Code của chúng ta phải tự xử lý từ A-Z
                    e.preventDefault();
                    if (videoRef.current.paused) {
                        videoRef.current.play();
                        setIndicator({ type: 'play', id: Date.now() });
                    } else {
                        videoRef.current.pause();
                        setIndicator({ type: 'pause', id: Date.now() });
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 💡 4. Tự động ẩn Icon sau 500ms
    useEffect(() => {
        if (indicator) {
            const timer = setTimeout(() => {
                setIndicator(null);
            }, 500); // Hiển thị nửa giây rồi biến mất
            return () => clearTimeout(timer); // Xóa timer nếu người dùng bấm phím liên tục
        }
    }, [indicator]);

    return (
        // Thêm class relative và overflow-hidden để chứa cái Icon bay lên
        <div className="relative w-full bg-black aspect-video flex items-center justify-center shadow-md overflow-hidden">

            {/* 💡 5. Khu vực hiển thị Hiệu ứng (Overlay) */}
            {indicator && (
                <div
                    key={indicator.id} // Dùng Date.now() làm key để ép CSS animation chạy lại từ đầu mỗi lần bấm phím
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center bg-black/60 text-white rounded-full w-24 h-24 pointer-events-none animate-in fade-in zoom-in duration-200"
                >
                    {indicator.type === 'forward' && (
                        <>
                            <FastForward className="w-10 h-10 mb-1" />
                            <span className="text-sm font-bold">+5s</span>
                        </>
                    )}
                    {indicator.type === 'rewind' && (
                        <>
                            <Rewind className="w-10 h-10 mb-1" />
                            <span className="text-sm font-bold">-5s</span>
                        </>
                    )}
                    {indicator.type === 'play' && <Play className="w-12 h-12 ml-1" />}
                    {indicator.type === 'pause' && <Pause className="w-12 h-12" />}
                </div>
            )}

            <video
                ref={videoRef}
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full max-h-[75vh]"
                controlsList="nodownload"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
            />
        </div>
    );
});

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;