"use client";

import { useEffect } from "react";
import { RealtimeKitProvider, useRealtimeKitClient } from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";

/**
 * Cloudflare RealtimeKit meeting UI. Loaded client-side only (see dynamic import in the lesson page).
 * Branding (LNK teal, dark) comes from the participant's preset.
 */
export default function LiveClassroom({
  token,
  onLeft,
}: {
  token: string;
  onLeft?: () => void;
}) {
  const [meeting, initMeeting] = useRealtimeKitClient();

  useEffect(() => {
    void initMeeting({ authToken: token, defaults: { audio: false, video: false } });
  }, [token, initMeeting]);

  useEffect(() => {
    if (!meeting || !onLeft) return;
    const handler = () => onLeft();
    meeting.self.on("roomLeft", handler);
    return () => {
      meeting.self.off("roomLeft", handler);
    };
  }, [meeting, onLeft]);

  return (
    <RealtimeKitProvider value={meeting} fallback={<div className="h-full w-full animate-pulse bg-[#0e1a18]" />}>
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#0b1513]">
        <RtkMeeting meeting={meeting} mode="fill" showSetupScreen leaveOnUnmount />
      </div>
    </RealtimeKitProvider>
  );
}
