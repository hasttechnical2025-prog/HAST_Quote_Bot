import { supabase } from "./supabase.js";

export async function getMachines() {

const { data, error } =
await supabase
.from("quote_machines")
.select("*")
.eq("active", true)
.order("model");

if (error) throw error;

return data;

}

export async function getMachineById(id) {

const { data, error } =
await supabase
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

const { data, error } =
await supabase
.from("quote_quotes")
.insert([
{
quote_no: quoteNo,

```
      customer_id:
        payload.customer_id || null,

      customer_name:
        payload.customer_name,

      machine_id:
        payload.machine_id,

      machine_model:
        payload.machine_model,

      term_id:
        payload.term_id || null,

      quote_type:
        payload.quote_type,

      machine_condition:
        payload.machine_condition,

      rental_price:
        payload.rental_price,

      bw_copy_price:
        payload.bw_copy_price,

      color_copy_price:
        payload.color_copy_price || 0,

      telegram_user_id:
        payload.telegram_user_id,

      quote_status:
        "draft"
    }
  ])
  .select()
  .single();
```

if (error) throw error;

return data;

}

export async function getQuoteById(id) {

const { data, error } =
await supabase
.from("quote_quotes")
.select("*")
.eq("id", id)
.single();

if (error) throw error;

return data;

}

export async function getQuoteFullData(id) {

const quote =
await getQuoteById(id);

const { data: machine } =
await supabase
.from("quote_machines")
.select("*")
.eq("id", quote.machine_id)
.single();

const { data: customer } =
await supabase
.from("quote_customers")
.select("*")
.eq("id", quote.customer_id)
.single();

const { data: term } =
await supabase
.from("quote_terms")
.select("*")
.eq("id", quote.term_id)
.single();

const { data: details } =
await supabase
.from("quote_machine_details")
.select("*")
.eq("machine_id", quote.machine_id)
.order("display_order");

return {
quote,
machine,
customer,
term,
details
};

}
