import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {

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
