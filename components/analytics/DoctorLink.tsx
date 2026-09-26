"use client";

import type { AnalyticsEventName } from "@/lib/analytics";

// Outbound link that reports its click via beacon WITHOUT blocking navigation.
export default function DoctorLink({
  href,
  event = "doctor_site_click",
  eventProps,
  className,
  children,
}: {
  href: string;
  event?: AnalyticsEventName;
  eventProps?: Record<string, string | number | boolean | null>;
  className?: string;
  children: React.ReactNode;
}) {
  function onClick() {
    try {
      const payload = JSON.stringify({ event, props: eventProps ?? {} });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      /* never block navigation */
    }
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
      {children}
    </a>
  );
}
