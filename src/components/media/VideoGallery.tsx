"use client";

import { useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const VIDEOS = [
  { id: "OzxQcIxiPIk", title: "FAB Defense Intro" },
  { id: "RwzAc2Y0fPI", title: "GL-Shock" },
  { id: "sZmDJMN6zxU", title: "AR-Podium" },
  { id: "PVzRUiUO6-c", title: "FRBS Flip-up Sights" },
  { id: "8V-oCMEDYyc", title: "Spike Bipod" },
  { id: "qBEQVrrv3F0", title: "GL Core" },
  { id: "bHXSVNUYNFY", title: "GL-Core S" },
  { id: "ksyxvqEZwLY", title: "Gradus" },
  { id: "lD5kN3WYV0Y", title: "TFL Forward Grip" },
  { id: "byL8U427MLQ", title: "RAPS C" },
  { id: "JQZDsg-O0fc", title: "PTK" },
  { id: "l-UYpYNbA3Q", title: "Vanguard" },
  { id: "GlddY7w1s1g", title: "Ruger 10/22 Chassis" },
];

function VideoEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="relative w-full aspect-video bg-fab-charcoal">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full group"
            aria-label={`Play ${title}`}
          >
            <Image
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={`${title} thumbnail`}
              width={480}
              height={360}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-fab-aqua/90 group-hover:bg-fab-aqua flex items-center justify-center transition-colors shadow-lg">
                <svg
                  className="w-6 h-6 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </button>
        )}
      </div>
      <p className="mt-2 text-base font-medium text-content-text">{title}</p>
    </div>
  );
}

export default function VideoGallery() {
  return (
    <div className="relative">
      <Swiper
        modules={[Navigation, A11y]}
        spaceBetween={16}
        navigation
        breakpoints={{
          0: { slidesPerView: 1 },
          640: { slidesPerView: 2, spaceBetween: 16 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
        }}
        className="media-swiper"
      >
        {VIDEOS.map(({ id, title }) => (
          <SwiperSlide key={id}>
            <VideoEmbed videoId={id} title={title} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
