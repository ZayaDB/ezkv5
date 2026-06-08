"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Circle, Loader2, Plus } from "lucide-react";
import { roadmapsApi } from "@/lib/api/client";
import { useRouteGuard } from "@/lib/hooks/useRouteGuard";

export default function RoadmapPage() {
  const t = useTranslations("roadmap");
  const locale = useLocale();
  const { allowed, loading: guardLoading } = useRouteGuard({ requireAuth: true, locale });
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);

  const load = async () => {
    const res = await roadmapsApi.list("all");
    if (res.data) {
      setRoadmaps(res.data.roadmaps || []);
      setTemplates(res.data.templates || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (allowed) void load();
  }, [allowed]);

  const createFromTemplate = async (key: string) => {
    setCreating(key);
    await roadmapsApi.create({ templateKey: key });
    await load();
    setCreating(null);
  };

  const toggleStep = async (roadmapId: string, stepId: string, completed: boolean) => {
    await roadmapsApi.completeStep(roadmapId, stepId, !completed);
    await load();
  };

  if (guardLoading || !allowed) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t("subtitle")}</p>

      <section className="mt-8">
        <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">{t("templates")}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {templates.map((tpl) => (
            <button
              key={tpl.key}
              type="button"
              disabled={creating === tpl.key}
              onClick={() => createFromTemplate(tpl.key)}
              className="text-left rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:border-primary-400 transition-colors disabled:opacity-50"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-900 dark:text-white">{tpl.title}</p>
                {creating === tpl.key ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                ) : (
                  <Plus className="w-4 h-4 text-primary-500 shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{tpl.description}</p>
              <p className="text-xs text-primary-600 mt-2">{tpl.stepCount} {t("steps")}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 space-y-6">
        <h2 className="text-sm font-bold text-gray-700 dark:text-slate-300">{t("myRoadmaps")}</h2>
        {loading ? (
          <div className="animate-pulse h-32 rounded-xl bg-gray-100 dark:bg-slate-800" />
        ) : roadmaps.length === 0 ? (
          <p className="text-sm text-gray-500">{t("empty")}</p>
        ) : (
          roadmaps.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 dark:text-white">{r.title}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-primary-100 text-primary-700"
                    }`}
                  >
                    {r.progress}%
                  </span>
                </div>
                {r.description && (
                  <p className="text-sm text-gray-500 mt-1">{r.description}</p>
                )}
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                {(r.steps || []).map((step: any) => (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => toggleStep(r.id, step.id, step.completed)}
                      className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle
                          className={`w-5 h-5 shrink-0 mt-0.5 ${
                            step.active ? "text-primary-500" : "text-gray-300"
                          }`}
                        />
                      )}
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            step.completed
                              ? "line-through text-gray-400"
                              : "text-gray-800 dark:text-slate-100"
                          }`}
                        >
                          {step.title}
                        </p>
                        {step.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
