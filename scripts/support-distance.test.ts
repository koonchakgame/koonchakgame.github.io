import { test } from "node:test";
import assert from "node:assert/strict";
import { nearestSupport } from "../lib/support-distance";
import type { StockAnalysis } from "../types/stock";

test("support distance uses latest price and nearest intact support", () => {
  const stock = { support1: 96, support2: 90, support3: null } as StockAnalysis;
  assert.deepEqual(nearestSupport(stock, 100), { low: 96, high: 96, distance: 4 });
  assert.deepEqual(nearestSupport(stock, 95), { low: 90, high: 90, distance: 5 / 95 * 100 });
  assert.equal(nearestSupport(stock, 85), null);
  assert.equal(nearestSupport(stock, NaN), null);
  assert.equal(nearestSupport(stock, 0), null);
});
test("support zones use upper edge and report zero while inside the zone", () => {
  const stock = { levels: [{ side: "support", low: 94, high: 97 }, { side: "resistance", low: 101, high: 105 }] } as StockAnalysis;
  assert.equal(nearestSupport(stock, 100)?.distance, 3);
  assert.equal(nearestSupport(stock, 96)?.distance, 0);
  assert.equal(nearestSupport(stock, 93), null);
});
