import { NextRequest, NextResponse } from "next/server";

// Host-based routing for production domains.
// clinaxy.ai        -> marketing site (/, /pricing)
// app.clinaxy.ai    -> product app (login, signup, dashboard, modules)
// clinaxy.com/*     -> permanent redirect to the .ai equivalent (defense in
//                      depth; Vercel's domain-level redirect handles it first)
// localhost and *.vercel.app previews are untouched so dev and preview
// deployments keep serving every route.

const MARKETING_HOST = "clinaxy.ai";
const APP_HOST = "app.clinaxy.ai";

const APP_ROUTES = [
    "/login",
    "/signup",
    "/dashboard",
    "/scribe",
    "/triage",
    "/voice-agent",
    "/chat",
    "/patients",
];

function isAppRoute(pathname: string) {
    return APP_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
}

export default function proxy(request: NextRequest) {
    // Strip any port so localhost:3000 style hosts compare cleanly.
    const host = (request.headers.get("host") ?? "").toLowerCase().split(":")[0];
    const { pathname, search } = request.nextUrl;

    // Any clinaxy.com host falls back to the canonical .ai domains.
    if (host === "clinaxy.com" || host.endsWith(".clinaxy.com")) {
        const target = isAppRoute(pathname) ? APP_HOST : MARKETING_HOST;
        return NextResponse.redirect(`https://${target}${pathname}${search}`, 308);
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
        if (pathname === "/") {
            return NextResponse.redirect(`https://${APP_HOST}/dashboard`, 307);
        }
        if (!isAppRoute(pathname)) {
            return NextResponse.redirect(
                `https://${MARKETING_HOST}${pathname}${search}`,
                308
            );
        }
        return NextResponse.next();
    }

    if (host === MARKETING_HOST && isAppRoute(pathname)) {
        return NextResponse.redirect(
            `https://${APP_HOST}${pathname}${search}`,
            308
        );
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
