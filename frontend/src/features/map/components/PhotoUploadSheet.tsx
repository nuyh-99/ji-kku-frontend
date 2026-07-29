"use client";

// 사진 추가 바텀시트 — 드롭존(사진 선택) + "업로드 하기".
// 파일 선택 → 미리보기 → 업로드 시 선택 지역을 사진으로 채운다(폴리곤 clip).
// ⚠️ 지금은 로컬 dataURL로만 채운다. 서버 업로드(mapApi)는 백엔드 확정 후 연결.
import { useRef, useState } from "react";
import { useSelectRegion, useSelectedRegion } from "../hooks/useMapStore";
import { useDecorateFills, useSetFill } from "../hooks/useDecorateStore";

export default function PhotoUploadSheet() {
  const selected = useSelectedRegion();
  const selectRegion = useSelectRegion();
  const setFill = useSetFill();
  const fills = useDecorateFills();

  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const current = selected ? fills[selected] : undefined;
  const currentPhoto = current?.type === "photo" ? current.src : null;
  const shown = preview ?? currentPhoto;

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  // 채우고 나면 시트를 내린다 — 지역 선택만 풀면 안내("꾸밀 지역을 선택하세요")로 돌아가고,
  // 도구는 그대로라 다른 지역을 이어서 채울 수 있다.
  const handleUpload = () => {
    if (!selected || !shown) return;
    setFill(selected, { type: "photo", src: shown });
    selectRegion(null); // 시트가 언마운트되므로 preview 는 다음 열 때 알아서 초기화된다.
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-[14px] bg-white pb-6 shadow-[0px_-4px_10px_0px_rgba(0,0,0,0.25)]">
      <button
        type="button"
        onClick={() => selectRegion(null)}
        aria-label="닫기"
        className="flex w-full items-center justify-center py-3"
      >
        <span className="h-1 w-9 rounded-full bg-zinc-300" />
      </button>

      <div className="flex flex-col gap-4 px-4 pt-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative grid h-[172px] w-full place-items-center overflow-hidden bg-[#dce7e6]"
          aria-label="사진 선택"
        >
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt="선택한 사진"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/icons/map/add-image.png" alt="" className="size-20 object-contain" />
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={!shown}
          className="h-[51px] w-full rounded-[9px] text-sm font-bold text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "#6ca59c" }}
        >
          업로드 하기
        </button>
      </div>
    </div>
  );
}
