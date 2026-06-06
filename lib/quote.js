import { supabase } from "./supabase.js";

export async function getMachines() {

  const { data, error } = await supabase
    .from("quote_machines")
    .select("*")
    .eq("active", true)
    .order("model");

  if (error) {
    throw error;
  }

  return data;
}
