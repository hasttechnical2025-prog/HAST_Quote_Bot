import { Telegraf, Markup } from "telegraf";

import {
  saveSession,
  getSession,
  clearSession
} from "../lib/session.js";

import {
  getMachines,
  getMachineById,
  createQuote
} from "../lib/quote.js";

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
  /^MODEL_(\d+)$/,
  async (ctx) => {

    await ctx.answerCbQuery();

    const machineId =
      Number(ctx.match[1]);

    const machine =
      await getMachineById(
        machineId
      );

    await saveSession(
      ctx.from.id,
      "CONFIRM_DEFAULT_PRICE",
      {
        machine_id:
          machine.id,

        machine_model:
          machine.model,

        is_color:
          machine.is_color,

        rental_price:
          machine.default_rental_price,

        bw_copy_price:
          machine.default_bw_price,

        color_copy_price:
          machine.default_color_price
      }
    );

    await ctx.reply(
      `🖨 Model: ${machine.model}

💰 Giá thuê:
${machine.default_rental_price?.toLocaleString("vi-VN")} VNĐ

🖤 Giá BW:
${machine.default_bw_price?.toLocaleString("vi-VN")} VNĐ`,

      Markup.inlineKeyboard([
        [
          Markup.button.callback(
            "✅ DÙNG GIÁ CHUẨN",
            "USE_DEFAULT_PRICE"
          )
        ],
        [
          Markup.button.callback(
            "✏️ NHẬP GIÁ KHÁC",
            "CUSTOM_PRICE"
          )
        ]
      ])
    );

  }
);

bot.action(
  "USE_DEFAULT_PRICE",
  async (ctx) => {

    await ctx.answerCbQuery();

    const session =
      await getSession(
        ctx.from.id
      );

    if (!session) return;

    await saveSession(
      ctx.from.id,
      "WAIT_CUSTOMER",
      session.payload
    );

    await ctx.reply(
      "🏢 Nhập tên khách hàng"
    );

  }
);
bot.action(
  "CUSTOM_PRICE",
  async (ctx) => {

    await ctx.answerCbQuery();

    const session =
      await getSession(
        ctx.from.id
      );

    if (!session) return;

    await saveSession(
      ctx.from.id,
      "WAIT_RENTAL_PRICE",
      session.payload
    );

    await ctx.reply(
      "💰 Nhập giá thuê tháng"
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
bot.on(
  "text",
  async (ctx) => {

    const session =
      await getSession(
        ctx.from.id
      );

    if (!session) return;

    if (
      session.current_step ===
      "WAIT_RENTAL_PRICE"
    ) {

      const rentalPrice =
        Number(
          ctx.message.text
            .replaceAll(".", "")
            .replaceAll(",", "")
        );

      if (
        isNaN(rentalPrice)
      ) {

        await ctx.reply(
          "❌ Giá không hợp lệ"
        );

        return;
      }

      const payload =
        session.payload;

      payload.rental_price =
        rentalPrice;

      await saveSession(
        ctx.from.id,
        "WAIT_BW_PRICE",
        payload
      );

      await ctx.reply(
        "🖤 Nhập giá copy đen"
      );

      return;
    }

    if (
  session.current_step ===
  "WAIT_BW_PRICE"
) {

  const payload =
    session.payload;

  payload.bw_copy_price =
    Number(
      ctx.message.text
        .replaceAll(".", "")
        .replaceAll(",", "")
    );

  if (
    isNaN(
      payload.bw_copy_price
    )
  ) {

    await ctx.reply(
      "❌ Giá copy đen không hợp lệ"
    );

    return;
  }

  // =========================
  // MÁY ĐEN TRẮNG
  // =========================
  if (
    payload.is_color === false
  ) {

    payload.color_copy_price = 0;

    await saveSession(
      ctx.from.id,
      "WAIT_CUSTOMER",
      payload
    );

    await ctx.reply(
      "🏢 Nhập tên khách hàng"
    );

    return;
  }

  // =========================
  // MÁY MÀU
  // =========================
  await saveSession(
    ctx.from.id,
    "WAIT_COLOR_PRICE",
    payload
  );

  await ctx.reply(
    "🎨 Nhập giá copy màu"
  );

  return;

}

    if (
      session.current_step ===
      "WAIT_COLOR_PRICE"
    ) {

      const payload =
        session.payload;

      payload.color_copy_price =
        Number(
          ctx.message.text
        );

      await saveSession(
        ctx.from.id,
        "WAIT_CUSTOMER",
        payload
      );

      await ctx.reply(
        "🏢 Nhập tên khách hàng"
      );

      return;
    }

    if (
      session.current_step ===
      "WAIT_CUSTOMER"
    ) {

      const payload =
        session.payload;

      payload.customer_name =
        ctx.message.text;

      payload.telegram_user_id =
        ctx.from.id;

      const quote =
        await createQuote(
          payload
        );

      await clearSession(
        ctx.from.id
      );

      await ctx.reply(
        `✅ Đã tạo báo giá

Số BG:
${quote.quote_no}`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback(
              "🆕 BÁO GIÁ MỚI",
              "MENU_QUOTE"
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

      return;
    }

  }
);
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
