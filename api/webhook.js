import { Telegraf, Markup } from "telegraf";

import {
  searchCustomers,
  createCustomer,
  getCustomerById
} from "../lib/customer.js";

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

import { getMachineDetails } from "../lib/machine.js";
import { generateRentalQuote } from "../lib/docx.js";

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN is missing");
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// ======================================
// HELPER: CÁC LOẠI PHÍM CHỨC NĂNG
// ======================================
function mainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📋 TẠO BÁO GIÁ", "MENU_QUOTE")],
    [Markup.button.callback("🔍 TRA CỨU MODEL", "MENU_MODEL")],
    [Markup.button.callback("📂 DANH SÁCH BÁO GIÁ", "MENU_LIST")]
  ]);
}

function cancelMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("❌ Hủy & Về Menu Chính", "MAIN_MENU")]
  ]);
}

// ======================================
// HELPER: TẠO BÁO GIÁ VÀ GỬI FILE WORD
// ======================================
async function handleCreateQuoteAndReply(ctx, payload) {
  // Gửi thông báo đang xử lý vì việc sinh file có thể mất chút thời gian
  const processingMsg = await ctx.reply("⏳ Đang tạo báo giá và sinh file Word, vui lòng đợi...");

  try {
    payload.telegram_user_id = ctx.from.id;

    // Tạo báo giá (lưu vào CSDL kèm snapshot)
    const quote = await createQuote(payload);

    // Lấy thông số chi tiết dòng máy
    const details = await getMachineDetails(quote.machine_id);

    // Tạo file docx
    const docxPath = await generateRentalQuote(
      quote,
      quote.machine_snapshot,
      details,
      quote.term_snapshot
    );

    // Xóa session làm việc
    await clearSession(ctx.from.id);

    // Cố gắng xóa tin nhắn "Đang tạo báo giá..."
    try {
      await ctx.deleteMessage(processingMsg.message_id);
    } catch (e) {
      // Bỏ qua nếu không xóa được (do quyền hoặc message quá hạn)
    }

    // Gửi phản hồi thành công cơ bản
    await ctx.reply(
      `✅ ĐÃ TẠO BÁO GIÁ THÀNH CÔNG!\n\n🏢 Khách hàng: ${quote.customer_name}\n📄 Số BG: ${quote.quote_no}`
    );

    // Gửi kèm file Document Word
    await ctx.replyWithDocument(
      {
        source: docxPath,
        filename: `${quote.quote_no}.docx`
      },
      Markup.inlineKeyboard([
        [Markup.button.callback("🆕 BÁO GIÁ MỚI", "MENU_QUOTE")],
        [Markup.button.callback("🏠 MENU CHÍNH", "MAIN_MENU")]
      ])
    );

  } catch (err) {
    console.error("Lỗi tạo báo giá:", err);
    try {
      await ctx.deleteMessage(processingMsg.message_id);
    } catch (e) {}
    await ctx.reply("❌ Đã xảy ra lỗi khi tạo báo giá hoặc sinh file Word.", mainMenu());
  }
}

// ======================================
// KHỞI ĐẦU & MENU CHÍNH
// ======================================
bot.start(async (ctx) => {
  await clearSession(ctx.from.id);
  await ctx.reply("🤖 HAST Quote Bot\n\nChọn chức năng:", mainMenu());
});

bot.action("MAIN_MENU", async (ctx) => {
  await ctx.answerCbQuery();
  await clearSession(ctx.from.id);
  await ctx.reply("🏠 MENU CHÍNH", mainMenu());
});

// ======================================
// MENU TẠO BÁO GIÁ
// ======================================
bot.action("MENU_QUOTE", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("📋 Chọn loại báo giá", Markup.inlineKeyboard([
    [Markup.button.callback("🖨 THUÊ MÁY", "RENT_MACHINE")],
    [Markup.button.callback("💰 BÁN MÁY", "SALE_MACHINE")],
    [Markup.button.callback("🏠 MENU CHÍNH", "MAIN_MENU")]
  ]));
});

// ======================================
// THUÊ MÁY -> TÌNH TRẠNG
// ======================================
bot.action("RENT_MACHINE", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("📋 Chọn tình trạng máy", Markup.inlineKeyboard([
    [Markup.button.callback("♻️ MÁY CŨ", "USED_MACHINE")],
    [Markup.button.callback("✨ MÁY MỚI", "NEW_MACHINE")],
    [Markup.button.callback("🏠 MENU CHÍNH", "MAIN_MENU")]
  ]));
});

// CÁC CHỨC NĂNG ĐANG PHÁT TRIỂN
bot.action(["SALE_MACHINE", "NEW_MACHINE", "MENU_LIST"], async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🚧 Chức năng này đang phát triển", Markup.inlineKeyboard([
    [Markup.button.callback("🏠 MENU CHÍNH", "MAIN_MENU")]
  ]));
});

// ======================================
// TRA CỨU MODEL (Chỉ xem danh sách)
// ======================================
bot.action("MENU_MODEL", async (ctx) => {
  await ctx.answerCbQuery();
  try {
    const machines = await getMachines();
    let text = "📋 DANH SÁCH MODEL\n\n";
    machines.forEach((m, index) => {
      text += `${index + 1}. ${m.model}\n`;
    });
    await ctx.reply(text, Markup.inlineKeyboard([
      [Markup.button.callback("🏠 MENU CHÍNH", "MAIN_MENU")]
    ]));
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Lỗi: Không đọc được dữ liệu model");
  }
});

// ======================================
// TẠO BÁO GIÁ -> CHỌN MODEL MÁY CŨ
// ======================================
bot.action("USED_MACHINE", async (ctx) => {
  await ctx.answerCbQuery();
  try {
    const machines = await getMachines();
    if (!machines || machines.length === 0) {
      return ctx.reply("❌ Chưa có dữ liệu model");
    }

    const buttons = machines.map((m) => [
      Markup.button.callback(m.model, `MODEL_${m.id}`)
    ]);
    buttons.push([Markup.button.callback("🏠 MENU CHÍNH", "MAIN_MENU")]);

    await ctx.reply("📋 Chọn model:", Markup.inlineKeyboard(buttons));
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Không đọc được dữ liệu model");
  }
});

// ======================================
// CHỌN MODEL -> XÁC NHẬN GIÁ CHUẨN/KHÁC
// ======================================
bot.action(/^MODEL_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const machineId = Number(ctx.match[1]);

  try {
    const machine = await getMachineById(machineId);

    // Khởi tạo payload session mới
    await saveSession(ctx.from.id, "CONFIRM_DEFAULT_PRICE", {
      machine_id: machine.id,
      machine_model: machine.model,
      machine_condition: "Máy cũ",
      is_color: machine.is_color,
      rental_price: machine.default_rental_price || 0,
      bw_copy_price: machine.default_bw_price || 0,
      color_copy_price: machine.default_color_price || 0,
      quote_type: "RENTAL"
    });

    const priceText = `🖨 Model: ${machine.model}\n`
      + `\n💰 Giá thuê chuẩn: ${machine.default_rental_price?.toLocaleString("vi-VN")} VNĐ`
      + `\n🖤 Giá BW chuẩn: ${machine.default_bw_price?.toLocaleString("vi-VN")} VNĐ`
      + (machine.is_color ? `\n🎨 Giá màu chuẩn: ${machine.default_color_price?.toLocaleString("vi-VN")} VNĐ` : "");

    await ctx.reply(priceText, Markup.inlineKeyboard([
      [Markup.button.callback("✅ DÙNG GIÁ CHUẨN", "USE_DEFAULT_PRICE")],
      [Markup.button.callback("✏️ NHẬP GIÁ KHÁC", "CUSTOM_PRICE")],
      [Markup.button.callback("❌ Hủy", "MAIN_MENU")]
    ]));
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Lỗi lấy thông tin model");
  }
});

// ======================================
// LỰA CHỌN GIÁ
// ======================================
bot.action("USE_DEFAULT_PRICE", async (ctx) => {
  await ctx.answerCbQuery();
  const session = await getSession(ctx.from.id);
  if (!session) return ctx.reply("Phiên làm việc đã hết hạn. Vui lòng thử lại.", mainMenu());

  await saveSession(ctx.from.id, "WAIT_CUSTOMER_SEARCH", session.payload);
  await ctx.reply("🔍 Nhập TÊN hoặc TỪ KHÓA để tìm kiếm khách hàng:", cancelMenu());
});

bot.action("CUSTOM_PRICE", async (ctx) => {
  await ctx.answerCbQuery();
  const session = await getSession(ctx.from.id);
  if (!session) return ctx.reply("Phiên làm việc đã hết hạn. Vui lòng thử lại.", mainMenu());

  await saveSession(ctx.from.id, "WAIT_RENTAL_PRICE", session.payload);
  await ctx.reply("💰 Nhập giá thuê tháng (VND):", cancelMenu());
});

// ======================================
// XỬ LÝ KHI NGƯỜI DÙNG NHẬP VĂN BẢN (TEXT)
// ======================================
bot.on("text", async (ctx) => {
  const session = await getSession(ctx.from.id);
  if (!session) return; // Không có session đang hoạt động thì bỏ qua

  const text = ctx.message.text.trim();
  const payload = session.payload;

  // --- 1. NHẬP GIÁ THUÊ THÁNG ---
  if (session.current_step === "WAIT_RENTAL_PRICE") {
    const rentalPrice = Number(text.replaceAll(".", "").replaceAll(",", ""));
    if (isNaN(rentalPrice) || rentalPrice < 0) {
      return ctx.reply("❌ Giá thuê không hợp lệ. Vui lòng nhập số dương (ví dụ: 1500000).", cancelMenu());
    }

    payload.rental_price = rentalPrice;
    await saveSession(ctx.from.id, "WAIT_BW_PRICE", payload);
    return ctx.reply("🖤 Nhập giá copy đen (VND):", cancelMenu());
  }

  // --- 2. NHẬP GIÁ COPY ĐEN ---
  if (session.current_step === "WAIT_BW_PRICE") {
    const bwPrice = Number(text.replaceAll(".", "").replaceAll(",", ""));
    if (isNaN(bwPrice) || bwPrice < 0) {
      return ctx.reply("❌ Giá copy đen không hợp lệ. Vui lòng nhập số dương.", cancelMenu());
    }

    payload.bw_copy_price = bwPrice;

    if (payload.is_color) {
      await saveSession(ctx.from.id, "WAIT_COLOR_PRICE", payload);
      return ctx.reply("🎨 Nhập giá copy màu (VND):", cancelMenu());
    } else {
      payload.color_copy_price = 0;
      await saveSession(ctx.from.id, "WAIT_CUSTOMER_SEARCH", payload);
      return ctx.reply("🔍 Nhập TÊN hoặc TỪ KHÓA để tìm kiếm khách hàng:", cancelMenu());
    }
  }

  // --- 3. NHẬP GIÁ COPY MÀU ---
  if (session.current_step === "WAIT_COLOR_PRICE") {
    const colorPrice = Number(text.replaceAll(".", "").replaceAll(",", ""));
    if (isNaN(colorPrice) || colorPrice < 0) {
      return ctx.reply("❌ Giá copy màu không hợp lệ. Vui lòng nhập số dương.", cancelMenu());
    }

    payload.color_copy_price = colorPrice;
    await saveSession(ctx.from.id, "WAIT_CUSTOMER_SEARCH", payload);
    return ctx.reply("🔍 Nhập TÊN hoặc TỪ KHÓA để tìm kiếm khách hàng:", cancelMenu());
  }

  // --- 4. TÌM KIẾM KHÁCH HÀNG ---
  if (session.current_step === "WAIT_CUSTOMER_SEARCH") {
    try {
      const customers = await searchCustomers(text);
      payload.search_keyword = text; // Lưu từ khóa tìm kiếm để dùng nếu bấm "Thêm khách hàng mới"
      await saveSession(ctx.from.id, session.current_step, payload);

      const buttons = [];
      if (customers && customers.length > 0) {
        customers.forEach((c) => {
          buttons.push([Markup.button.callback(`🏢 ${c.customer_name}`, `CUSTOMER_${c.id}`)]);
        });
      }

      // Luôn hiển thị lựa chọn tạo mới khách hàng bằng từ khóa vừa nhập
      buttons.push([Markup.button.callback(`➕ Thêm KH mới: "${text}"`, "ADD_NEW_CUSTOMER")]);
      buttons.push([Markup.button.callback("❌ Hủy", "MAIN_MENU")]);

      const msg = customers.length > 0
        ? `Tìm thấy ${customers.length} khách hàng khớp từ khóa. Vui lòng chọn hoặc thêm mới:`
        : `Không tìm thấy khách hàng nào có tên "${text}". Bạn có muốn thêm mới khách hàng này không?`;

      return ctx.reply(msg, Markup.inlineKeyboard(buttons));
    } catch (err) {
      console.error(err);
      return ctx.reply("❌ Lỗi xảy ra khi tìm kiếm khách hàng.", cancelMenu());
    }
  }
});

// ======================================
// CHỌN KHÁCH HÀNG CÓ SẴN -> TẠO BÁO GIÁ
// ======================================
bot.action(/^CUSTOMER_(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const customerId = Number(ctx.match[1]);

  try {
    const session = await getSession(ctx.from.id);
    if (!session) return ctx.reply("Phiên làm việc đã hết hạn. Vui lòng bắt đầu lại.", mainMenu());

    const customer = await getCustomerById(customerId);
    const payload = session.payload;

    payload.customer_id = customer.id;
    payload.customer_name = customer.customer_name;
    payload.term_id = 1; // Mặc định Term ID = 1 theo chuẩn V5

    // Dùng hàm helper mới tạo để xử lý tạo BG và trả file Word
    await handleCreateQuoteAndReply(ctx, payload);
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Đã xảy ra lỗi khi tải thông tin khách hàng.", mainMenu());
  }
});

// ======================================
// THÊM MỚI KHÁCH HÀNG -> TẠO BÁO GIÁ
// ======================================
bot.action("ADD_NEW_CUSTOMER", async (ctx) => {
  await ctx.answerCbQuery();

  try {
    const session = await getSession(ctx.from.id);
    if (!session) return ctx.reply("Phiên làm việc đã hết hạn. Vui lòng bắt đầu lại.", mainMenu());

    const keyword = session.payload.search_keyword;
    if (!keyword) return ctx.reply("❌ Không tìm thấy tên khách hàng cần tạo. Vui lòng thử lại.", mainMenu());

    // Tạo khách hàng mới trong cơ sở dữ liệu
    const customer = await createCustomer(keyword);

    const payload = session.payload;
    payload.customer_id = customer.id;
    payload.customer_name = customer.customer_name;
    payload.term_id = 1; // Mặc định Term ID = 1

    // Dùng hàm helper mới tạo để xử lý tạo BG và trả file Word
    await handleCreateQuoteAndReply(ctx, payload);
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Đã xảy ra lỗi khi tạo khách hàng.", mainMenu());
  }
});

// ======================================
// VERCEL SERVERLESS HANDLER
// ======================================
export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, service: "HAST Quote Bot", status: "running" });
  }

  try {
    await bot.handleUpdate(req.body);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
