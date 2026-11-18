// Comprime los videos de assets/videos/ para la web (necesita ffmpeg en el PATH).
// Uso: npm run videos:optimizar            (todos)
//      npm run videos:optimizar -- proceso (solo los nombrados, por `salida`)
// H.264 en 2 pasadas con bitrate calculado para no pasar el peso máximo + poster webp.
import { execFileSync } from 'node:child_process';
import { mkdir, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const VIDEOS = [
  // Opciones: `copiar: true` copia el stream H.264 sin recomprimir (si el original ya entra en maxMB);
  // `poster: <seg>` elige el cuadro del poster; `inicio: <seg>` rota el video para que arranque (y haga loop) desde ese cuadro.
  // 720p como máximo: el original es 576x1024, así que no se agranda.
  { origen: 'proceso-asesoramiento-72s.mp4', salida: 'proceso', maxMB: 6, audio: true, alto: 1280 },
];
const AUDIO_KBPS = 64;
const MARGEN = 0.9; // dejamos 10% de aire por el overhead del contenedor

try {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
} catch {
  console.error('No encontré ffmpeg. En Windows: winget install Gyan.FFmpeg (y reabrir la terminal).');
  process.exit(1);
}

const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const duracion = (f) =>
  Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString());

const OUT = path.resolve('public/video');
await mkdir(OUT, { recursive: true });
const passlog = path.join(tmpdir(), 'dreamhair-ffmpeg2pass');

const elegidos = process.argv.slice(2);
for (const v of VIDEOS.filter((x) => !elegidos.length || elegidos.includes(x.salida))) {
  const entrada = path.resolve('assets/videos', v.origen);
  const salida = path.join(OUT, `${v.salida}.mp4`);
  const seg = duracion(entrada);
  const totalKbps = (v.maxMB * 8 * 1024 * MARGEN) / seg;
  const videoKbps = Math.floor(totalKbps - (v.audio ? AUDIO_KBPS : 0));
  const filtros = [v.filtro, v.alto && `scale=-2:'min(${v.alto},ih)'`].filter(Boolean);
  let escala = filtros.length ? ['-vf', filtros.join(',')] : [];
  if (v.inicio) {
    // Rotar: [inicio, fin] + [0, inicio]. El corte del loop queda donde estaba en el original.
    const t = v.inicio;
    escala = ['-filter_complex',
      `[0:v]split[a][b];[a]trim=start=${t},setpts=PTS-STARTPTS[x];[b]trim=end=${t},setpts=PTS-STARTPTS[y];[x][y]concat=n=2:v=1:a=0[v]`,
      '-map', '[v]'];
  }
  const comun = ['-i', entrada, ...escala, '-c:v', 'libx264', '-preset', 'slow', '-b:v', `${videoKbps}k`,
    '-maxrate', `${Math.floor(videoKbps * 1.5)}k`, '-bufsize', `${videoKbps * 2}k`, '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-passlogfile', passlog];

  if (v.copiar) {
    ff(['-i', entrada, '-map', '0:v:0', '-c:v', 'copy', '-an', '-movflags', '+faststart', salida]);
  } else {
  ff([...comun, '-pass', '1', '-an', '-f', 'mp4', process.platform === 'win32' ? 'NUL' : '/dev/null']);
  ff([...comun, '-pass', '2', ...(v.audio ? ['-c:a', 'aac', '-b:a', `${AUDIO_KBPS}k`] : ['-an']),
    '-movflags', '+faststart', salida]);
  }

  // poster en webp (por defecto 0,3 s; se puede elegir otro segundo con `poster`)
  ff(['-ss', String(v.poster ?? (v.inicio ? 0 : 0.3)), '-i', salida, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '72', path.join(OUT, `${v.salida}.webp`)]);

  const mb = (await stat(salida)).size / 1024 / 1024;
  console.log(`${mb <= v.maxMB ? '✓' : '✗'} ${v.salida}.mp4  ${mb.toFixed(2)} MB (máx ${v.maxMB}) · ${v.copiar ? "copia sin recomprimir" : `${videoKbps} kbps`} · ${seg.toFixed(1)} s`);
}

for (const ext of ['-0.log', '-0.log.mbtree']) await rm(passlog + ext, { force: true });
