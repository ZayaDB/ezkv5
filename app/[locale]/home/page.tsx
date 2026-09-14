import { redirect } from "next/navigation";

export default async function LegacyHomeRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/my/dashboard`);
}
