"use client";

// 여행 기록 작성 화면 (디자인 488:4347, 날짜선택 794:2889, 키보드 794:2985, 등록 794:3117).
//
// 지도 2단계에서 "기록 작성하기"로 들어온다 — 어느 읍·면·동인지가 정해진 상태다.
// 등록을 누르면 "지도에 표시하시겠습니까?" 를 묻고, 어느 쪽을 고르든 **먼저 서버에 저장한다**.
//   - 표시하기    → 저장 후 지도로 돌아가 사진 카드로 올린다(lib/mapDisplayHandoff).
//   - 저장만 하기 → 저장만 하고 그 읍·면·동 기록 목록으로 보낸다.
//
// 저장 순서: 사진 업로드(POST /images) → 블록 조립 → 기록 작성(POST /travel-posts/detail).
// 서버는 글과 사진을 blocks 한 배열에 sortOrder 로 섞어 받으므로, 본문 글이 먼저 오고
// 첨부 사진이 그 뒤에 차례로 붙는다.
//
// emdId(서버 DB 의 읍·면·동 id)는 lib/hooks/useEmds 가 시군구별 목록에서 찾아 준다 —
// 화면이 들고 있는 건 행정동코드라, 그 대응이 준비되기 전에는 저장 버튼이 막힌다.
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import DatePickerPopover from "@/components/common/DatePickerPopover";
import { ChevronLeftIcon, MenuIcon } from "@/components/common/icons";
import { getEupmyeondongMap } from "@/data/regions/eupmyeondong";
import { uploadImage } from "@/lib/api/image";
import { createTravelPost } from "@/lib/api/travelPost";
import type { TravelPostBlockCreateRequest } from "@/lib/api/travelPost";
import { EMD_UNRESOLVED_MESSAGE, useEmds } from "@/lib/hooks/useEmds";
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

/** 첨부 사진 한 장 — 올릴 원본과 화면에 뿌릴 미리보기(dataURL). */
interface PickedImage {
  file: File;
  preview: string;
}

/** 디자인 표기 "2026.06.25". */
function formatDate(date: Date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${mm}.${dd}`;
}

/** 서버 logDate 표기 "2026-06-25". 로컬 날짜 그대로 쓴다 — toISOString 은 UTC 로 하루 밀릴 수 있다. */
function toLogDate(date: Date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export default function RecordEditor({ sigunguCd, eupmyeondongCd }: RecordEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { emdIdOfCode } = useEmds(sigunguCd);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visitedAt, setVisitedAt] = useState(() => new Date());
  const [images, setImages] = useState<PickedImage[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regionName = useMemo(() => {
    const map = getEupmyeondongMap(sigunguCd);
    return map?.regions.find((r) => r.code === eupmyeondongCd)?.name ?? "이 지역";
  }, [sigunguCd, eupmyeondongCd]);

  const handlePickImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    // 같은 파일을 다시 고를 수 있게 비운다. 읽기를 기다리는 동안 input 이 살아 있어야 하므로 먼저.
    event.target.value = "";

    // 미리보기는 dataURL 이다 — createObjectURL 과 달리 따로 해제할 필요가 없다.
    // 서버로 가는 건 아래 saveRecord 가 원본 File 을 올려 받은 URL 이다.
    // 여러 장이면 읽기가 끝나는 순서가 뒤섞이므로, 다 읽고 나서 고른 순서대로 붙인다.
    const picked = await Promise.all(
      files.map(
        (file) =>
          new Promise<PickedImage | null>((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve(typeof reader.result === "string" ? { file, preview: reader.result } : null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          }),
      ),
    );

    const usable = picked.filter((image): image is PickedImage => image !== null);
    if (usable.length > 0) setImages((prev) => [...prev, ...usable]);
  };

  const backToMap = () => router.push("/map");

  /** 서버 제약(title 1자 이상, blocks 1개 이상)을 미리 본다. 통과하면 null. */
  const validate = (): string | null => {
    if (!title.trim()) return "제목을 입력해 주세요.";
    if (!content.trim() && images.length === 0) return "내용이나 사진을 하나 이상 넣어 주세요.";
    return null;
  };

  const handleSubmit = () => {
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }
    setError(null);
    setConfirmOpen(true);
  };

  /** 사진 업로드 → 기록 작성. 저장된 기록의 travelPostId 를 돌려준다. */
  const saveRecord = async (): Promise<number> => {
    const emdId = emdIdOfCode(eupmyeondongCd);
    if (emdId === null) throw new Error(EMD_UNRESOLVED_MESSAGE);

    // 사진끼리는 서로 독립이라 한꺼번에 올린다. 한 장이라도 실패하면 기록도 만들지 않는다.
    const uploaded = await Promise.all(images.map(({ file }) => uploadImage(file)));

    const blocks: TravelPostBlockCreateRequest[] = [];
    const text = content.trim();
    // sortOrder 는 0부터 — 배열 순서를 그대로 옮긴다.
    if (text) blocks.push({ blockType: "TEXT", sortOrder: blocks.length, textContent: text });
    for (const { imgUrl } of uploaded) {
      blocks.push({ blockType: "IMAGE", sortOrder: blocks.length, imgUrl });
    }

    const created = await createTravelPost({
      emdId,
      title: title.trim(),
      logDate: toLogDate(visitedAt),
      blocks,
    });

    // 새 기록은 지역 목록·지도 카드·마이페이지 집계에 두루 걸린다. 어디로 가든 최신이 보이도록
    // 넓게 무효화한다(다른 feature 의 query key 를 여기서 알 필요가 없다는 장점도 있다).
    await queryClient.invalidateQueries();

    return created.travelPostId;
  };

  /** 저장하고 나서 goNext 로 이동. 실패하면 화면에 남아 이유를 보여준다. */
  const submit = async (goNext: (travelPostId: number) => void) => {
    setSaving(true);
    setError(null);
    try {
      const travelPostId = await saveRecord();
      setConfirmOpen(false);
      goNext(travelPostId);
    } catch (err) {
      // ApiError 는 서버 메시지를, 대응표 누락은 안내 문구를 그대로 들고 온다.
      setConfirmOpen(false);
      setError(err instanceof Error ? err.message : "기록을 저장하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOnly = () =>
    submit(() => {
      // 방금 쓴 기록이 다른 지역 것들 사이에 묻히지 않게 그 읍·면·동 목록으로 보낸다(디자인 583:4425).
      router.push(`/map/${sigunguCd}/posts?emd=${encodeURIComponent(eupmyeondongCd)}`);
    });

  const handleDisplayOnMap = () =>
    submit((travelPostId) => {
      putMapDisplayHandoff({ travelPostId, sigunguCd, eupmyeondongCd });
      backToMap();
    });

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
          onClick={handleSubmit}
          disabled={saving}
          className="ml-auto text-[16px] text-[#5f5f5f] disabled:opacity-50"
        >
          {saving ? "저장 중…" : "등록"}
        </button>
      </div>

      {/* 저장 실패·입력 누락 안내. 디자인에 없는 자리라 줄 하나로만 끼운다. */}
      {error && (
        <p role="alert" className="shrink-0 px-[17px] pt-2 text-[13px] text-red-500">
          {error}
        </p>
      )}

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
            {images.map(({ preview }, index) => (
              // 같은 사진을 두 번 고를 수 있어 미리보기 문자열은 키가 될 수 없다.
              <li key={`${index}-${preview.length}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
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
          saving={saving}
          onSaveOnly={handleSaveOnly}
          onDisplay={handleDisplayOnMap}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}
