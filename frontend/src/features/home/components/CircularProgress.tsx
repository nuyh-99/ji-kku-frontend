interface CircularProgressProps {
    percent: number;
}

export default function CircularProgress({ percent }: CircularProgressProps) {
    return (
        <div className="relative flex h-16 w-16 items-center justify-center">
            <svg
                className="absolute inset-0"
                width="64"
                height="64"
                viewBox="-7.74 0 54.88 54.88"
                fill="none"
            >
                <circle
                    cx="19.7"
                    cy="27.44"
                    r="24.5"
                    stroke="#e5e7eb"
                    strokeWidth="5.88"
                />
                <path
                    d="M19.7114 2.93994C23.7079 2.93994 27.6437 3.9176 31.1757 5.78768C34.7077 7.65776 37.7285 10.3635 39.9749 13.6689C42.2213 16.9743 43.6249 20.7791 44.0635 24.7514C44.502 28.7238 43.9622 32.7431 42.491 36.459C41.0197 40.1748 38.6619 43.4744 35.6229 46.0699C32.5839 48.6654 28.9562 50.4781 25.0559 51.3499C21.1557 52.2217 17.1014 52.1262 13.2465 51.0716C9.39169 50.017 5.85335 48.0355 2.94003 45.2997"
                    stroke="#6CA59C"
                    strokeWidth="5.88"
                    strokeMiterlimit="3.99933"
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