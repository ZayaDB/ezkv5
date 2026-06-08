import { redirect } from "next/navigation";

type Props = { params: { locale: string } };

export default function CalendarPage({ params }: Props) {
  redirect(`/${params.locale}/my/schedule`);
}
