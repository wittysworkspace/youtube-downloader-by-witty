import { NextResponse } from 'next/server';
import { create } from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';

const youtubedl = create('/usr/local/bin/yt-dlp');

export async function POST(req: Request) {
  let { url, format } = await req.json();
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

  // ตัดพารามิเตอร์ขยะที่ YouTube ชอบใส่มาแอบติดตาม (เช่น ?si=...) ทิ้งไป เพื่อลดโอกาสโดนบล็อก
  url = url.split('?')[0]; 

  const downloadDir = path.join(process.cwd(), 'public', 'downloads');
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

  const ext = format === 'mp3' ? 'mp3' : 'mp4';
  const serverFileName = `YTDL_by_witty_${Date.now()}.${ext}`; 
  const filePath = path.join(downloadDir, serverFileName);

  try {
    const options: any = {
      noWarnings: true,
      noCallHome: true,
      forceIpv4: true,
      // ท่าไม้ตายหลบ IP แบน: ปลอมตัวว่าคนกำลังกดดูจากแอปมือถือ Android ไม่ใช่เซิร์ฟเวอร์
      extractorArgs: 'youtube:player_client=android,web', 
      output: filePath,
    };

    if (format === 'mp3') {
      options.extractAudio = true;
      options.audioFormat = 'mp3';
    } else {
      options.matchFilter = 'duration <= 1200'; 
      options.format = 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
      options.mergeOutputFormat = 'mp4';
    }

    await youtubedl(url, options);

    const response = NextResponse.json({ 
      downloadUrl: `/downloads/${serverFileName}`, 
      fileName: `YTDL_by_witty.${ext}` 
    });

    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }, 60000); 

    return response;
  } catch (error: any) {
    // ดึงข้อความ Error จริงๆ จากระบบหลังบ้านมาแสดง จะได้ไม่ต้องงมหาแบบรอบที่แล้ว
    console.error("YT-DLP ERROR:", error.stderr || error.message || error);
    return NextResponse.json({ error: 'Failed or Blocked by YouTube' }, { status: 500 });
  }
}