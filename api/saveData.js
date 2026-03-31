// api/saveData.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Use POST" });
  }

  const { pizzas, salsaColors } = req.body || {};

  if (!pizzas || !Array.isArray(pizzas) || pizzas.length === 0) {
    return res.status(400).json({
      ok: false,
      error: "Campo 'pizzas' es obligatorio y debe ser un array no vacío.",
    });
  }

  try {
    const ts = Date.now();
    const updatedAtIso = new Date(ts).toISOString();

    const rows = [
      {
        clave: "topepizza:pizzas",
        valor: pizzas,
        updated_at: updatedAtIso,
      },
    ];

    if (
      salsaColors &&
      typeof salsaColors === "object" &&
      !Array.isArray(salsaColors)
    ) {
      rows.push({
        clave: "topepizza:salsa_colors",
        valor: salsaColors,
        updated_at: updatedAtIso,
      });
    }

    const { error } = await supabase
      .from("app_data")
      .upsert(rows, { onConflict: "clave" });

    if (error) {
      throw error;
    }

    return res.status(200).json({ ok: true, updatedAt: ts });
  } catch (err) {
    console.error("[saveData] Error:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
