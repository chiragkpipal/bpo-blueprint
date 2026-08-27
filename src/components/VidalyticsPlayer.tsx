'use client';

import React, { useEffect, useState } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
}

export function parseVidalytics(code: string) {
  if (!code) return null;
  const match = code.match(/vidalytics\.com.*?embeds.*?([a-zA-Z0-9_-]+).*?([a-zA-Z0-9_-]{8,30})/i);
  if (match) {
    const workspaceId = match[1];
    const videoId = match[2];
    return {
      embedUrl: `https://fast.vidalytics.com/embeds/${workspaceId}/${videoId}/`,
      embedId: `vidalytics_embed_${videoId}`
    };
  }
  return null;
}

export default function VidalyticsPlayer({ videoUrl }: VideoPlayerProps) {
  const parsed = parseVidalytics(videoUrl);
  const embedUrl = parsed?.embedUrl || null;
  const embedId = parsed?.embedId || null;

  useEffect(() => {
    if (!embedId || !embedUrl) return;

    try {
      const runVidalytics = () => {
        const v = window as any;
        const i = document;
        const d = 'Vidalytics';
        const a = embedId;
        const l = embedUrl;

        const y = '_' + d.toLowerCase();
        const c = d + 'L';

        if (!v[d]) { v[d] = {}; }
        if (!v[c]) { v[c] = {}; }
        if (!v[y]) { v[y] = {}; }

        const vl = 'Loader';
        let vli = v[y][vl];
        let vsl = v[c][vl + 'Script'];

        vsl = function (u: string, cb: () => void) {
          const s = i.createElement("script");
          s.type = "text/javascript";
          s.async = true;
          s.src = u;
          s.onload = function () {
            cb();
          };
          i.getElementsByTagName("head")[0].appendChild(s);
        };
        v[c][vl + 'Script'] = vsl;

        vsl(l + 'loader.min.js', function () {
          const vlc = v[c][vl];
          vli = new vlc();
          vli.loadScript(l + 'player.min.js', function () {
            const vec = v[d]['Embed'];
            const t = new vec();
            t.run(a);
          });
        });
      };

      runVidalytics();
    } catch (err) {
      console.error("Vidalytics Player initialization error:", err);
    }
  }, [embedId, embedUrl]);

  if (!videoUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/60 text-white/40 text-xs font-mono">
        <span>No video stream assigned for this lesson yet.</span>
      </div>
    );
  }

  // If standard YouTube or Vimeo or generic iframe
  if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com')) {
    let src = videoUrl;
    if (videoUrl.includes('watch?v=')) {
      src = videoUrl.replace('watch?v=', 'embed/');
    } else if (videoUrl.includes('youtu.be/')) {
      src = videoUrl.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    return (
      <iframe
        src={src}
        className="w-full h-full absolute inset-0 border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  // If direct mp4 video
  if (videoUrl.endsWith('.mp4') || videoUrl.includes('.mp4?')) {
    return (
      <video
        src={videoUrl}
        controls
        className="w-full h-full absolute inset-0 object-contain bg-black"
      />
    );
  }

  // Vidalytics
  if (embedId && embedUrl) {
    return (
      <div 
        key={embedId} 
        id={embedId} 
        className="w-full h-full absolute inset-0"
      />
    );
  }

  // Generic iframe fallback
  return (
    <iframe
      src={videoUrl}
      className="w-full h-full absolute inset-0 border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
