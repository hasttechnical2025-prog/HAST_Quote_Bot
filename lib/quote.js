import { supabase } from "./supabase.js";

export async function getMachines() {

  const { data, error } =
    await supabase
      .from("quote_machines")
      .select("*")
      .eq("active", true)
      .order("model");

  if (error) {
    throw error;
  }

  return data;

}

export async function getMachineById(
  machineId
) {

  const { data, error } =
    await supabase
      .from("quote_machines")
      .select("*")
      .eq("id", machineId)
      .single();

  if (error) {
    throw error;
  }

  return data;

}

export async function createQuote(
  quoteData
) {

  const { data, error } =
    await supabase
      .from("quote_quotes")
      .insert(quoteData)
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;

}
