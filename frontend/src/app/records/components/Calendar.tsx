"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/common/icons";

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  visitedDates: string[];
}

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarCell {
  day: number;
  currentMonth: boolean;
  dateObj: Date;
}

function getCalendarCells(
  year: number,
  month: number
): CalendarCell[] {
  // month: 0-indexed (0 = 1월)
  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();
  const daysInPrevMonth = new Date(
    year,
    month,
    0
  ).getDate();

  const cells: CalendarCell[] = [];

  // 이전 달 꼬리
  for (let i = startDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;

    cells.push({
      day,
      currentMonth: false,
      dateObj: new Date(year, month - 1, day),
    });
  }

  // 현재 달
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      currentMonth: true,
      dateObj: new Date(year, month, day),
    });
  }

  // 다음 달 머리 (항상 6주 = 42칸 고정)
  const remaining = 42 - cells.length;

  for (let day = 1; day <= remaining; day++) {
    cells.push({
      day,
      currentMonth: false,
      dateObj: new Date(year, month + 1, day),
    });
  }

  return cells;
}

function isSameDate(a: Date, b: Date | null) {
  if (!b) return false;

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Calendar({
  selectedDate,
  onSelectDate,
  visitedDates,
}: CalendarProps) {
  const today = new Date();

  const [viewYear, setViewYear] = useState(
    selectedDate
      ? selectedDate.getFullYear()
      : today.getFullYear()
  );

  const [viewMonth, setViewMonth] = useState(
    selectedDate
      ? selectedDate.getMonth()
      : today.getMonth()
  );

  const cells = getCalendarCells(viewYear, viewMonth);

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="w-full h-full flex flex-col font-pretendard">
      {/* 상단 연/월 + 이전/다음 버튼 */}
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-sm font-semibold">
          {viewYear}년 {viewMonth + 1}월
        </span>

        <div className="flex items-center gap-1">
          <button
            aria-label="이전 달"
            onClick={goToPrevMonth}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronLeftIcon className="size-4 text-[#CACACA]" />
          </button>

          <button
            aria-label="다음 달"
            onClick={goToNextMonth}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronRightIcon className="size-4 text-[#CACACA]" />
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-center text-xs text-[#9F9F9F]"
          >
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map(
          ({ day, currentMonth, dateObj }, idx) => {
            // 선택된 날짜인지
            const isSelected = isSameDate(
              dateObj,
              selectedDate
            );

            // 방문 기록이 있는 날짜인지
            const isVisited = visitedDates.includes(
              formatIsoDate(dateObj)
            );

            let circleStyle = "";

            if (isSelected) {
              // 선택한 날짜 → 초록색
              circleStyle =
                "bg-[#6CA59C] text-white font-medium";
            } else if (isVisited) {
              // 방문 기록이 있는 날짜 → 회색
              circleStyle =
                "bg-gray-200 text-gray-900 font-medium";
            } else if (currentMonth) {
              // 일반 날짜
              circleStyle =
                "text-gray-800 hover:bg-gray-100";
            } else {
              // 이전/다음 달 날짜
              circleStyle = "text-[#9F9F9F]";
            }

            return (
              <button
                key={idx}
                onClick={() => onSelectDate(dateObj)}
                className="flex items-center justify-center h-[30px]"
              >
                <span
                  className={[
                    "flex items-center justify-center",
                    "w-[26.27px] h-[26.27px] rounded-[15.45px]",
                    "text-sm transition-colors",
                    circleStyle,
                  ].join(" ")}
                >
                  {day}
                </span>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}
  