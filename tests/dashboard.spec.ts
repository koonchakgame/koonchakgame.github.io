import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.route("**/api/stock-quotes", (route) => route.fulfill({ json: {
    quotes: ["SNDK", "NVDA", "NBIS", "PLTR"].map((symbol) => ({
      key: symbol, label: symbol, symbol, unit: "$", description: "Yahoo Finance",
      value: 150, changePercent: 2, asOf: "2026-10-02T18:00:00Z", stale: false,
    })),
  } }));
  await page.route("**/api/live", (route) =>
    route.fulfill({
      json: {
        today: "2026-10-03",
        timezone: "Asia/Bangkok",
        refreshedAt: "2026-10-02T18:00:00Z",
        market: {
          data: [
            "US 10Y",
            "US 30Y",
            "Nasdaq",
            "VIX",
            "DXY",
            "WTI",
            "Brent",
            "Gold",
          ].map((label, i) => ({
            key: label,
            label,
            symbol: label,
            unit: "",
            description: "Test quote",
            value: 100 + i,
            changePercent: 1,
            asOf: "2026-10-02T18:00:00Z",
            stale: false,
          })),
          fetchedAt: "2026-10-02T18:00:00Z",
          stale: false,
        },
        calendar: {
          data: [
            {
              title: "Today US release",
              currency: "USD",
              date: "2026-10-02T18:30:00Z",
              impact: "High",
              actual: "",
              forecast: "4%",
              previous: "3%",
            },
            {
              title: "Previous day release",
              currency: "EUR",
              date: "2026-10-02T12:00:00Z",
              impact: "Low",
              actual: "2%",
              forecast: "",
              previous: "",
            },
          ],
          fetchedAt: "2026-10-02T18:00:00Z",
          stale: false,
        },
        news: {
          data: [
            {
              title: "Today market headline",
              url: "https://finance.yahoo.com/news/test",
              publishedAt: "2026-10-02T18:30:00Z",
            },
            {
              title: "Old market headline",
              url: "https://finance.yahoo.com/news/old",
              publishedAt: "2026-10-01T12:00:00Z",
            },
          ],
          fetchedAt: "2026-10-02T18:00:00Z",
          stale: false,
        },
      },
    }),
  );
});
test("dashboard reads the Excel snapshots and opens a complete stock detail", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".stock-card")).toHaveCount(4);
  await expect(page.locator(".market-tile")).toHaveCount(8);
  await page
    .locator(".stock-card")
    .filter({ has: page.getByRole("heading", { name: "SNDK", exact: true }) })
    .click();
  await expect(page).toHaveURL(/\/stocks\/SNDK/);
  await expect(page.locator(".detail-price")).toContainText("$112.48");
  await expect(
    page.getByRole("heading", { name: "Trading plan" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Technical indicators" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "News summary" }),
  ).not.toBeVisible();
  await page.locator("summary").filter({ hasText: "News summary" }).click();
  await expect(page.getByRole("heading", { name: "News summary" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Analysis summary" }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await expect(page.locator(".page-heading .badge").first()).toHaveText(
    "BUY ZONE",
  );
  await page
    .getByRole("navigation", { name: "Analysis snapshots" })
    .getByRole("link", { name: /30 Sept 2026/ })
    .click();
  await expect(page.locator(".detail-price")).toContainText("$109.11");
  await expect(page.locator(".page-heading .badge").first()).toHaveText("WAIT");
  await page.locator("summary").filter({ hasText: "Macro overview" }).click();
  await expect(
    page.locator(".market-tile").filter({ hasText: "US 10Y" }),
  ).toContainText("4.12%");
  expect(errors).toEqual([]);
});
test("today calendar uses Bangkok dates, supports week and filters, and excludes old news", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("Today US release", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Previous day release", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Today market headline", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Old market headline", { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".calendar-table tbody td").nth(4)).toHaveText("—");
  await page.getByRole("button", { name: "สัปดาห์นี้", exact: true }).click();
  await expect(
    page.getByText("Previous day release", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("สกุลเงิน").selectOption("EUR");
  await expect(page.getByText("Today US release", { exact: true })).toHaveCount(
    0,
  );
  await page.getByLabel("ผลกระทบ").selectOption("High");
  await expect(page.locator(".calendar-table tbody tr")).toHaveCount(0);
});
test("automatic refresh updates bonds, calendar and news in one snapshot", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const bond = page.locator(".market-tile").filter({ hasText: "US 10Y" });
  await expect(bond.locator("dd")).toHaveText("100.00");
  let release!: () => void;
  const ready = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/live", async (route) => {
    await ready;
    await route.fulfill({ json: {
      today: "2026-10-03", timezone: "Asia/Bangkok",
      refreshedAt: "2026-10-02T18:01:00Z",
      market: { data: [{ key: "US 10Y", label: "US 10Y", symbol: "^TNX", unit: "%", description: "Test quote", value: 4.5, changePercent: 1, asOf: "2026-10-02T18:01:00Z", stale: false }], stale: false, fetchedAt: "2026-10-02T18:01:00Z" },
      calendar: { data: [{ title: "Updated release", currency: "USD", impact: "High", date: "2026-10-02T18:30:00Z", actual: "5%", forecast: "4%", previous: "3%" }], stale: false, fetchedAt: "2026-10-02T18:01:00Z" },
      news: { data: [{ title: "Updated headline", url: "https://finance.yahoo.com/news/updated", publishedAt: "2026-10-02T18:30:00Z" }], stale: false, fetchedAt: "2026-10-02T18:01:00Z" },
    } });
  });
  await page.clock.runFor(60_000);
  await expect(bond.locator("dd")).toHaveText("100.00");
  await expect(page.getByText("Today US release", { exact: true })).toBeVisible();
  release();
  await expect(bond.locator("dd")).toHaveText("4.50%");
  await expect(page.getByText("Updated release", { exact: true })).toBeVisible();
  await expect(page.getByText("Updated headline", { exact: true })).toHaveCount(0);
});
test("latest stock prices appear beside names and in historical articles, refresh and retain failed quotes", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const card = page.locator(".stock-card").filter({ has: page.getByRole("heading", { name: "SNDK", exact: true }) });
  await expect(card.locator(".live-stock-price strong")).toHaveText("$150.00");
  await expect(card.locator(".card-price strong")).toHaveText("$112.48");
  await page.route("**/api/stock-quotes", (route) => route.fulfill({ json: { quotes: [{ key: "SNDK", label: "SNDK", symbol: "SNDK", unit: "$", description: "Yahoo", value: 155, changePercent: 3, asOf: "2026-10-02T18:01:00Z", stale: false }] } }));
  await page.clock.runFor(60_000);
  await expect(card.locator(".live-stock-price strong")).toHaveText("$155.00");
  await card.click();
  await expect(page.locator(".stock-title-row .live-stock-price strong")).toHaveText("$155.00");
  await page.getByRole("navigation", { name: "Analysis snapshots" }).getByRole("link", { name: /30 Sept 2026/ }).click();
  await expect(page.locator(".detail-price")).toContainText("$109.11");
  await expect(page.locator(".live-stock-price strong")).toHaveText("$155.00");
  await page.route("**/api/stock-quotes", (route) => route.fulfill({ status: 503, json: { error: "Unavailable" } }));
  await page.clock.runFor(60_000);
  await expect(page.locator(".live-stock-price")).toContainText("ข้อมูลเดิม");
  await expect(page.locator(".live-stock-price strong")).toHaveText("$155.00");
});
test("watchlist search and support dashboard use current quotes", async ({ page }) => {
  await page.route("**/api/stock-quotes", (route) => route.fulfill({ json: { quotes: [{ key: "SNDK", label: "SNDK", symbol: "SNDK", unit: "$", description: "Yahoo", value: 114, changePercent: 1, asOf: "2026-10-02T18:01:00Z", stale: false }] } }));
  await page.goto("/");
  await expect(page.locator(".support-card")).toHaveCount(1);
  await expect(page.locator(".support-card")).toContainText("SNDK");
  await expect(page.locator(".support-card")).toContainText("3.80%");
  const search = page.getByRole("searchbox", { name: "ค้นหาหุ้น" });
  await search.fill("nvda");
  await expect(page.locator(".stock-card")).toHaveCount(1);
  await expect(page.locator(".stock-card h2")).toHaveText("NVDA");
  await search.fill("unknown");
  await expect(page.locator(".stock-card")).toHaveCount(0);
  await search.fill("");
  await expect(page.locator(".stock-card")).toHaveCount(4);
  await expect(page.locator(".headline-panel")).toHaveCount(0);
  await page.locator(".support-card").click();
  await expect(page.getByRole("heading", { name: "Data status & sources" })).toHaveCount(0);
  await expect(page.locator(".analysis-fold").filter({ hasText: "News summary" })).not.toHaveAttribute("open");
});
test("support dashboard keeps distant stocks and last quotes after refresh failure", async ({ page }) => {
  await page.clock.install();
  await page.route("**/api/stock-quotes", (route) => route.fulfill({ json: { quotes: [{ key: "SNDK", label: "SNDK", symbol: "SNDK", unit: "$", description: "Yahoo", value: 150, changePercent: 1, asOf: "2026-10-02T18:01:00Z", stale: false }] } }));
  await page.goto("/");
  const dashboard = page.locator(".support-dashboard");
  await expect(dashboard.locator(".support-card")).toHaveCount(1);
  await expect(dashboard).toContainText("ยังห่างแนวรับ");
  await expect(dashboard.locator(".count")).toHaveText("0");
  await page.route("**/api/stock-quotes", (route) => route.fulfill({ status: 503, json: { error: "Unavailable" } }));
  await page.clock.runFor(60_000);
  await expect(dashboard).toContainText("ข้อมูลเดิม · รออัปเดตราคา");
  await expect(dashboard.locator(".support-card")).toHaveCount(1);
  await expect(dashboard.locator(".support-card")).toContainText("$150.00");
});
test("missing symbols and missing snapshots return 404", async ({ page }) => {
  expect((await page.goto("/stocks/UNKNOWN"))?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "ไม่พบข้อมูล" }),
  ).toBeVisible();
  expect(
    (await page.goto("/stocks/SNDK?snapshot=2025-01-01T16:00:00"))?.status(),
  ).toBe(404);
});
for (const width of [390, 768, 1440]) {
  test(`dashboard and detail fit viewport ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/stocks/NVDA"]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(route === "/" ? "dashboard.png" : "analysis.png"), fullPage: true });
    }
  });
}
