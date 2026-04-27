export default function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      {description ? <p className="text-sm text-slate-600 mt-1">{description}</p> : null}
    </div>
  );
}
