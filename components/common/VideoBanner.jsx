"use client";
import { useState } from "react";
import Image from "next/image";

// Reusable wide video banner: a poster image with a centred play button.
// Clicking it swaps the poster for the video, which plays in the same space.
export default function VideoBanner({
  posterSrc,
  posterAlt = "video-poster",
  videoSrc,
  label = "Play video",
  parentClass = "flat-spacing-2 pb_0",
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <section className={parentClass}>
      <div className="video-banner wow fadeInUp">
        {playing ? (
          <video
            className="video-banner-player"
            src={videoSrc}
            poster={posterSrc}
            controls
            autoPlay
            playsInline
          />
        ) : (
          <>
            <Image src={posterSrc} alt={posterAlt} width={2400} height={706} />
            <button
              type="button"
              className="video-banner-play"
              aria-label={label}
              onClick={() => setPlaying(true)}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" fill="currentColor" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
