import fs from "fs";
import path from "path";
import os from "os";

import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

export async function generateRentalQuote(
  quote,
  machine,
  details,
  terms
) {

  const templatePath =
    path.join(
      process.cwd(),
      "templates",
      "rental_quote.docx"
    );

  const content =
    fs.readFileSync(
      templatePath,
      "binary"
    );

  const zip =
    new PizZip(content);

  const doc =
    new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true
    });

  const summarySpecs =
    details
      .filter(
        x =>
          x.spec_group ===
          "SUMMARY"
      )
      .map(
        x =>
          `${x.spec_name}: ${x.spec_value}`
      )
      .join("\n");

  const fullSpecs =
    details
      .filter(
        x =>
          x.spec_group ===
          "DETAIL"
      )
      .map(
        x =>
          `${x.spec_name}: ${x.spec_value}`
      )
      .join("\n");

  const termsText =
`
Thanh toán:
${terms.payment_term}

Giao hàng:
${terms.delivery_term}

Bảo hành:
${terms.warranty_term}

Khác:
${terms.other_term}
`;

  doc.render({

    BRAND:
      machine.brand,

    QUOTE_NO:
      quote.quote_no,

    QUOTE_DATE:
      new Date()
      .toLocaleDateString("vi-VN"),

    CUSTOMER_NAME:
      quote.customer_name,

    MODEL:
      machine.model,

    CONDITION:
      "Máy cũ",

    RENTAL_PRICE:
      Number(
        quote.rental_price
      ).toLocaleString("vi-VN"),

    COPY_PRICE:
      Number(
        quote.bw_copy_price
      ).toLocaleString("vi-VN"),

    FREE_COPIES:
      machine.free_copies,

    RENTAL_TERM:
      machine.rental_term,

    SUMMARY_SPECS:
      summarySpecs,

    TERMS:
      termsText,

    FULL_SPECS:
      fullSpecs

  });

  const buffer =
    doc
      .getZip()
      .generate({
        type: "nodebuffer"
      });

  const fileName =
    `${quote.quote_no}.docx`;

  // Sử dụng thư mục tạm của hệ điều hành (thích hợp cho môi trường Vercel serverless)
  const outputPath =
    path.join(
      os.tmpdir(),
      fileName
    );

  fs.writeFileSync(
    outputPath,
    buffer
  );

  return outputPath;

}
