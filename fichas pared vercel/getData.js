// api/getData.js
// ════════════════════════════════════════════════════════════════
//  Lee los datos guardados desde Vercel KV y los devuelve al cliente.
//  Ruta: GET /api/getData
//
//  Respuesta exitosa (primer uso, KV vacío):
//    { ok: true, pizzas: null, salsaColors: null, updatedAt: null }
//
//  Respuesta exitosa (con datos):
//    { ok: true, pizzas: [...], salsaColors: {...}, updatedAt: 1234567890 }
//
//  Error:
//    { ok: false, error: "mensaje" }  (HTTP 500)
//
//  PREREQUISITO:
//  En el dashboard de Vercel → Storage → Create KV Database
//  y vincularla al proyecto. Las variables de entorno
//  KV_REST_API_URL y KV_REST_API_TOKEN se añaden automáticamente.
// ════════════════════════════════════════════════════════════════

import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // CORS preflight
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control",               "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    // Leer los tres valores en paralelo desde KV
    const [pizzas, salsaColors, updatedAt] = await Promise.all([
      kv.get("topepizza:pizzas"),
      kv.get("topepizza:salsa_colors"),
      kv.get("topepizza:updated_at"),
    ]);

    return res.status(200).json({
      ok:         true,
      pizzas:     pizzas     ?? null,
      salsaColors:salsaColors?? null,
      updatedAt:  updatedAt  ?? null,
    });

  } catch (err) {
    console.error("[getData] Error:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
