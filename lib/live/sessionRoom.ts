/** 1:1 상담방은 시작 10분 전부터, 끝난 뒤 30분까지 열린다 (서버·클라이언트 공용) */
export const SESSION_ROOM_EARLY_MINUTES = 10;
export const SESSION_ROOM_GRACE_MINUTES = 30;

export function sessionRoomWindow(scheduledAt: string, duration: number) {
  const start = new Date(scheduledAt).getTime();
  return {
    opens: start - SESSION_ROOM_EARLY_MINUTES * 60_000,
    closes: start + ((duration || 60) + SESSION_ROOM_GRACE_MINUTES) * 60_000,
  };
}
