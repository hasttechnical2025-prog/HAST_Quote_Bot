import { supabase } from "./supabase.js";

export async function getMachineDetails(
  machineId
) {

  const { data, error } =
    await supabase
      .from("quote_machine_details")
      .select("*")
      .eq("machine_id", machineId)
      .order("display_order");

  if (error) {
    throw error;
  }

  return data;

}
