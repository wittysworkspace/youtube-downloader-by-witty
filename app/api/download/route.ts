import { NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  const { url, format } = await req.json();
  if (!url) return NextResponse.json({ error: 'No URL' }, { status: 400 });

  const downloadDir = path.join(process.cwd(), 'public', 'downloads');
  if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

  try {
    const ext = format === 'mp3' ? 'mp3' : 'mp4';
    const serverFileName = `YTDL_by_witty_${Date.now()}.${ext}`; 
    const filePath = path.join(downloadDir, serverFileName);

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

    await youtubedl(url, options);

    return NextResponse.json({ 
      downloadUrl: `/downloads/${serverFileName}`, 
      fileName: `YTDL_by_witty.${ext}` 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}