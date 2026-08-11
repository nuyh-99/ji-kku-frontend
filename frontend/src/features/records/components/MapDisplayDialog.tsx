"use client";

// "지도에 표시하시겠습니까?" 확인 모달 (디자인 794:3117 / 562:1855).
// 등록을 누르면 뜬다. 카드 296×255, 라운드 9, 그림자 0 0 4 rgba(0,0,0,0.5).
//
// 디자인에는 뒤를 덮는 어두운 막이 없다 — 카드만 떠 있다. 그대로 따르되,
// 바깥을 눌러 닫을 수 있게 투명한 버튼을 깐다.
const BRAND = "#6ca59c";

interface MapDisplayDialogProps {
  /** 지도에는 올리지 않고 목록에만 저장. */
  onSaveOnly: () => void;
  /** 지도에 사진 카드로 표시. */
  onDisplay: () => void;
  onClose: () => void;
}

export default function MapDisplayDialog({
  onSaveOnly,
  onDisplay,
  onClose,
}: MapDisplayDialogProps) {
  return (
    <>
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="fixed inset-0 z-30 cursor-default"
      />

      {/* 세로 위치: 헤더(56) + 취소/등록 줄(41) 아래 16px — 디자인의 top 129 와 같은 자리. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-display-title"
        className="absolute top-[113px] left-1/2 z-40 flex h-[255px] w-[296px] -translate-x-1/2 flex-col items-center rounded-[9px] bg-white px-[12px] pb-[16px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.5)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/record/location.png"
          alt=""
          className="mt-[27px] h-[92px] w-[83px] object-contain"
        />

        <h2 id="map-display-title" className="mt-[11px] text-[16px] font-bold text-black">
          지도에 표시하시겠습니까?
        </h2>
        <p className="mt-[6px] text-center text-[14px] text-[#5f5f5f]">
          표시하지 않을 경우 리스트에만 저장됩니다
        </p>

        <div className="mt-auto flex w-full items-center gap-[8px]">
          <button
            type="button"
            onClick={onSaveOnly}
            className="h-[40px] flex-1 rounded-[8px] border bg-white text-[14px] font-bold"
            style={{ borderColor: BRAND, color: BRAND }}
          >
            저장만 하기
          </button>
          <button
            type="button"
            onClick={onDisplay}
            className="h-[40px] flex-1 rounded-[8px] text-[14px] font-bold text-white"
            style={{ backgroundColor: BRAND }}
          >
            표시하기
          </button>
        </div>
      </div>
    </>
  );
}
