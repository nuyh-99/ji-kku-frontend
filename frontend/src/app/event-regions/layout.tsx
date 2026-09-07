// app/event-regions/layout.tsx
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function EventRegionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}