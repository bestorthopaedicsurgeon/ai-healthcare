import { NextRequest, NextResponse } from "next/server";

// Host-based routing for production domains.
// clinaxy.ai        -> marketing site (/, /pricing)
// app.clinaxy.ai    -> product app (everything else: auth, dashboard, modules)
// clinaxy.com/*     -> permanent redirect to clinaxy.ai (defense in depth;
//                      Vercel's domain-level redirect handles it first)
// localhost and *.vercel.app previews are untouched so dev and preview
// deployments keep serving every route.
//
// Marketing routes are the allowlist (they change rarely and deliberately);
// every other route is assumed to belong to the app, so new app pages work
// on app.clinaxy.ai without touching this file.

const MARKETING_HOST = "clinaxy.ai";
const APP_HOST = "app.clinaxy.ai";

const MARKETING_ROUTES = ["/", "/pricing"];

function isMarketingRoute(pathname: string) {
    return MARKETING_ROUTES.some(
        (route) =>
            pathname === route ||
            (route !== "/" && pathname.startsWith(`${route}/`))
    );
}

export default function proxy(request: NextRequest) {
    // Strip any port so localhost:3000 style hosts compare cleanly.
    const host = (request.headers.get("host") ?? "").toLowerCase().split(":")[0];
    const { pathname, search } = request.nextUrl;

    // Any clinaxy.com host falls back to the canonical marketing domain,
    // which forwards app paths on to app.clinaxy.ai itself.
    if (host === "clinaxy.com" || host.endsWith(".clinaxy.com")) {
        return NextResponse.redirect(
            `https://${MARKETING_HOST}${pathname}${search}`,
            308
        );
    }

    // Canonicalize www to the apex.
    if (host === `www.${MARKETING_HOST}`) {
        return NextResponse.redirect(
            `https://${MARKETING_HOST}${pathname}${search}`,
            308
        );
    }

    if (host === APP_HOST) {
        // The app subdomain must stay out of search indexes; this shadows
        // app/robots.ts, which only applies to the marketing domain.
        if (pathname === "/robots.txt") {
            return new NextResponse("User-agent: *\nDisallow: /\n", {
                headers: { "content-type": "text/plain" },
            });
        }
        // The sitemap belongs to the marketing domain only.
        if (pathname === "/sitemap.xml") {
            return NextResponse.redirect(
                `https://${MARKETING_HOST}/sitemap.xml`,
                308
            );
        }
        if (pathname === "/") {
            return NextResponse.redirect(`https://${APP_HOST}/dashboard`, 307);
        }
        if (isMarketingRoute(pathname)) {
            return NextResponse.redirect(
                `https://${MARKETING_HOST}${pathname}${search}`,
                308
            );
        }
        return NextResponse.next();
    }

    if (host === MARKETING_HOST) {
        if (pathname === "/robots.txt" || pathname === "/sitemap.xml") {
            return NextResponse.next();
        }
        if (!isMarketingRoute(pathname)) {
            return NextResponse.redirect(
                `https://${APP_HOST}${pathname}${search}`,
                308
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next internals and static assets (any path containing a dot)...
        "/((?!_next/|api/|.*\\..*).*)",
        // ...but robots.txt and sitemap.xml are host-dependent, so opt them in.
        "/robots.txt",
        "/sitemap.xml",
    ],
};
