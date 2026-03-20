import { NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';

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
      output: filePath,
    };

    if (format === 'mp3') {
      options.extractAudio = true;
      options.audioFormat = 'mp3';
    } else {
      options.format = 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
      options.mergeOutputFormat = 'mp4';
    }

    // รอจนกว่าจะโหลดและรวมไฟล์เสร็จ
    await youtubedl(url, options);

    // ส่งไฟล์กลับไปให้หน้าเว็บ
    const response = NextResponse.json({ 
      downloadUrl: `/downloads/${serverFileName}`, 
      fileName: `YTDL_by_witty.${ext}` 
    });

    // --- ระบบ Auto-Delete ---
    // ตั้งเวลาลบไฟล์ทิ้งหลังจากส่ง Response ไปแล้ว 60 วินาที 
    // (เพื่อให้เวลาเบราว์เซอร์ดึงไฟล์ไปจนเสร็จก่อน)
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted temporary file: ${serverFileName}`);
      }
    }, 60000); 

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}