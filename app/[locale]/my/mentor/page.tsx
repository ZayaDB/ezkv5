'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

/** 예전 '멘토 센터' 주소(알림 링크 등): 멘토 모드로 바꾸고 개요의 예약 섹션으로 보낸다 */
export default function MentorCenterRedirect() {
  const router = useRouter();
  const locale = useLocale();
  useEffect(() => {
    try {
      localStorage.setItem('dashboard_mode', 'mentor');
      window.dispatchEvent(new Event('dashboard-mode-changed'));
    } catch {
      /* ignore */
    }
    router.replace(`/${locale}/my/dashboard#bookings`);
  }, [router, locale]);
  return null;
}
