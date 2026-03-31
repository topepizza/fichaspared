// api/saveData.js
import pkg from "@supabase/supabase-js";
const { createClient } = pkg;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Use POST" });
  }

  try {
    const url = (process.env.SUPABASE_URL || "").trim();
    const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

    if (!url) throw new Error("Falta SUPABASE_URL");
    if (!key) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");

    console.log("[saveData] URL:", url);
    console.log("[saveData] Key prefix:", key.slice(0, 20));

    const supabase = createClient(url, key);

    const { pizzas, salsaColors } = req.body || {};

    if (!Array.isArray(pizzas)) {
      return res.status(400).json({
        ok: false,
        error: "Campo 'pizzas' debe ser un array.",
      });
    }

    const ts = Date.now();
    const updatedAtIso = new Date(ts).toISOString();

    const rows = [
      {
        clave: "topepizza:pizzas",
        valor: pizzas,
        updated_at: updatedAtIso,
      },
    ];

    if (salsaColors && typeof salsaColors === "object" && !Array.isArray(salsaColors)) {
      rows.push({
        clave: "topepizza:salsa_colors",
        valor: salsaColors,
        updated_at: updatedAtIso,
      });
    }

    const { data, error } = await supabase
      .from("app_data")
      .upsert(rows, { onConflict: "clave" })
      .select();

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      updatedAt: ts,
      rowsSaved: data?.length ?? 0,
    });
  } catch (err) {
    console.error("[saveData] Error full:", err);
    console.error("[saveData] Error message:", err?.message);
    console.error("[saveData] Error cause:", err?.cause);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Error desconocido",
    });
  }
}
