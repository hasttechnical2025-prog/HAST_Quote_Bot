import { supabase } from "./supabase.js";

export async function getTerms() {

  const { data, error } =
    await supabase
      .from("quote_terms")
      .select("*")
      .order("id");

  if (error) throw error;

  return data;
}

export async function getTermById(id) {

  const { data, error } =
    await supabase
      .from("quote_terms")
      .select("*")
      .eq("id", id)
      .single();

  if (error) throw error;

  return data;
}

export async function getDefaultTerms() {

  const { data, error } =
    await supabase
      .from("quote_terms")
      .select("*")
      .limit(1)
      .single();

  if (error) throw error;

  return data;
}
