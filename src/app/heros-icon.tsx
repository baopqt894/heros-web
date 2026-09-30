import type { CSSProperties } from "react";
export type HerosIconName =
  | "sos"
  | "location"
  | "audio"
  | "connection"
  | "safety"
  | "innovation"
  | "care"
  | "touch";
/** Original Heros icons: rounded shield, bell and ribbon motifs from the brand mark. */
export default function HerosIcon({
  name,
  size = 56,
  className = "",
  style,
}: {
  name: HerosIconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const heart = (
    <path
      d="M32 40s-11-6.2-11-13.3c0-6.1 7.5-8.7 11-3.7 3.5-5 11-2.4 11 3.7C43 33.8 32 40 32 40Z"
      fill="currentColor"
      stroke="none"
    />
  );
  return (
    <svg
      className={`heros-icon ${className}`}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "sos" && (
        <>
          <path
            d="M32 6C25 12 18 14 10 16c0 20 8 32 22 41 14-9 22-21 22-41-8-2-15-4-22-10Z"
            fill="var(--icon-wash,#f9dbe7)"
            stroke="none"
          />
          <path
            d="M21 36c3-3 3-5 3-11a8 8 0 0 1 16 0c0 6 0 8 3 11l2 3H19l2-3Z"
            fill="currentColor"
            stroke="none"
          />
          <path d="M28 44a4 4 0 0 0 8 0M18 22c-3 3-3 8-2 11m30-11c3 3 3 8 2 11M32 13v2" />
          <path d="M16 46c4 5 10 8 16 11" opacity=".4" />
        </>
      )}
      {name === "location" && (
        <>
          <path
            d="M47 46c8 1 12 4 12 7 0 5-12 8-27 8S5 58 5 53c0-3 4-6 12-7"
            fill="var(--icon-wash,#f9dbe7)"
            stroke="none"
          />
          <path d="M50 24c0 14-18 29-18 29S14 38 14 24a18 18 0 1 1 36 0Z" />
          <path
            d="M32 33s-9-5-9-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 11-9 11Z"
            fill="currentColor"
            stroke="none"
          />
          <path d="M21 55c7 2 15 2 22 0" opacity=".45" />
        </>
      )}
      {name === "audio" && (
        <>
          <rect
            x="19"
            y="7"
            width="26"
            height="39"
            rx="13"
            fill="var(--icon-wash,#f9dbe7)"
            stroke="none"
          />
          <rect x="25" y="7" width="14" height="32" rx="7" />
          <path d="M17 28v5a15 15 0 0 0 30 0v-5M32 48v9m-9 0h18M8 25v10m48-10v10M29 18h6m-6 6h6" />
          <path d="M22 51c-5-2-9-6-10-11" opacity=".45" />
        </>
      )}
      {name === "connection" && (
        <>
          <path
            d="M32 6C19 6 9 16 9 29c0 13 10 23 23 23s23-10 23-23C55 16 45 6 32 6Z"
            fill="var(--icon-wash,#f9dbe7)"
            stroke="none"
          />
          {heart}
          <circle cx="12" cy="43" r="5" fill="var(--icon-paper,#fff9fc)" />
          <circle cx="52" cy="43" r="5" fill="var(--icon-paper,#fff9fc)" />
          <path d="M3 58c0-6 3-9 9-9s9 3 9 9m22 0c0-6 3-9 9-9s9 3 9 9M10 28a22 22 0 0 1 44 0M26 52c4 1 8 1 12 0" />
        </>
      )}
      {name === "safety" && (
        <>
          <path
            d="M32 5C22 13 13 15 8 16c0 20 7 33 24 43 17-10 24-23 24-43-5-1-14-3-24-11Z"
            fill="var(--icon-wash,#f9dbe7)"
          />
          <path d="m22 31 7 7 14-15" strokeWidth="3" />
          <path d="M15 35c3 8 8 14 17 20" opacity=".45" />
        </>
      )}
      {name === "innovation" && (
        <>
          <path
            d="M32 5c3 17 10 24 27 27-17 3-24 10-27 27C29 42 22 35 5 32 22 29 29 22 32 5Z"
            fill="var(--icon-wash,#f9dbe7)"
            stroke="none"
          />
          <path d="M32 15c3 9 8 14 17 17-9 3-14 8-17 17-3-9-8-14-17-17 9-3 14-8 17-17Z" />
          <circle cx="32" cy="32" r="4" fill="currentColor" stroke="none" />
          <path
            d="m48 9 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z"
            fill="currentColor"
            stroke="none"
          />
        </>
      )}
      {name === "care" && (
        <>
          <path
            d="M32 47S9 34 9 20c0-13 17-18 23-7 6-11 23-6 23 7 0 14-23 27-23 27Z"
            fill="var(--icon-wash,#f9dbe7)"
          />
          <path
            d="M10 39c2 10 11 18 22 20 8-2 15-7 19-13M20 19c-5 9 8 16 17 17 6 1 11 0 15-3"
            opacity=".6"
          />
        </>
      )}
      {name === "touch" && (
        <>
          <circle
            cx="26"
            cy="21"
            r="17"
            fill="var(--icon-wash,#f9dbe7)"
            stroke="none"
          />
          <path d="M21 36V21a5 5 0 0 1 10 0v16-5a4 4 0 0 1 8 0v3a4 4 0 0 1 8 0v3a4 4 0 0 1 8 0v5c0 9-6 15-14 15h-8c-7 0-10-3-14-8l-8-9a5 5 0 0 1 7-7l7 7M11 22a15 15 0 1 1 30-3" />
        </>
      )}
    </svg>
  );
}
