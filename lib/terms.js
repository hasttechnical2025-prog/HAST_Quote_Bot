import { supabase } from "./supabase.js";

export async function getDefaultTerms() {

  const { data, error } =
    await supabase
      .from("quote_terms")
      .select("*")
      .limit(1)
      .single();

  if (error) {
    throw error;
  }

  return data;

}
