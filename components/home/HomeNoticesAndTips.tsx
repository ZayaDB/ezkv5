import { getTranslations } from 'next-intl/server';
import { Calendar, HelpCircle } from 'lucide-react';

export default async function HomeNoticesAndTips() {
  const t = await getTranslations('home');

  return (
    <section className="py-16 sm:py-20 bg-slate-50/60 dark:bg-slate-950 border-t border-gray-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t('noticesTitle')}</h2>
            </div>
            <ul className="space-y-4">
              <li className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-medium text-gray-400 dark:text-slate-500 shrink-0 tabular-nums">{t('notice1Date')}</span>
                <p className="text-gray-800 dark:text-slate-200 text-sm leading-relaxed">{t('notice1Body')}</p>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-medium text-gray-400 dark:text-slate-500 shrink-0 tabular-nums">{t('notice2Date')}</span>
                <p className="text-gray-800 dark:text-slate-200 text-sm leading-relaxed">{t('notice2Body')}</p>
              </li>
              <li className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-medium text-gray-400 dark:text-slate-500 shrink-0 tabular-nums">{t('notice3Date')}</span>
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
