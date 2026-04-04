import { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { FastForward, Rewind, Play, Pause } from 'lucide-react';
import Hls from 'hls.js';

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

    // 💡 TÍCH HỢP BỘ GIẢI MÃ HLS (CHIA NHỎ VIDEO)
    useEffect(() => {
        let hls: Hls;

        if (videoRef.current && videoUrl) {
            const video = videoRef.current;

            if (Hls.isSupported()) {
                hls = new Hls({ maxBufferLength: 30 });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
            }
            else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
            }
        }

        return () => {
            if (hls) hls.destroy();
        };
    }, [videoUrl]);

    // Xử lý lưu tiến độ học tập
    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const savedTime = localStorage.getItem(`video-progress-${lessonId}`);
            if (savedTime) videoRef.current.currentTime = parseFloat(savedTime);
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

    // Xử lý phím tắt (Trái, Phải, Space)
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
                if (e.target === videoRef.current) {
                    setTimeout(() => {
                        if (videoRef.current) setIndicator({ type: videoRef.current.paused ? 'pause' : 'play', id: Date.now() });
                    }, 10);
                } else {
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

    useEffect(() => {
        if (indicator) {
            const timer = setTimeout(() => setIndicator(null), 500);
            return () => clearTimeout(timer);
        }
    }, [indicator]);

    return (
        <div
            // KHÓA CẤP ĐỘ 1: Không bôi đen, chặn chuột phải
            className="relative w-full bg-black aspect-video flex items-center justify-center shadow-md overflow-hidden select-none"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Hiển thị Icon khi bấm phím tắt */}
            {indicator && (
                <div
                    key={indicator.id}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center bg-black/60 text-white rounded-full w-24 h-24 pointer-events-none animate-in fade-in zoom-in duration-200"
                >
                    {indicator.type === 'forward' && <><FastForward className="w-10 h-10 mb-1" /><span className="text-sm font-bold">+5s</span></>}
                    {indicator.type === 'rewind' && <><Rewind className="w-10 h-10 mb-1" /><span className="text-sm font-bold">-5s</span></>}
                    {indicator.type === 'play' && <Play className="w-12 h-12 ml-1" />}
                    {indicator.type === 'pause' && <Pause className="w-12 h-12" />}
                </div>
            )}

            <video
                ref={videoRef}
                controls
                autoPlay
                className="w-full h-full max-h-[75vh]"
                // KHÓA CẤP ĐỘ 1: Ẩn nút tải xuống của trình duyệt
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