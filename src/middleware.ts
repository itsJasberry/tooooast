import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

const locales = ["pl", "en"];
const defaultLocale = "pl";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export default function middleware(request: NextRequest) {
  const existingLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const pathname = request.nextUrl.pathname;

  // Jeśli lokalizacja już ustalona - pomiń detekcję
  if (!existingLocale) {
    let detectedLocale = defaultLocale;

    // 1. Detekcja geolokalizacji
    const country = request.geo?.country?.toLowerCase();
    if (country === "pl") {
      detectedLocale = "pl";
    }
    // 2. Jeśli nie PL - sprawdź język przeglądarki
    else {
      const acceptLanguage = request.headers.get("Accept-Language");
      const preferredLang = acceptLanguage?.split(",")[0]?.split("-")[0];
      detectedLocale = preferredLang === "pl" ? "pl" : "en";
    }

    // 3. Przekieruj i zapisz w ciasteczku
    if (detectedLocale !== defaultLocale || pathname !== "/") {
      const response = NextResponse.redirect(
        new URL(`/${detectedLocale}${pathname}`, request.url)
      );
      response.cookies.set("NEXT_LOCALE", detectedLocale);
      return response;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
