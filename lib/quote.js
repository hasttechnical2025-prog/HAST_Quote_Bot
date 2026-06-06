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

  let machineSnapshot = null;
  let customerSnapshot = null;
  let termSnapshot = null;

  if (payload.machine_id) {
    const { data } = await supabase
      .from("quote_machines")
      .select("*")
      .eq("id", payload.machine_id)
      .single();

    machineSnapshot = data;
  }

  if (payload.customer_id) {
    const { data } = await supabase
      .from("quote_customers")
      .select("*")
      .eq("id", payload.customer_id)
      .single();

    customerSnapshot = data;
  }

  if (payload.term_id) {
    const { data } = await supabase
      .from("quote_terms")
      .select("*")
      .eq("id", payload.term_id)
      .single();

    termSnapshot = data;
  }

  const { data, error } = await supabase
    .from("quote_quotes")
    .insert([
      {
        quote_no: quoteNo,
        customer_id: payload.customer_id || null,
        customer_name: payload.customer_name,
        machine_id: payload.machine_id,
        machine_model: payload.machine_model,
        term_id: payload.term_id || null,
        quote_type: payload.quote_type,
        machine_condition: payload.machine_condition,
        rental_price: payload.rental_price,
        bw_copy_price: payload.bw_copy_price,
        color_copy_price: payload.color_copy_price || 0,
        telegram_user_id: payload.telegram_user_id,
        quote_status: "draft",
        machine_snapshot: machineSnapshot,
        customer_snapshot: customerSnapshot,
        term_snapshot: termSnapshot
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuoteById(id) {
  const { data, error } = await supabase
    .from("quote_quotes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getQuoteFullData(id) {
  const quote = await getQuoteById(id);

  return {
    quote,
    machine: quote.machine_snapshot,
    customer: quote.customer_snapshot,
    term: quote.term_snapshot
  };
}
