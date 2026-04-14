import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./lib/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const parts = pathname.split("/").filter(Boolean);
  const locale = parts[0];
  const page = parts[1];

  if (parts.length === 2 && locales.includes(locale as (typeof locales)[number])) {
    if (page === "dashboard" || page === "profile") {
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/my/${page}`;
      url.search = search;
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};



