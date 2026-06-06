import { Telegraf, Markup } from "telegraf";
import { getMachines } from "../lib/quote.js";

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is missing");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// ======================================
// MENU CHÍNH
// ======================================
function mainMenu() {

  return Markup.inlineKeyboard([
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
  ]);

}

// ======================================
// START
// ======================================
bot.start(async (ctx) => {

  await ctx.reply(
    "🤖 HAST Quote Bot\n\nChọn chức năng:",
    mainMenu()
  );

});

// ======================================
// MENU CHÍNH
// ======================================
bot.action(
  "MAIN_MENU",
  async (ctx) => {

    await ctx.answerCbQuery();

    await ctx.reply(
      "🏠 MENU CHÍNH",
      mainMenu()
    );

  }
);

// ======================================
// MENU BÁO GIÁ
// ======================================
bot.action(
  "MENU_QUOTE",
  async (ctx) => {

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
        ],
        [
          Markup.button.callback(
            "🏠 MENU CHÍNH",
            "MAIN_MENU"
          )
        ]
      ])
    );

  }
);

// ======================================
// THUÊ MÁY
// ======================================
bot.action(
  "RENT_MACHINE",
  async (ctx) => {

    await ctx.answerCbQuery();

    await ctx.reply(
      "📋 Chọn tình trạng máy",
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
        ],
        [
          Markup.button.callback(
            "🏠 MENU CHÍNH",
            "MAIN_MENU"
          )
        ]
      ])
    );

  }
);

// ======================================
// BÁN MÁY
// ======================================
bot.action(
  "SALE_MACHINE",
  async (ctx) => {

    await ctx.answerCbQuery();

    await ctx.reply(
      "🚧 Chức năng báo giá bán máy đang phát triển",
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            "🏠 MENU CHÍNH",
            "MAIN_MENU"
          )
        ]
      ])
    );

  }
);

// ======================================
// MÁY CŨ
// ======================================
bot.action(
  "USED_MACHINE",
  async (ctx) => {

    await ctx.answerCbQuery();

    try {

      const machines =
        await getMachines();

      if (
        !machines ||
        machines.length === 0
      ) {

        await ctx.reply(
          "❌ Chưa có dữ liệu model"
        );

        return;
      }

      const buttons =
        machines.map((m) => [
          Markup.button.callback(
            m.model,
            `MODEL_${m.id}`
          )
        ]);

      buttons.push([
        Markup.button.callback(
          "🏠 MENU CHÍNH",
          "MAIN_MENU"
        )
      ]);

      await ctx.reply(
        "📋 Chọn model",
        Markup.inlineKeyboard(
          buttons
        )
      );

    } catch (err) {

      console.error(err);

      await ctx.reply(
        "❌ Không đọc được dữ liệu model"
      );

    }

  }
);

// ======================================
// MÁY MỚI
// ======================================
bot.action(
  "NEW_MACHINE",
  async (ctx) => {

    await ctx.answerCbQuery();

    await ctx.reply(
      "🚧 Chức năng máy mới đang phát triển",
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            "🏠 MENU CHÍNH",
            "MAIN_MENU"
          )
        ]
      ])
    );

  }
);

// ======================================
// MODEL 1 DEMO
// ======================================
bot.action(
  "MODEL_1",
  async (ctx) => {

    await ctx.answerCbQuery();

    await ctx.reply(
      "💰 Nhập giá thuê tháng (VNĐ)",
      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            "🏠 MENU CHÍNH",
            "MAIN_MENU"
          )
        ]
      ])
    );

  }
);

// ======================================
// TRA CỨU MODEL
// ======================================
bot.action(
  "MENU_MODEL",
  async (ctx) => {

    await ctx.answerCbQuery();

    try {

      const machines =
        await getMachines();

      let text =
        "📋 DANH SÁCH MODEL\n\n";

      machines.forEach(
        (m, index) => {

          text +=
            `${index + 1}. ${m.model}\n`;

        }
      );

      await ctx.reply(text);

    } catch (err) {

      console.error(err);

      await ctx.reply(
        "❌ Không đọc được dữ liệu"
      );

    }

  }
);

// ======================================
// DANH SÁCH BÁO GIÁ
// ======================================
bot.action(
  "MENU_LIST",
  async (ctx) => {

    await ctx.answerCbQuery();

    await ctx.reply(
      "📂 Chức năng danh sách báo giá đang phát triển"
    );

  }
);

// ======================================
// TEST SUPABASE
// ======================================
bot.hears(
  "test",
  async (ctx) => {

    try {

      const machines =
        await getMachines();

      let text =
        "📋 DANH SÁCH MODEL\n\n";

      machines.forEach(
        (m, index) => {

          text +=
            `${index + 1}. ${m.model}\n`;

        }
      );

      await ctx.reply(text);

    } catch (err) {

      console.error(err);

      await ctx.reply(
        "❌ Lỗi đọc dữ liệu Supabase"
      );

    }

  }
);

// ======================================
// WEBHOOK
// ======================================
export default async function handler(
  req,
  res
) {

  if (
    req.method === "GET"
  ) {

    return res.status(200).json({
      ok: true,
      service: "HAST Quote Bot",
      status: "running"
    });

  }

  try {

    await bot.handleUpdate(
      req.body
    );

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
