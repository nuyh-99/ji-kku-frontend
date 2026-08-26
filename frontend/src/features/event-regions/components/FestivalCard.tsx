"use client";

import Link from "next/link";
import { useState } from "react";
import type { FestivalCardData } from "../utils/mapFestival";

export default function FestivalCard({ festival }: { festival: FestivalCardData }) {
  const [imgSrc, setImgSrc] = useState(
    festival.imageUrl?.trim() ? festival.imageUrl : "/festivals/noimage.jpg"
  );

  return (
    <Link
      href={`/event-regions/festival/${festival.id}`}
      className="relative block shrink-0"
      style={{ width: 146.75, height: 149.03 }}
    >
      {/* 이미지 프레임 */}
      <div
        className="absolute left-0 overflow-hidden bg-white"
        style={{
          width: 137.7950439453125,
          height: 131.8935546875,
          top: 0.03,
          borderRadius: 6.2,
          boxShadow: "0.69px 2.76px 2.76px 0px #00000040",
        }}
      >
        {/* 💡 Next.js Image 대신 기본 <img> 태그 사용 (next.config 설정 제약 우회) */}
        <img
          src={imgSrc}
          alt={festival.title}
          className="w-full h-full object-cover"
          onError={() => setImgSrc("/festivals/noimage.jpg")}
        />
      </div>

      {/* 텍스트 박스 (이미지 하단과 겹침) */}
      <div
        className="absolute left-0"
        style={{
          width: 124,
          height: 57,
          top: 92.03,
          background: "#6CA59C",
          borderBottomRightRadius: 8.27,
          boxShadow: "0.69px 2.76px 2.76px 0px #00000040",
        }}
      >
        <p
          className="absolute text-white truncate"
          style={{
            width: 89,
            height: 14,
            top: 7.58,
            left: 6.2,
            fontFamily: "Pretendard",
            fontWeight: 700,
            fontSize: 12,
            lineHeight: "100%",
            letterSpacing: "0%",
          }}
        >
          {festival.title}
        </p>

        <p
          className="absolute text-white"
          style={{
            width: 94,
            height: 24,
            top: 24.87,
            left: 6.2,
            fontFamily: "Pretendard",
            fontWeight: 400,
            fontSize: 10,
            lineHeight: "12px",
            letterSpacing: "0%",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {festival.overview}
        </p>
      </div>
    </Link>
  );
}