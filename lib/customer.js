import { supabase } from "./supabase.js";

export async function getCustomers() {

  const { data, error } =
    await supabase
      .from("quote_customers")
      .select("*")
      .eq("active", true)
      .order("customer_name");

  if (error) throw error;

  return data;

}

export async function getCustomerById(id) {

  const { data, error } =
    await supabase
      .from("quote_customers")
      .select("*")
      .eq("id", id)
      .single();

  if (error) throw error;

  return data;

}

export async function searchCustomers(keyword) {

  const { data, error } =
    await supabase
      .from("quote_customers")
      .select("*")
      .ilike(
        "customer_name",
        `%${keyword}%`
      )
      .eq("active", true)
      .limit(20);

  if (error) throw error;

  return data;

}

export async function createCustomer(
  customerName
) {

  const { data, error } =
    await supabase
      .from("quote_customers")
      .insert({
        customer_name:
          customerName
      })
      .select()
      .single();

  if (error) throw error;

  return data;

}
