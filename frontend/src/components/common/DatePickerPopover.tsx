"use client";

// 날짜 선택 달력 (디자인 794:2889 / 531:2077).
// 기록 작성 화면의 방문 날짜(2026.06.25 ▾)와 지역별 기록 목록의 날짜 필터(566:2096)가
// 같은 달력을 쓴다 — feature 끼리는 import 할 수 없어 공용 트리에 둔다.
//
// 카드 272×270, 라운드 9, 그림자 0 0 4 rgba(0,0,0,0.5).
// 요일 줄 #9f9f9f, 이번 달 날짜 #515151, 앞뒤 달 날짜 #9f9f9f.
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

const BRAND = "#6ca59c";
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface DatePickerPopoverProps {
  /** 현재 선택된 날짜. 선택이 없는 화면(필터)이라면 기준으로 삼을 날짜를 넘긴다. */
  value: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
  /**
   * 선택 표시를 그릴지. 필터처럼 "고른 날이 없는" 상태가 있는 화면은 false 로 넘겨
   * 아무 날짜도 골라지지 않은 것으로 보이게 한다.
   */
  showSelection?: boolean;
  /**
   * 팝오버 위치. 화면마다 헤더 높이가 달라 세로 위치만 바꿔 쓴다.
   * (기본값은 기록 작성 화면의 자리 — 디자인 top 129.)
   */
  className?: string;
}

/** 그 달 1일이 포함된 주의 일요일부터 6주(42칸)를 만든다 — 달마다 높이가 안 흔들린다. */
function buildCalendarDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  // 칸은 start 가 속한 달을 기준으로 더해야 한다. year/month(=보고 있는 달)에 start 의
  // 날짜만 더하면 앞달에서 시작할 때 한 달씩 밀려, 숫자는 맞는데 달이 틀린 날짜가 나온다.
  return Array.from(
    { length: 42 },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export default function DatePickerPopover({
  value,
  onSelect,
  onClose,
  showSelection = true,
  className = "absolute top-[113px] left-1/2 -translate-x-1/2",
}: DatePickerPopoverProps) {
  // 넘겨보는 달은 팝오버 안에서만 도는 상태다(선택과 분리 — 넘기기만 하고 닫을 수 있다).
  const [cursor, setCursor] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));

  const days = buildCalendarDays(cursor.getFullYear(), cursor.getMonth());
  const shiftMonth = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  return (
    <>
      {/* 바깥을 누르면 닫힌다. 디자인에 어두운 막이 없어 투명하게 둔다. */}
      <button
        type="button"
        aria-label="달력 닫기"
        onClick={onClose}
        className="fixed inset-0 z-30 cursor-default"
      />

      <div
        role="dialog"
        aria-label="날짜 선택"
        className={`z-40 w-[272px] rounded-[9px] bg-white p-[16px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.5)] ${className}`}
      >
        <div className="flex items-center">
          <p className="flex-1 text-[16px] text-black">
            {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
          </p>
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="이전 달"
            className="grid size-6 place-items-center text-zinc-700"
          >
            <ChevronLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="다음 달"
            className="ml-[8px] grid size-6 place-items-center text-zinc-700"
          >
            <ChevronRightIcon className="size-4" />
          </button>
        </div>

        <div className="mt-[12px] grid grid-cols-7 text-center text-[14px] text-[#9f9f9f]">
          {WEEKDAYS.map((w) => (
            <span key={w} className="py-[4px]">
              {w}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 text-center text-[14px]">
          {days.map((day) => {
            const inMonth = day.getMonth() === cursor.getMonth();
            const selected = showSelection && isSameDay(day, value);
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onSelect(day)}
                aria-current={selected ? "date" : undefined}
                className="grid h-[31px] place-items-center"
              >
                {/*
                  선택 표시는 디자인에 없다(디자인은 달을 넘긴 상태만 그려져 있다).
                  날짜를 고르는 화면이라 고른 날이 안 보이면 쓸 수 없어 브랜드 색 원을 둔다.
                */}
                <span
                  className={`grid size-[24px] place-items-center rounded-full ${
                    selected ? "text-white" : inMonth ? "text-[#515151]" : "text-[#9f9f9f]"
                  }`}
                  style={selected ? { backgroundColor: BRAND } : undefined}
                >
                  {day.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
