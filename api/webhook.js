import { Telegraf, Markup } from "telegraf";
import { getMachines } from "../lib/quote.js";
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
bot.hears("📋 Tạo báo giá", async (ctx) => {

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

bot.action(
  "RENT_MACHINE",
  async (ctx) => {

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

  }
);

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
