// api/getData.js
import pkg from "@supabase/supabase-js";
const { createClient } = pkg;

export default async function handler(req, res) {
  try {
    const url = (process.env.SUPABASE_URL || "").trim();
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

    if (!url) {
      throw new Error("Falta SUPABASE_URL");
    }
    if (!key) {
      throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
    }

    console.log("[getData] URL:", url);
    console.log("[getData] Key prefix:", key.slice(0, 20));

    // prueba de red simple
    const healthUrl = `${url}/rest/v1/`;
    const testResp = await fetch(healthUrl, {
      method: "GET",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    console.log("[getData] Test status:", testResp.status);

    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("app_data")
      .select("*");

    if (error) throw error;

    const result = {};
    for (const row of data) {
      result[row.clave] = row.valor;
    }

    return res.status(200).json({ ok: true, data: result });
  } catch (err) {
    console.error("[getData] Error full:", err);
    console.error("[getData] Error message:", err?.message);
    console.error("[getData] Error cause:", err?.cause);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Error desconocido",
    });
  }
}
