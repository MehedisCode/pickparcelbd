"use client";
import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Package, Play } from "lucide-react";

function media(raw: string) {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const youtube =
      host === "youtu.be"
        ? url.pathname.slice(1).split("/")[0]
        : ["youtube.com", "m.youtube.com"].includes(host)
          ? url.searchParams.get("v") ||
            url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1]
          : null;
    if (youtube && /^[\w-]{11}$/.test(youtube))
      return {
        embed: `https://www.youtube-nocookie.com/embed/${youtube}`,
        thumbnail: `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`,
        provider: "YouTube",
      };
    if (
      ["tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"].includes(
        host,
      )
    ) {
      const id = url.pathname.match(/\/video\/(\d+)/)?.[1];
      return {
        embed: id ? `https://www.tiktok.com/player/v1/${id}` : null,
        provider: "TikTok",
      };
    }
    if (
      [
        "facebook.com",
        "m.facebook.com",
        "web.facebook.com",
        "fb.watch",
      ].includes(host)
    )
      return {
        embed:
          host === "fb.watch"
            ? null
            : `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url.href)}&show_text=false`,
        provider: "Facebook",
      };
    if (host === "drive.google.com") {
      const id =
        url.pathname.match(/\/d\/([\w-]+)/)?.[1] || url.searchParams.get("id");
      if (id && /^[\w-]+$/.test(id))
        return {
          embed: `https://drive.google.com/file/d/${id}/preview`,
          thumbnail: `https://drive.google.com/thumbnail?id=${id}&sz=w800`,
          provider: "Google Drive",
        };
    }
  } catch {}
  return null;
}
export function ProductMedia({
  src,
  alt,
  detail = false,
  eager = false,
}: {
  src?: string | null;
  alt: string;
  detail?: boolean;
  eager?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const item = src ? media(src) : null;
  if (!src) return <Package size={detail ? 100 : 60} strokeWidth={1} />;
  if (item) {
    if (detail && playing && item.embed)
      return (
        <iframe
          src={item.embed}
          title={alt}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", height: 450, border: 0 }}
        />
      );
    return (
      <div className="external-media">
        {item.thumbnail && !failed ? (
          <Image
            src={item.thumbnail}
            alt={alt}
            width={700}
            height={500}
            unoptimized
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : undefined}
            onError={() => setFailed(true)}
          />
        ) : (
          <Play size={45} />
        )}
        <span>
          {detail && item.embed ? (
            <button
              className="button secondary"
              onClick={() => setPlaying(true)}
            >
              <Play size={15} />
              Play on {item.provider}
            </button>
          ) : (
            <span>{item.provider}</span>
          )}
          {detail && (
            <a
              className="button secondary"
              href={src}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open original <ExternalLink size={13} />
            </a>
          )}
        </span>
      </div>
    );
  }
  if (failed) return <Package size={detail ? 100 : 60} strokeWidth={1} />;
  return (
    <Image
      src={src}
      alt={alt}
      width={detail ? 700 : 400}
      height={detail ? 700 : 350}
      unoptimized
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      onError={() => setFailed(true)}
    />
  );
}
