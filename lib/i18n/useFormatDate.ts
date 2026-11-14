"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { formatDate, type DateOpts } from "./dateFormat";

/** next-intl 의 fmt.dateTime 대신 사용: 'kr'/'mn' 로케일을 올바르게 처리한다 */
export function useFormatDate() {
  const locale = useLocale();
  return useCallback((value: Date | string | number, opts?: DateOpts) => formatDate(value, locale, opts), [locale]);
}
