import { redirect } from "next/navigation";

export default async function MyRoadmapRedirect({
  params,
}: {
  params: { locale: string } | Promise<{ locale: string }>;
}) {
  const { locale } = await Promise.resolve(params);
  redirect(`/${locale}/my/dashboard`);
}
