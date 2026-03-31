// api/exportPizzas.js
// ════════════════════════════════════════════════════════════════
//  PROYECTO 1 → PROYECTO 2: API de exportación
//  Ruta: GET /api/exportPizzas
//
//  Contrato estable. Devuelve solo lo que Proyecto 2 necesita.
//  No expone datos internos de P1 (pesos, tipografía, celulas...).
//
//  Respuesta:
//  {
//    "ok": true,
//    "version": "1",
//    "updatedAt": 1234567890,
//    "pizzas": [
//      { "id": "23", "name": "Divina", "image": null,
//        "ingredients": ["SALSA BARBACOA ROJA", "CRISPY"] }
//    ]
//  }
// ════════════════════════════════════════════════════════════════

import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // CORS — P2 está en otro dominio
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control",               "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const [rawPizzas, updatedAt] = await Promise.all([
      kv.get("topepizza:pizzas"),
      kv.get("topepizza:updated_at"),
    ]);

    if (!rawPizzas) {
      return res.status(200).json({
        ok: true, version: "1", updatedAt: null, pizzas: [],
      });
    }

    // Transformar al contrato de exportación: solo id, name, image, ingredients
    const exported = rawPizzas.map(pizza => ({
      id:   String(pizza.id),
      name: pizza.nombre || pizza.name || "Sin nombre",
      image: pizza.fotoAntes || pizza.image || null,
      ingredients: (pizza.ingredientes || pizza.ingredients || [])
        .map(ing => (typeof ing === "string" ? ing : ing.n || ing.name || ""))
        .filter(Boolean),
    }));

    return res.status(200).json({
      ok: true, version: "1", updatedAt: updatedAt ?? null, pizzas: exported,
    });

  } catch (err) {
    console.error("[exportPizzas] Error:", err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
