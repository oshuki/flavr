import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BRING_API = "https://api.getbring.com/rest/v2";
const BRING_HEADERS_BASE = {
  "X-BRING-API-KEY": "cof4Nc6D8saplXjE3h3HXqHH8m7VU2i1Gs0g85Sp",
  "X-BRING-CLIENT": "webApp",
  "X-BRING-CLIENT-SOURCE": "webApp",
  "X-BRING-COUNTRY": "DE",
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const { action, email, password, token, uuid, listId, itemName, spec, url } = await req.json();

    if (action === "login") {
      // Authenticate with Bring! using email + password
      const res = await fetch(`${BRING_API}/bringauth`, {
        method: "POST",
        body: new URLSearchParams({ email, password }),
      });
      const text = await res.text();
      let data: Record<string, unknown>;
      try { data = JSON.parse(text); } catch {
        return new Response(JSON.stringify({ error: `Bring API Fehler (${res.status}): ${text}` }), {
          status: 401, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      if (!res.ok || "error" in data) {
        return new Response(JSON.stringify({ error: data.message || `Login fehlgeschlagen (${res.status})` }), {
          status: 401, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(data), {
        headers: { ...cors, "Content-Type": "application/json" },
      });

    } else if (action === "getLists") {
      // Get all shopping lists for the user
      const res = await fetch(`${BRING_API}/bringusers/${uuid}/lists`, {
        headers: {
          ...BRING_HEADERS_BASE,
          "Authorization": `Bearer ${token}`,
          "X-BRING-USER-UUID": uuid,
        },
      });
      const text = await res.text();
      let data: Record<string, unknown>;
      try { data = JSON.parse(text); } catch {
        return new Response(JSON.stringify({ error: `Bring API Fehler (${res.status}): ${text}` }), {
          status: 500, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      if (!res.ok) {
        return new Response(JSON.stringify({ error: "Listen konnten nicht geladen werden" }), {
          status: res.status, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify(data), {
        headers: { ...cors, "Content-Type": "application/json" },
      });

    } else if (action === "addItem") {
      // Add a single item to a Bring! list
      const body = `purchase=${encodeURIComponent(itemName)}&specification=${encodeURIComponent(spec || "")}&remove=`;
      const res = await fetch(`${BRING_API}/bringlists/${listId}`, {
        method: "PUT",
        headers: {
          ...BRING_HEADERS_BASE,
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Authorization": `Bearer ${token}`,
          "X-BRING-USER-UUID": uuid,
        },
        body,
      });
      return new Response(JSON.stringify({ ok: res.ok, status: res.status }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });

    } else if (action === "fetchPage") {
      // Proxy arbitrary HTTPS pages for the recipe scraper (CORS bypass)
      if (!url || !url.startsWith("https://")) {
        return new Response(JSON.stringify({ error: "Nur https:// URLs erlaubt" }), {
          status: 400, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      // Block private/internal hostnames
      const blocked = /^https?:\/\/(?:localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i;
      if (blocked.test(url)) {
        return new Response(JSON.stringify({ error: "Private URLs nicht erlaubt" }), {
          status: 400, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      try {
        const pageRes = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; RecipeBot/1.0)",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "de,en;q=0.9",
          },
          redirect: "follow",
          // deno fetch has no built-in size limit; read first 2MB only
        });
        const reader = pageRes.body?.getReader();
        let html = "";
        let bytes = 0;
        if (reader) {
          const decoder = new TextDecoder();
          while (bytes < 2_000_000) {
            const { done, value } = await reader.read();
            if (done) break;
            html += decoder.decode(value, { stream: true });
            bytes += value.byteLength;
          }
          reader.cancel();
        }
        return new Response(JSON.stringify({ html, finalUrl: pageRes.url, status: pageRes.status }), {
          headers: { ...cors, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { ...cors, "Content-Type": "application/json" },
        });
      }

    } else if (action === "imageProxy") {
      // Proxy image requests to avoid CORS/403 from localhost
      if (!url || !url.startsWith("https://image.pollinations.ai/")) {
        return new Response(JSON.stringify({ error: "Invalid URL" }), {
          status: 400, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const imgRes = await fetch(url);
      if (!imgRes.ok) {
        return new Response(JSON.stringify({ error: `Upstream ${imgRes.status}` }), {
          status: imgRes.status, headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      const imgData = await imgRes.arrayBuffer();
      return new Response(imgData, {
        headers: { ...cors, "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Unbekannte Aktion" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
