type Source = { kind: "file"; src: string } | { kind: "embed"; src: string };

/** Drive / YouTube / doğrudan video bağlantısını otomatik oynayan bir kaynağa çevirir. */
export function videoSource(raw: string | undefined | null): Source | null {
  const url = (raw ?? "").trim();
  if (!url) return null;

  const drive = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{10,})/);
  if (drive) return { kind: "embed", src: `https://drive.google.com/file/d/${drive[1]}/preview?autoplay=1` };

  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (youtube) {
    const id = youtube[1];
    return {
      kind: "embed",
      src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&playsinline=1&rel=0`,
    };
  }

  if (/^https?:\/\//.test(url) || url.startsWith("/")) return { kind: "file", src: url };
  return null;
}

export function ProductVideo({ url, title }: { url?: string | null; title: string }) {
  const source = videoSource(url);
  if (!source) return null;

  return (
    <div className="overflow-hidden rounded-3xl border border-ink-100 bg-black">
      {source.kind === "file" ? (
        <video
          src={source.src}
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          className="aspect-video w-full"
        />
      ) : (
        <iframe
          src={source.src}
          title={`${title} videosu`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
          className="aspect-video w-full"
        />
      )}
    </div>
  );
}
