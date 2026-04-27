import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';

export default async function HomeInquiryCta({ locale }: { locale: string }) {
  const t = await getTranslations('home');

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-r from-primary-700 to-accent-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-white/90 mb-2">
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">{t('inquiryBadge')}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{t('inquiryTitle')}</h2>
          <p className="text-white/90 max-w-xl">{t('inquiryBody')}</p>
        </div>
        <Link
          href={`/${locale}/my/inquiries`}
          className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-primary-700 dark:text-primary-300 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          {t('inquiryCta')}
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
