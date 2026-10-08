import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { mapColumns, parseCsv, parseDate, parseMoney, toCsv } from "./csv";
import { cleanAffiliate, ds24Signature, verifyDs24Signature } from "./ds24";

describe("csv", () => {
  it("parses quotes, escaped quotes, CRLF and BOM", () => {
    const rows = parseCsv('﻿a,b,c\r\n"x, y","he said ""hi""",3\r\n\r\n');
    expect(rows).toEqual([
      ["a", "b", "c"],
      ["x, y", 'he said "hi"', "3"],
    ]);
  });

  it("round-trips and neutralizes formulas", () => {
    expect(toCsv([["=SUM(A1)", 5, "a,b"]])).toBe(`'=SUM(A1),5,"a,b"\r\n`);
  });

  it("dates in each order, rejecting impossible ones", () => {
    expect(parseDate("2026-03-05", "mdy")).toBe("2026-03-05");
    expect(parseDate("03/05/2026", "mdy")).toBe("2026-03-05");
    expect(parseDate("03/05/2026", "dmy")).toBe("2026-05-03");
    expect(parseDate("3/5/26", "mdy")).toBe("2026-03-05");
    expect(parseDate("02/30/2026", "mdy")).toBeNull();
    expect(parseDate("soon", "mdy")).toBeNull();
  });

  it("money strings", () => {
    expect(parseMoney("$1,234.50")).toBe(1234.5);
    expect(parseMoney("(12.00)")).toBe(-12);
    expect(parseMoney("")).toBe(0);
    expect(Number.isNaN(parseMoney("abc"))).toBe(false);
  });

  it("maps headers by alias, ignoring case and punctuation", () => {
    const m = mapColumns(["RO Date", "Service Type", "Parts Revenue"], {
      date: ["date", "ro date"],
      category: ["category", "service type"],
      missing: ["nope"],
    });
    expect(m).toEqual({ date: 0, category: 1, missing: -1 });
  });
});

describe("digistore24 signature", () => {
  const params = { order_id: "ABC123", event: "on_payment", email: "a@b.com", custom: "", product_id: "42" };

  it("matches the reference algorithm", () => {
    // Sorted keys, empty values skipped, each `key=value` followed by the passphrase.
    const s = "email=a@b.compevent=on_paymentporder_id=ABC123pproduct_id=42p";
    const expected = createHash("sha512").update(s).digest("hex").toUpperCase();
    expect(ds24Signature(params, "p")).toBe(expected);
  });

  it("verifies and rejects", () => {
    const signed = { ...params, sha_sign: ds24Signature(params, "secret") };
    expect(verifyDs24Signature(signed, "secret")).toBe(true);
    expect(verifyDs24Signature({ ...signed, product_id: "43" }, "secret")).toBe(false);
    expect(verifyDs24Signature(signed, "")).toBe(false);
    expect(verifyDs24Signature(params, "secret")).toBe(false);
  });

  it("cleans affiliate ids", () => {
    expect(cleanAffiliate("john_doe-1")).toBe("john_doe-1");
    expect(cleanAffiliate("<script>")).toBeNull();
    expect(cleanAffiliate("")).toBeNull();
  });
});
