const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const ffmpegPath = require('ffmpeg-static');

export const config = {
  api: { bodyParser: false }
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function supabaseUpload(buf, filename, contentType) {
  const key = process.env.SUPABASE_KEY;
  const host = process.env.SUPABASE_HOST;
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: host,
      path: `/storage/v1/object/audio/${filename}`,
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': 'Bearer ' + key,
        'Content-Type': contentType,
        'Content-Length': buf.length
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(`https://${host}/storage/v1/object/public/audio/${filename}`);
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} ${d}`));
        }
      });
    });
    req.on('error', reject);
    req.write(buf);
    req.end();
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ts = Date.now();
  const ext = (req.headers['x-filename'] || 'audio.m4a').split('.').pop().toLowerCase();
  const inputPath  = `/tmp/in_${ts}.${ext}`;
  const outputPath = `/tmp/out_${ts}.m4a`;

  try {
    const buf = await readBody(req);
    fs.writeFileSync(inputPath, buf);

    execSync(`"${ffmpegPath}" -i "${inputPath}" -c copy -movflags +faststart "${outputPath}" -y`, { timeout: 25000 });

    const fixed = fs.readFileSync(outputPath);
    const filename = `${ts}_processed.m4a`;
    const url = await supabaseUpload(fixed, filename, 'audio/mp4');

    res.status(200).json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    try { fs.unlinkSync(inputPath); } catch {}
    try { fs.unlinkSync(outputPath); } catch {}
  }
}
