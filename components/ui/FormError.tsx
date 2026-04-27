export default function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600 mt-1">{message}</p>;
}
