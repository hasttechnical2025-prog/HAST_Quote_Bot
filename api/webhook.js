import { Telegraf, Markup } from "telegraf";
import { getMachines } from "../lib/quote.js";

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is missing");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// ===== START =====
bot.start(async (ctx) => {

  await ctx.reply(
    "🤖 HAST Quote Bot\n\nChọn chức năng:",
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "📋 TẠO BÁO GIÁ",
          "MENU_QUOTE"
        )
      ],
      [
        Markup.button.callback(
          "🔍 TRA CỨU MODEL",
          "MENU_MODEL"
        )
      ],
      [
        Markup.button.callback(
          "📂 DANH SÁCH BÁO GIÁ",
          "MENU_LIST"
        )
      ]
    ])
  );

});

// ===== MENU BÁO GIÁ =====
bot.action("MENU_QUOTE", async (ctx) => {

  await ctx.answerCbQuery();

  await ctx.reply(
    "📋 Chọn loại báo giá",
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "🖨 THUÊ MÁY",
          "RENT_MACHINE"
        )
      ],
      [
        Markup.button.callback(
          "💰 BÁN MÁY",
          "SALE_MACHINE"
        )
      ]
    ])
  );

});

// ===== THUÊ MÁY =====
bot.action("RENT_MACHINE", async (ctx) => {

  await ctx.answerCbQuery();

  await ctx.reply(
    "Chọn tình trạng máy",
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "♻️ MÁY CŨ",
          "USED_MACHINE"
        )
      ],
      [
        Markup.button.callback(
          "✨ MÁY MỚI",
          "NEW_MACHINE"
        )
      ]
    ])
  );

});

// ===== TEST SUPABASE =====
bot.hears("test", async (ctx) => {

  try {

    const machines = await getMachines();

    let text = "📋 DANH SÁCH MODEL\n\n";

    machines.forEach((m, index) => {
      text += `${index + 1}. ${m.model}\n`;
    });

    await ctx.reply(text);

  } catch (err) {

    console.error(err);

    await ctx.reply(
      "❌ Lỗi đọc dữ liệu máy từ Supabase"
    );

  }

});

// ===== WEBHOOK =====
export default async function handler(req, res) {

  if (req.method === "GET") {

    return res.status(200).json({
      ok: true,
      service: "HAST Quote Bot",
      status: "running"
    });

  }

  try {

    await bot.handleUpdate(req.body);

    return res.status(200).json({
      ok: true
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message
    });

  }

}
