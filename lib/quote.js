import { supabase } from "./supabase.js";

export async function getMachines() {

  const { data, error } = await supabase
    .from("quote_machines")
    .select("*")
    .eq("active", true)
    .order("model");

  if (error) throw error;

  return data;
}

export async function getMachineById(id) {

  const { data, error } = await supabase
    .from("quote_machines")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function createQuote(payload) {

  const quoteNo =
    "BG" +
    new Date().getFullYear() +
    String(Date.now()).slice(-6);

  const { data, error } = await supabase
    .from("quote_quotes")
    .insert([
      {
        quote_no: quoteNo,

        customer_name: payload.customer_name,

        machine_id: payload.machine_id,
        machine_model: payload.machine_model,

        quote_type: payload.quote_type,
        machine_condition: payload.machine_condition,

        rental_price: payload.rental_price,

        bw_copy_price: payload.bw_copy_price,
        color_copy_price: payload.color_copy_price,

        telegram_user_id: payload.telegram_user_id,

        quote_status: "draft"
      }
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
}
