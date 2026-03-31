// api/getData.js
// ════════════════════════════════════════════════════════════════
//  Lee los datos guardados desde Supabase y los devuelve al cliente.
//  Ruta: GET /api/getData
//
//  Respuesta exitosa (sin datos):
//    { ok: true, pizzas: null, salsaColors: null, updatedAt: null }
//
//  Respuesta exitosa (con datos):
//    { ok: true, pizzas: [...], salsaColors: {...}, updatedAt: 1234567890 }
//
//  Error:
//    { ok: false, error: "mensaje" }
// ════════════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Use GET" });
  }

  try {
    const { data, error } = await supabase
      .from("app_data")
      .select("clave, valor, updated_at")
      .in("clave", ["topepizza:pizzas", "topepizza:salsa_colors"]);

    if (error) {
      throw error;
    }

    const pizzasRow = data.find((row) => row.clave === "topepizza:pizzas");
    const salsaRow = data.find((row) => row.clave === "topepizza:salsa_colors");

    const pizzas = pizzasRow?.valor ?? null;
    const salsaColors = salsaRow?.valor ?? null;

    const updatedAt = pizzasRow?.updated_at
      ? new Date(pizzasRow.updated_at).getTime()
      : salsaRow?.updated_at
      ? new Date(salsaRow.updated_at).getTime()
      : null;

    return res.status(200).json({
      ok: true,
      pizzas,
      salsaColors,
      updatedAt,
    });
  } catch (err) {
    console.error("[getData] Error:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
