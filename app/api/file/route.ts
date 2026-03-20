import path from 'path';
import fs from 'fs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('name');
  if (!fileName) return new Response('No file specified', { status: 400 });

  const filePath = path.join(process.cwd(), 'public', 'downloads', fileName);

  if (!fs.existsSync(filePath)) {
    return new Response('File not found on server', { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath) as any;

  return new Response(fileStream, {
    headers: {
      'Content-Type': fileName.endsWith('.mp3') ? 'audio/mpeg' : 'video/mp4',
      'Content-Length': stat.size.toString(),
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}