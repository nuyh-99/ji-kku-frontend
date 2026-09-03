"use client";

// 여행 기록 작성 화면 (디자인 488:4347, 날짜선택 794:2889, 키보드 794:2985, 등록 794:3117).
//
// 지도 2단계에서 "기록 작성하기"로 들어온다 — 어느 읍·면·동인지가 정해진 상태다.
// 등록을 누르면 "지도에 표시하시겠습니까?" 를 묻고,
//   - 표시하기  → 지도로 돌아가 사진 카드로 올린다(lib/mapDisplayHandoff).
//   - 저장만 하기 → 목록에만 남기고 지도에는 올리지 않는다.
//
// ⚠️ 저장은 아직 서버로 가지 않는다. lib/api/travelPost 의 요청/응답 타입이 unknown 이라
//    (백엔드 계약 미확정) 지금은 화면 흐름만 완성해 둔다.
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DatePickerPopover from "@/components/common/DatePickerPopover";
import { ChevronLeftIcon, MenuIcon } from "@/components/common/icons";
import { getEupmyeondongMap } from "@/data/regions/eupmyeondong";
import { putMapDisplayHandoff } from "@/lib/mapDisplayHandoff";
import MapDisplayDialog from "./MapDisplayDialog";

const BRAND = "#6ca59c";
/** 디자인의 날짜·보조 텍스트는 브랜드 색 70% 불투명도를 쓴다. */
const BRAND_70 = "rgba(108,165,156,0.7)";

interface RecordEditorProps {
  /** 어느 시군구 지도에서 왔는지. 지도로 돌아갈 때 쓴다. */
  sigunguCd: string;
  /** 어느 읍·면·동 기록인지. */
  eupmyeondongCd: string;
}

/** 디자인 표기 "2026.06.25". */
function formatDate(date: Date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${mm}.${dd}`;
}

export default function RecordEditor({ sigunguCd, eupmyeondongCd }: RecordEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visitedAt, setVisitedAt] = useState(() => new Date());
  const [images, setImages] = useState<string[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const regionName = useMemo(() => {
    const map = getEupmyeondongMap(sigunguCd);
    return map?.regions.find((r) => r.code === eupmyeondongCd)?.name ?? "이 지역";
  }, [sigunguCd, eupmyeondongCd]);

  const handlePickImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    // createObjectURL 은 탭을 벗어나면 무효다. 서버 업로드가 붙기 전까지의 미리보기 전용.
    setImages((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    // 같은 파일을 다시 고를 수 있게 비운다.
    event.target.value = "";
  };

  const backToMap = () => router.push("/map");

  const handleSaveOnly = () => {
    setConfirmOpen(false);
    // 목록에만 남긴다 — 기록 목록은 지도의 지역별 목록 화면이 보여준다.
    // 방금 쓴 기록이 다른 지역 것들 사이에 묻히지 않게 그 읍·면·동 목록으로 보낸다(디자인 583:4425).
    router.push(`/map/${sigunguCd}/posts?emd=${encodeURIComponent(eupmyeondongCd)}`);
  };

  const handleDisplayOnMap = () => {
    setConfirmOpen(false);
    putMapDisplayHandoff({
      recordId: `draft-${visitedAt.getTime()}`,
      sigunguCd,
      eupmyeondongCd,
      title: title.trim() || "제목",
      src: images[0] ?? "",
    });
    backToMap();
  };

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-white pt-11">
      {/* 상단 44px 는 OS status bar(시계·배터리) 자리로 비워둔다 — 디자인 프레임과 동일. */}
      <header className="relative flex h-14 shrink-0 items-center px-[17px]">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로"
          className="grid size-10 place-items-center rounded-full text-zinc-800 hover:bg-black/5"
        >
          <ChevronLeftIcon className="size-6" />
        </button>
        {/* 메뉴 내용이 디자인에 없어 아직 열지 않는다. */}
        <button
          type="button"
          aria-label="메뉴"
          className="absolute right-[17px] grid size-10 place-items-center rounded-full text-zinc-800 hover:bg-black/5"
        >
          <MenuIcon className="size-6" />
        </button>
      </header>

      {/* 취소 · 지역/날짜 · 등록 */}
      <div className="relative flex h-[41px] shrink-0 items-center border-b border-[#d9d9d9] px-[17px]">
        <button type="button" onClick={backToMap} className="text-[16px] text-[#5f5f5f]">
          취소
        </button>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-[6px] whitespace-nowrap">
          <span className="text-[16px] font-bold" style={{ color: BRAND }}>
            {regionName}
          </span>
          <button
            type="button"
            onClick={() => setDatePickerOpen(true)}
            aria-label="방문 날짜 선택"
            className="flex items-center gap-[6px] text-[14px] font-bold"
            style={{ color: BRAND_70 }}
          >
            {formatDate(visitedAt)}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/record/caret.svg" alt="" className="size-[10px] rotate-180" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="ml-auto text-[16px] text-[#5f5f5f]"
        >
          등록
        </button>
      </div>

      {/* 본문 영역 */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="제목"
          aria-label="제목"
          className="px-[17px] pt-[24px] pb-[25px] text-[24px] text-black outline-none placeholder:text-[#9c9c9c]"
        />

        <div className="mx-auto h-px w-[360px] shrink-0 bg-[#eee]" />

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="여행 기록을 작성해보세요!"
          aria-label="여행 기록"
          className="min-h-[160px] flex-1 resize-none px-[18px] pt-[22px] text-[14px] leading-[1.6] text-black outline-none placeholder:text-[#9c9c9c]"
        />

        {images.length > 0 && (
          <ul className="flex flex-wrap gap-2 px-[18px] pb-4">
            {images.map((src) => (
              <li key={src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="size-[84px] rounded-[9px] object-cover shadow-[0px_0px_2.5px_0px_rgba(0,0,0,0.5)]"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 하단 도구 막대 */}
      <div className="flex h-[56px] shrink-0 items-center gap-[30px] border-t border-[#eee] px-[17px] pb-[env(safe-area-inset-bottom)]">
        <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="사진 첨부">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/record/add-image.png" alt="" className="size-[31px] object-contain" />
        </button>
        {/*
          텍스트·정렬은 디자인에 아이콘만 있고 눌렀을 때의 화면이 없다.
          동작을 지어내지 않고 자리만 지킨다(메뉴(≡)와 같은 처리).
        */}
        <button type="button" aria-label="텍스트 서식">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/record/text.png" alt="" className="size-[24px] object-contain" />
        </button>
        <button type="button" aria-label="문단 정렬">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/record/align-left.png" alt="" className="size-[19px] object-contain" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePickImages}
          className="hidden"
        />
      </div>

      {datePickerOpen && (
        <DatePickerPopover
          value={visitedAt}
          onSelect={(date) => {
            setVisitedAt(date);
            setDatePickerOpen(false);
          }}
          onClose={() => setDatePickerOpen(false)}
        />
      )}

      {confirmOpen && (
        <MapDisplayDialog
          onSaveOnly={handleSaveOnly}
          onDisplay={handleDisplayOnMap}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
