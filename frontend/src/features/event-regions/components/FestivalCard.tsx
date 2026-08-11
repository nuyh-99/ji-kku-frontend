import Link from "next/link";
import Image from "next/image";
import type { FestivalCardData } from "../utils/mapFestival";

export default function FestivalCard({ festival }: { festival: FestivalCardData }) {
  return (
    <Link
      href={`/event-regions/${festival.id}`}
      className="relative block shrink-0"
      style={{ width: 146.75, height: 149.03 }}
    >
      {/* 이미지 프레임 */}
      <div
        className="absolute top-0 left-0 overflow-hidden bg-white"
        style={{ width: 146.75, height: 140.55, borderRadius: 6.2 }}
      >
        <Image src={festival.imageUrl} alt={festival.title} fill className="object-cover" />
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
            width: 106,
            top: 7.58,
            left: 6.89,
            fontFamily: "Pretendard",
            fontWeight: 700,
            fontSize: 10.33,
            lineHeight: "100%",
          }}
        >
          {festival.title}
        </p>

        <p
          className="absolute text-white"
          style={{
            width: 110,
            height: 21,
            top: 26.86,
            left: 6.89,
            fontFamily: "Pretendard",
            fontWeight: 400,
            fontSize: 8.27,
            lineHeight: "10.33px",
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