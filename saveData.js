// api/saveData.js
// ════════════════════════════════════════════════════════════════
//  Guarda los datos en Vercel KV (compartido entre dispositivos).
//  Ruta: POST /api/saveData
//
//  Body JSON esperado:
//    { pizzas: [...], salsaColors: { key: "#hexcolor", ... } }
//
//  Respuesta exitosa:
//    { ok: true, updatedAt: 1234567890 }
//
//  Error:
//    { ok: false, error: "mensaje" }
// ════════════════════════════════════════════════════════════════

import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin",  "*");
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
      ok:    false,
      error: "Campo 'pizzas' es obligatorio y debe ser un array no vacío.",
    });
  }

  try {
    const ts = Date.now();

    // Guardar en paralelo
    const writes = [
      kv.set("topepizza:pizzas",     pizzas),
      kv.set("topepizza:updated_at", ts),
    ];

    if (salsaColors && typeof salsaColors === "object" && !Array.isArray(salsaColors)) {
      writes.push(kv.set("topepizza:salsa_colors", salsaColors));
    }

    await Promise.all(writes);

    return res.status(200).json({ ok: true, updatedAt: ts });

  } catch (err) {
    console.error("[saveData] Error:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
