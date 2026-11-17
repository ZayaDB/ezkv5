import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import VisaHubClient from "./VisaHubClient";

export default async function VisaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // ?to=E-7 같은 값은 클라이언트에서 읽어 이 페이지가 캐시될 수 있게 함
  return (
    <Suspense fallback={null}>
      <VisaHubClient locale={locale} />
    </Suspense>
  );
}
