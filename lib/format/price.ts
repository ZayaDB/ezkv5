/** 멘토 시급: DB는 원화(₩) 기준. 레거시 mock처럼 작은 숫자는 USD로 간주해 환산 */
export function formatMentorHourlyPrice(price: number | 'Free'): { label: string; suffix?: string } {
  if (price === 'Free') return { label: '무료' };
  if (typeof price === 'number' && price >= 5000) {
    return { label: `₩${price.toLocaleString('ko-KR')}`, suffix: '/시간' };
  }
  const krw = Math.round(Number(price) * 1300);
  return { label: `₩${krw.toLocaleString('ko-KR')}`, suffix: '/시간' };
}
