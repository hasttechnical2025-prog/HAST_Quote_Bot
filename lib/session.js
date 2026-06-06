import { supabase } from "./supabase.js";

export async function saveSession(
  telegramUserId,
  currentStep,
  payload
) {

  const { error } = await supabase
    .from("quote_sessions")
    .upsert({
      telegram_user_id: telegramUserId,
      current_step: currentStep,
      payload,
      updated_at: new Date()
    });

  if (error) throw error;
}

export async function getSession(
  telegramUserId
) {

  const { data, error } = await supabase
    .from("quote_sessions")
    .select("*")
    .eq(
      "telegram_user_id",
      telegramUserId
    )
    .single();

  if (error) return null;

  return data;
}

export async function clearSession(
  telegramUserId
) {

  await supabase
    .from("quote_sessions")
    .delete()
    .eq(
      "telegram_user_id",
      telegramUserId
    );
}
