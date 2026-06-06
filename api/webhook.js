import { Telegraf } from "telegraf";
import { getMachines } from "../lib/quote.js";
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
bot.hears("📋 Tạo báo giá", async (ctx) => {

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
  await ctx.reply(
`🤖 HAST Quote Bot

Chọn chức năng:

📋 Tạo báo giá

🔍 Tra cứu model

📂 Danh sách báo giá`
  );

});

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
