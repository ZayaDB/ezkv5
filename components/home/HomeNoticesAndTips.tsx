import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Calendar, HelpCircle, Megaphone, ArrowRight } from 'lucide-react';

export default async function HomeNoticesAndTips() {
  const t = await getTranslations('home');

  return (
    <section className="py-16 sm:py-20 bg-slate-50/60 dark:bg-slate-950 border-t border-gray-200/60 dark:border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t('noticesTitle')}</h2>
              </div>
              <Link
                href="#"
                className="inline-flex items-center text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                {t('noticeViewAll')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <ul className="space-y-4">
              <li className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:w-28 shrink-0 gap-1">
                  <span className="inline-flex items-center justify-center rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold px-2 py-0.5 w-fit">
                    {t('noticeTagImportant')}
                  </span>
                  <span className="inline-flex items-center text-xs font-medium text-gray-400 dark:text-slate-500 tabular-nums">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {t('notice1Date')}
                  </span>
                </div>
                <p className="text-gray-800 dark:text-slate-200 text-sm leading-relaxed">{t('notice1Body')}</p>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:w-28 shrink-0 gap-1">
                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-[11px] font-semibold px-2 py-0.5 w-fit">
                    {t('noticeTagPolicy')}
                  </span>
                  <span className="inline-flex items-center text-xs font-medium text-gray-400 dark:text-slate-500 tabular-nums">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {t('notice2Date')}
                  </span>
                </div>
                <p className="text-gray-800 dark:text-slate-200 text-sm leading-relaxed">{t('notice2Body')}</p>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shadow-sm">
                <div className="flex flex-col sm:w-28 shrink-0 gap-1">
                  <span className="inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold px-2 py-0.5 w-fit">
                    {t('noticeTagMaintenance')}
                  </span>
                  <span className="inline-flex items-center text-xs font-medium text-gray-400 dark:text-slate-500 tabular-nums">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {t('notice3Date')}
                  </span>
                </div>
                <p className="text-gray-800 dark:text-slate-200 text-sm leading-relaxed">{t('notice3Body')}</p>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-6 h-6 text-accent-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t('tipsTitle')}</h2>
            </div>
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{t('tip1Title')}</h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">{t('tip1Body')}</p>
              </div>
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{t('tip2Title')}</h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">{t('tip2Body')}</p>
              </div>
              <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{t('tip3Title')}</h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">{t('tip3Body')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
