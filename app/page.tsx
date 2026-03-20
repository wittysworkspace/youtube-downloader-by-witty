'use client';
import { useState, useRef } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // ตัวแปรเก็บ % Loading
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setProgress(0);

    // จำลองหลอดโหลดวิ่งไปรอที่ 90%
    progressInterval.current = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + Math.floor(Math.random() * 5) + 1));
    }, 800);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        body: JSON.stringify({ url, format }),
      });
      const data = await res.json();
      
      if (data.downloadUrl) {
        setProgress(100); // เมื่อหลังบ้านเสร็จ บังคับวิ่งเต็ม 100%
        
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = data.downloadUrl;
          link.setAttribute('download', data.fileName); 
          document.body.appendChild(link);
          link.click();
          link.parentNode?.removeChild(link);
          
          // รีเซ็ตสถานะกลับเป็นปกติ
          setLoading(false);
          setProgress(0);
        }, 500); 
      } else {
        alert('เกิดข้อผิดพลาดในการดึงไฟล์');
        resetState();
      }
    } catch (error) {
      alert('ระบบหลังบ้านมีปัญหา');
      resetState();
    } finally {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
  };

  const resetState = () => {
    setLoading(false);
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-neutral-900 dark:to-neutral-950 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl rounded-3xl p-10 space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white">YouTube Downloader</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">วางลิงก์วิดีโอที่ต้องการดาวน์โหลด</p>
        </div>
        
        <div className="flex flex-col space-y-5">
          <input 
            type="text" 
            placeholder="https://youtube.com/..." 
            className="w-full px-5 py-4 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition shadow-inner text-gray-900 dark:text-white"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          
          <div className="flex space-x-4">
            <select 
              className="px-5 py-4 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl focus:outline-none flex-1 appearance-none cursor-pointer text-gray-900 dark:text-white disabled:opacity-50"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              disabled={loading}
            >
              <option value="mp4">วิดีโอ (MP4)</option>
              <option value="mp3">เสียง (MP3)</option>
            </select>
            
            <button 
              onClick={handleDownload}
              disabled={loading || !url}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-2xl transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            >
              {loading ? `${progress}%` : 'ดาวน์โหลด'}
            </button>
          </div>

          {/* แสดง Loading Bar เมื่อกำลังโหลด */}
          {loading && (
            <div className="w-full bg-gray-200 dark:bg-neutral-800 rounded-full h-2.5 mt-2 overflow-hidden shadow-inner">
              <div 
                className="bg-red-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}