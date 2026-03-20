import { NextResponse } from 'next/server';
import { create } from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';

// สั่งให้ระบบใช้ yt-dlp ตัวใหม่ล่าสุดที่เราเพิ่งติดตั้งใน Docker
const youtubedl = create('/usr/local/bin/yt-dlp');

export async function POST(req: Request) {
  const { url, format } = await req.json();
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

  const downloadDir = path.join(process.cwd(), 'public', 'downloads');
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

  const ext = format === 'mp3' ? 'mp3' : 'mp4';
  const serverFileName = `YTDL_by_witty_${Date.now()}.${ext}`; 
  const filePath = path.join(downloadDir, serverFileName);

  try {
    const options: any = {
      noWarnings: true,
      noCallHome: true,
      forceIpv4: true, // สำคัญมาก: บังคับใช้ IPv4 หลบการโดนบล็อกจาก YouTube
      output: filePath,
    };

    if (format === 'mp3') {
      options.extractAudio = true;
      options.audioFormat = 'mp3';
    } else {
      // ป้องกันการโหลดคลิปยาวเกิน 20 นาที (1200 วินาที)
      options.matchFilter = 'duration <= 1200'; 
      options.format = 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
      options.mergeOutputFormat = 'mp4';
    }

    await youtubedl(url, options);

    const response = NextResponse.json({ 
      downloadUrl: `/downloads/${serverFileName}`, 
      fileName: `YTDL_by_witty.${ext}` 
    });

    // ลบไฟล์ทิ้งหลังจากส่งให้ดาวน์โหลด 60 วินาที
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }, 60000); 

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed or Video Too Long' }, { status: 500 });
  }
}