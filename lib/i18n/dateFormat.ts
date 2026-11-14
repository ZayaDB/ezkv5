import { intlLocale } from "./config";

/**
 * 날짜 포맷.
 * - kr: 앱 로케일 코드가 'kr'이라 Intl에는 'ko-KR'로 넘긴다 ('kr'을 그대로 넘기면 영어로 나온다).
 * - mn: Chrome 등 많은 브라우저에 몽골어 날짜 데이터가 없어 영어로 나오므로 직접 만든다
 *   (서버 렌더링과 결과가 어긋나지 않도록 항상 직접 만든다).
 */
export type DateOpts = Intl.DateTimeFormatOptions;

const MN_WEEKDAY_LONG = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];
const MN_WEEKDAY_SHORT = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** 표시 시간대는 브라우저 시간대를 따른다 (Intl 기본 동작과 동일) */
function formatMn(d: Date, o: DateOpts): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const wd = d.getDay();
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const parts: string[] = [];

  if (o.dateStyle) {
    if (o.dateStyle === "short") parts.push(`${y}.${pad(m)}.${pad(day)}`);
    else if (o.dateStyle === "medium") parts.push(`${y} оны ${m}-р сарын ${day}`);
    else parts.push(`${y} оны ${m}-р сарын ${day}, ${MN_WEEKDAY_LONG[wd]}`);
  } else {
    const hasDay = !!o.day;
    const hasMonth = !!o.month;
    const hasYear = !!o.year;
    const dateBits: string[] = [];
    if (hasYear) dateBits.push(`${y} оны`);
    if (hasMonth && hasDay) dateBits.push(`${m}-р сарын ${day}`);
    else if (hasMonth) dateBits.push(`${m}-р сар`);
    else if (hasDay) dateBits.push(String(day));
    const dateStr = dateBits.join(" ");
    if (o.weekday) {
      const w = o.weekday === "long" ? MN_WEEKDAY_LONG[wd] : MN_WEEKDAY_SHORT[wd];
      parts.push(dateStr ? `${dateStr}, ${w}` : w);
    } else if (dateStr) {
      parts.push(dateStr);
    }
  }

  if (o.timeStyle || o.hour || o.minute) parts.push(time);
  return parts.join(" ");
}

export function formatDate(value: Date | string | number, locale: string, opts: DateOpts = { dateStyle: "medium" }): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  // 서버(Node)와 브라우저의 결과가 같도록 몽골어는 항상 직접 포맷한다
  if (locale === "mn") return formatMn(d, opts);
  return new Intl.DateTimeFormat(intlLocale(locale), opts).format(d);
}
