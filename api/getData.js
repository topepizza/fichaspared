// api/getData.js

import pkg from "@supabase/supabase-js";
const { createClient } = pkg;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from("app_data")
      .select("*");

    if (error) {
      throw error;
    }

    const result = {};
    for (const row of data) {
      result[row.clave] = row.valor;
    }

    return res.status(200).json({
      ok: true,
      data: result,
    });

  } catch (err) {
    console.error("[getData] Error:", err);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
