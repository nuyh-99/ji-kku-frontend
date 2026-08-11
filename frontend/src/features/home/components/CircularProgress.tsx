interface CircularProgressProps {
    percent: number;
}

export default function CircularProgress({ percent }: CircularProgressProps) {
    return (
        <div className="relative flex h-16 w-16 items-center justify-center">
            <svg
                className="absolute inset-0 -rotate-90"
                width="64"
                height="64"
                viewBox="-7.74 0 54.88 54.88"
                fill="none"
            >
                {/* 배경 원 (회색) */}
                <circle
                    cx="19.7"
                    cy="27.44"
                    r="24.5"
                    stroke="#e5e7eb"
                    strokeWidth="5.88"
                />
                {/* 진행률 원 (청록색) — path 대신 circle로 교체 */}
                <circle
                    cx="19.7"
                    cy="27.44"
                    r="24.5"
                    stroke="#6CA59C"
                    strokeWidth="5.88"
                    strokeLinecap="round"
                    pathLength="100"
                    strokeDasharray="100"
                    strokeDashoffset={100 - percent}
                />
            </svg>
            <span className="absolute inset-0 z-10 flex items-center justify-center text-[14px] font-bold text-[#6CA59C]">
                {percent}%
            </span>
        </div>
    );
}