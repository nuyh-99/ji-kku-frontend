// src/features/spots/components/SpotCard.tsx
import Image from "next/image";
import Link from "next/link";
import type { SpotCardData } from "../types/mapTodaySpot";

export default function SpotCard({ spot }: { spot: SpotCardData }) {
  return (
    <Link
      href={`/spots/${spot.id}`}
      className="relative block shrink-0"
      style={{ width: 137.77, height: 149.04 }}
    >
      {/* 이미지 영역 */}
      <div
        className="absolute top-0 left-0 overflow-hidden bg-white"
        style={{
          width: 137.77,
          height: 131.87,
          borderRadius: 6.2,
          boxShadow: "0.69px 2.76px 2.76px 0px #00000040",
        }}
      >
        <Image
          src={spot.imageUrl}
          alt={spot.title}
          fill
          className="object-cover"
        />
      </div>

      {/* 텍스트 박스 (이미지 하단과 겹치도록 배치) */}
      <div
        className="absolute left-0"
        style={{
          width: 106.77,
          height: 57.0,
          top: 92.03,
          background: "#6CA59C",
          borderBottomRightRadius: 8.27,
          boxShadow: "0.69px 2.76px 2.76px 0px #00000040",
        }}
      >
        {/* 장소(제목) */}
        <p
          className="absolute text-white"
          style={{
            width: 77,
            height: 12,
            top: 7.58,
            left: 6.89,
            fontFamily: "Pretendard",
            fontWeight: 700,
            fontSize: 10.33,
            lineHeight: "100%",
          }}
        >
          {spot.title}
        </p>

        {/* 상세 설명 */}
        <p
          className="absolute text-white"
          style={{
            width: 83,
            height: 21,
            top: 26.86,
            left: 6.89,
            fontFamily: "Pretendard",
            fontWeight: 400,
            fontSize: 8.27,
            lineHeight: "10.33px",
          }}
        >
          {spot.overview}
        </p>
      </div>
    </Link>
  );
}