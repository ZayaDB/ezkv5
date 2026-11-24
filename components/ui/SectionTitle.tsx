export default function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="text-xl font-extrabold tracking-[-0.02em] text-brand-ink">{title}</h2>
      {description ? <p className="text-sm text-brand-soft mt-1">{description}</p> : null}
    </div>
  );
}
