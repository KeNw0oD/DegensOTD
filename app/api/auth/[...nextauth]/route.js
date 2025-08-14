import NextAuth from "next-auth";

/**
 * Kick OAuth provider for NextAuth (OAuth 2.1, без OIDC).
 * Требует в .env:
 * - NEXTAUTH_URL=http://localhost:3000
 * - NEXTAUTH_SECRET=... (любой сильный секрет)
 * - KICK_CLIENT_ID=...
 * - KICK_CLIENT_SECRET=...
 */
function KickProvider() {
  return {
    id: "kick",
    name: "Kick",
    type: "oauth",
    version: "2.0",
    // отключаем OIDC discovery — у Kick нет /userinfo
    wellKnown: null,
    checks: ["pkce", "state"],
    authorization: {
      url: "https://id.kick.com/oauth/authorize",
      params: {
        scope: "user:read",
        response_type: "code",
        code_challenge_method: "S256",
      },
    },
    // Можно оставить просто строкой, но ниже кастомный request ради логов
    token: {
      url: "https://id.kick.com/oauth/token",
      async request(context) {
        const { code } = context.params ?? {};
        const code_verifier = context.checks?.code_verifier;
        const redirect_uri = context.provider?.callbackUrl;

        const payload = {
          client_id: process.env.KICK_CLIENT_ID,
          client_secret: process.env.KICK_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          code_verifier,
          redirect_uri,
        };

        console.log("TOKEN REQUEST DATA", payload);

        const res = await fetch("https://id.kick.com/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(payload),
        });

        const raw = await res.text();
        console.log("TOKEN STATUS:", res.status);
        console.log("TOKEN RAW:", raw);

        let json;
        try { json = JSON.parse(raw); } catch {}
        if (!res.ok || !json) {
          throw new Error(`Kick token error (${res.status}): ${raw || "no JSON"}`);
        }
        return { tokens: json };
      },
    },

    /**
     * Вместо OIDC /userinfo тянем профиль через публичный API Kick:
     * GET https://api.kick.com/public/v1/users
     * (текущий пользователь определяется по access_token)
     */
    userinfo: {
      async request({ tokens }) {
        console.log("FETCHING PROFILE with access_token:", tokens?.access_token ? "[present]" : "[missing]");

        const res = await fetch("https://api.kick.com/public/v1/users", {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            Accept: "application/json",
          },
        });

        const raw = await res.text();
        console.log("USER RAW:", raw);

        let json;
        try { json = JSON.parse(raw); } catch { json = {}; }

        const u = json?.data?.[0] || {};
        return {
          id: u.user_id ?? "",
          name: u.name ?? null,
          email: u.email ?? null,
          image: u.profile_picture ?? null,
        };
      },
    },

    /**
     * Приводим профиль к формату NextAuth
     */
    profile(profile) {
      return {
        id: String(profile.id || ""),
        name: profile.name || null,
        email: profile.email || null,
        image: profile.image || null,
      };
    },

    clientId: process.env.KICK_CLIENT_ID,
    clientSecret: process.env.KICK_CLIENT_SECRET,
    // callbackUrl выставляется NextAuth автоматически из NEXTAUTH_URL + маршрут
  };
}

const handler = NextAuth({
  providers: [KickProvider()],
  session: { strategy: "jwt" },
  debug: true,

  events: {
    error(message) {
      console.error("NextAuth error:", message);
    },
  },

  callbacks: {
    async session({ session, token }) {
      // гарантируем наличие session.user
      session.user = session.user || {};
      session.user.id = token?.sub || null;
      return session;
    },
  },
});

export async function GET(req, ctx) {
  console.log("AUTH GET:", req.nextUrl.pathname, req.nextUrl.search);
  return handler(req, ctx);
}
export async function POST(req, ctx) {
  console.log("AUTH POST:", req.nextUrl.pathname, req.nextUrl.search);
  return handler(req, ctx);
}
