"use client";
import { useEffect, useRef } from "react";

// Reusable wide video banner. The video starts by itself (muted, looping) when
// the section scrolls into view and pauses when it leaves. The poster image
// shows until the video begins to play.
export default function VideoBanner({
  posterSrc,
  videoSrc,
  parentClass = "flat-spacing-2 pb_0",
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={parentClass}>
      <div className="video-banner wow fadeInUp">
        <video
          ref={videoRef}
          className="video-banner-player"
          src={videoSrc}
          poster={posterSrc}
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    </section>
  );
}
