"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  Globe,
  Sun,
  Moon,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  ChevronDown,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { useState, useEffect } from "react";
import { locales } from "@/lib/i18n/config";
import { useAuth } from "@/lib/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const hasDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");
    setTheme(hasDark ? "dark" : "light");
  }, []);

  const getLocalizedPath = (path: string) => {
    return `/${locale}${path}`;
  };

  const switchLanguage = (newLocale: string) => {
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(`/${locale}`, "");
    window.location.href = `/${newLocale}${pathWithoutLocale}`;
  };

  const localeMeta: Record<string, { label: string; flag: string }> = {
    kr: { label: "한국어", flag: "/flag/korea.jpg" },
    en: { label: "English", flag: "/flag/United-kingdom.png" },
    mn: { label: "Монгол", flag: "/flag/mongolia.jpg" },
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark");
    }
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!pathname) return;
    const q = new URLSearchParams(window.location.search).get("q") || "";
    setSearchQuery(q);
  }, [pathname]);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(`/${locale}/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/54 dark:bg-slate-900/85 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/70 fixed top-0 inset-x-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto  lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={getLocalizedPath("")} className="flex items-center group">
            <div className="">
              <Image
                src="/logo/logo.png"
                alt="logo"
                width={44}
                height={44}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href={getLocalizedPath("/mentors")}
              className="text-gray-600 dark:text-slate-200 hover:text-primary-500 transition-colors"
            >
              {t("mentors")}
            </Link>
            <Link
              href={getLocalizedPath("/lectures")}
              className="text-gray-600 dark:text-slate-200 hover:text-primary-500 transition-colors"
            >
              {t("lectures")}
            </Link>
            <Link
              href={getLocalizedPath("/community")}
              className="text-gray-600 dark:text-slate-200 hover:text-primary-500 transition-colors"
            >
              {t("community")}
            </Link>
            <Link
              href={getLocalizedPath("/freelancers")}
              className="text-gray-600 dark:text-slate-200 hover:text-primary-500 transition-colors"
            >
              {t("freelancers")}
            </Link>
            <Link
              href={getLocalizedPath("/study-in-korea")}
              className="text-gray-600 dark:text-slate-200 hover:text-primary-500 transition-colors"
            >
              {t("studyInKorea")}
            </Link>
          </div>

          <form
            onSubmit={onSubmitSearch}
            className="hidden lg:flex items-center w-72 xl:w-80"
          >
            <label className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search")}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-500/30"
              />
            </label>
          </form>

          {/* Right side actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              type="button"
              onClick={toggleTheme}
              role="switch"
              aria-checked={theme === "dark"}
              aria-label={theme === "dark" ? "라이트 모드" : "다크 모드"}
              title={theme === "dark" ? "라이트 모드" : "다크 모드"}
              className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-primary-300 transition-colors"
            >
              <span
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  theme === "dark" ? "bg-primary-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform ${
                    theme === "dark" ? "translate-x-5" : "translate-x-0"
                  }`}
                >
                  {theme === "dark" ? (
                    <Moon className="w-3 h-3 text-primary-600" />
                  ) : (
                    <Sun className="w-3 h-3 text-amber-500" />
                  )}
                </span>
              </span>
            </button>
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="flex items-center space-x-1 text-gray-600 dark:text-slate-200 hover:text-primary-500 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <div className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-gray-200">
                  <Image
                    src={localeMeta[locale]?.flag || "/flag/korea.jpg"}
                    alt={localeMeta[locale]?.label || "language"}
                    width={20}
                    height={20}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-medium">
                  {localeMeta[locale]?.label || locale.toUpperCase()}
                </span>
              </button>
              {languageMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setLanguageMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-20">
                    {locales.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          switchLanguage(loc);
                          setLanguageMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                          locale === loc
                            ? "text-primary-500 font-medium"
                            : "text-gray-600 dark:text-slate-200"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full overflow-hidden ring-1 ring-gray-200">
                            <Image
                              src={localeMeta[loc]?.flag || "/flag/korea.jpg"}
                              alt={localeMeta[loc]?.label || loc}
                              width={20}
                              height={20}
                              className="w-full h-full object-cover"
                            />
                          </span>
                          <span>
                            {localeMeta[loc]?.label || loc.toUpperCase()}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover shadow-md ring-1 ring-gray-200 group-hover:shadow-lg transition-shadow"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-shadow">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {user?.name || "User"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {user?.email || ""}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 dark:text-slate-400 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                        <div className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                          {user?.name || "User"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 truncate">
                          {user?.email || ""}
                        </div>
                      </div>

                      {user?.role === "admin" && (
                        <>
                          <Link
                            href={getLocalizedPath("/admin/dashboard")}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4" />
                            <span>{t("adminDashboard")}</span>
                          </Link>
                          <Link
                            href={getLocalizedPath("/admin/moderation")}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>{t("adminModerationQueue")}</span>
                          </Link>
                        </>
                      )}
                      {user?.role !== "admin" && (
                        <Link
                          href={getLocalizedPath("/my/dashboard")}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>{t("dashboard")}</span>
                        </Link>
                      )}
                      <Link
                        href={getLocalizedPath("/my/profile?tab=info")}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>{t("profile")}</span>
                      </Link>
                      <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500">
                        {t("myActivity")}
                      </div>
                      <Link
                        href={getLocalizedPath("/my/courses")}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span>{t("myEnrollments")}</span>
                      </Link>
                      <Link
                        href={getLocalizedPath("/my/wishlist")}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span>찜한 강의</span>
                      </Link>
                      <Link
                        href={getLocalizedPath("/my/sessions")}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span>{t("mySessions")}</span>
                      </Link>
                      <Link
                        href={getLocalizedPath("/my/community")}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span>{t("myCommunity")}</span>
                      </Link>
                      <Link
                        href={getLocalizedPath("/my/freelancers")}
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span>{t("myFreelancers")}</span>
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          window.location.href = getLocalizedPath("/login");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("logout")}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href={getLocalizedPath("/login")}
                  className="text-gray-600 hover:text-primary-500 transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  href={getLocalizedPath("/signup")}
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t("signup")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 dark:text-slate-200"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex flex-col space-y-4">
              <form onSubmit={onSubmitSearch} className="w-full">
                <label className="relative block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("search")}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-500/30"
                  />
                </label>
              </form>
              <button
                type="button"
                onClick={toggleTheme}
                role="switch"
                aria-checked={theme === "dark"}
                className="inline-flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 px-3 py-2"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {theme === "dark" ? "다크 모드" : "라이트 모드"}
                </span>
                <span
                  className={`ml-3 relative w-11 h-6 rounded-full transition-colors ${
                    theme === "dark" ? "bg-primary-500" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform ${
                      theme === "dark" ? "translate-x-5" : "translate-x-0"
                    }`}
                  >
                    {theme === "dark" ? (
                      <Moon className="w-3 h-3 text-primary-600" />
                    ) : (
                      <Sun className="w-3 h-3 text-amber-500" />
                    )}
                  </span>
                </span>
              </button>
              <Link
                href={getLocalizedPath("/mentors")}
                className="text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("mentors")}
              </Link>
              <Link
                href={getLocalizedPath("/lectures")}
                className="text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("lectures")}
              </Link>
              <Link
                href={getLocalizedPath("/community")}
                className="text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("community")}
              </Link>
              <Link
                href={getLocalizedPath("/freelancers")}
                className="text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("freelancers")}
              </Link>
              <Link
                href={getLocalizedPath("/study-in-korea")}
                className="text-gray-600 hover:text-primary-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("studyInKorea")}
              </Link>

              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3 mb-4 px-2">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name || "User"}
                        className="w-12 h-12 rounded-full object-cover shadow-md ring-1 ring-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {user?.name || "User"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user?.email || ""}
                      </div>
                    </div>
                  </div>

                  {user?.role === "admin" && (
                    <>
                      <Link
                        href={getLocalizedPath("/admin/dashboard")}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="w-5 h-5" />
                        <span>{t("adminDashboard")}</span>
                      </Link>
                      <Link
                        href={getLocalizedPath("/admin/moderation")}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <ShieldCheck className="w-5 h-5" />
                        <span>{t("adminModerationQueue")}</span>
                      </Link>
                    </>
                  )}
                  {user?.role !== "admin" && (
                    <Link
                      href={getLocalizedPath("/my/dashboard")}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>{t("dashboard")}</span>
                    </Link>
                  )}
                  <Link
                    href={getLocalizedPath("/my/profile?tab=info")}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>{t("profile")}</span>
                  </Link>
                  <div className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500">
                    {t("myActivity")}
                  </div>
                  <Link
                    href={getLocalizedPath("/my/courses")}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{t("myEnrollments")}</span>
                  </Link>
                  <Link
                    href={getLocalizedPath("/my/wishlist")}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>찜한 강의</span>
                  </Link>
                  <Link
                    href={getLocalizedPath("/my/sessions")}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{t("mySessions")}</span>
                  </Link>
                  <Link
                    href={getLocalizedPath("/my/community")}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{t("myCommunity")}</span>
                  </Link>
                  <Link
                    href={getLocalizedPath("/my/freelancers")}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{t("myFreelancers")}</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      window.location.href = getLocalizedPath("/login");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t("logout")}</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href={getLocalizedPath("/login")}
                    className="text-gray-600 hover:text-primary-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("login")}
                  </Link>
                  <Link
                    href={getLocalizedPath("/signup")}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("signup")}
                  </Link>
                </>
              )}

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                <Globe className="w-5 h-5 text-gray-600" />
                {locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      switchLanguage(loc);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded ${
                      locale === loc
                        ? "bg-primary-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full overflow-hidden">
                        <Image
                          src={localeMeta[loc]?.flag || "/flag/korea.jpg"}
                          alt={localeMeta[loc]?.label || loc}
                          width={16}
                          height={16}
                          className="w-full h-full object-cover"
                        />
                      </span>
                      <span>{loc.toUpperCase()}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
