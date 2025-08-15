import NextAuth from "next-auth";
import { createClient } from "@supabase/supabase-js";

/**
 * Kick OAuth provider
 */
function KickProvider() {
  return {
    id: "kick",
    name: "Kick",
    type: "oauth",
    version: "2.0",
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

        const res = await fetch("https://id.kick.com/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(payload),
        });

        const raw = await res.text();
        let json;
        try {
          json = JSON.parse(raw);
        } catch {}
        if (!res.ok || !json) {
          throw new Error(`Kick token error (${res.status}): ${raw || "no JSON"}`);
        }
        return { tokens: json };
      },
    },
    userinfo: {
      async request({ tokens }) {
        const res = await fetch("https://api.kick.com/public/v1/users", {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            Accept: "application/json",
          },
        });

        const raw = await res.text();
        let json;
        try {
          json = JSON.parse(raw);
        } catch {
          json = {};
        }
        const u = json?.data?.[0] || {};

        return {
          id: u.user_id ?? "",
          name: u.name ?? null,
          email: u.email ?? null,
          image: u.profile_picture ?? null,
        };
      },
    },
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
  };
}

// Supabase client (service key for writes)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const handler = NextAuth({
  providers: [KickProvider()],
  session: { strategy: "jwt" },
  debug: true,

  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "kick") {
        const email = user.email?.trim().toLowerCase() || null;
        const kickId = user.id;

        // 1. Если есть email — проверяем в базе
        if (email) {
          const { data: existing } = await supabase
            .from("users")
            .select("password_hash")
            .eq("email", email)
            .maybeSingle();

          if (existing?.password_hash) {
            console.warn(`Kick login blocked: ${email} already used by password account`);
            // Редиректим сразу на наш сайт с query параметром
            return `/?error=EMAIL_EXISTS`;
          } 
        }

        // 2. Сохраняем или обновляем пользователя
        const { error } = await supabase.from("users").upsert(
          {
            email,
            kick_id: kickId,
            nickname: user.name,
            is_verified: true,
          },
          { onConflict: "kick_id" }
        );

        if (error) {
          console.error("Failed to save Kick user:", error);
          throw new Error("REDIRECT:/?error=SAVE_FAILED");
        }
      }
      return true;
    },

    async redirect({ url, baseUrl }) {
      // Обрабатываем наш кастомный "редирект"
      if (url.startsWith("REDIRECT:")) {
        return url.replace("REDIRECT:", "");
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },

    async session({ session, token }) {
      session.user = session.user || {};
      session.user.id = token?.sub || null;
      return session;
    },
  },
});

export async function GET(req, ctx) {
  return handler(req, ctx);
}
export async function POST(req, ctx) {
  return handler(req, ctx);
}
