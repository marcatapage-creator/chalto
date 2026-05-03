import { chromium } from "playwright"
import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const storageState = path.join(__dirname, "../e2e/.auth/user.json")
const outDir = path.join(__dirname, "../public/screenshots")

const BASE = "http://localhost:3000"

const viewports = [
  { name: "desktop", width: 1280, height: 800,  url: "/dashboard" },
  { name: "tablet",  width: 768,  height: 1024, url: "/dashboard" },
  { name: "mobile",  width: 390,  height: 844,  url: "/dashboard" },
]

const themes = ["light", "dark"]

async function hideDevOverlay(page) {
  await page.evaluate(() => {
    document.querySelector("nextjs-portal")?.remove()
    document.querySelector("[data-next-badge]")?.remove()
    document.querySelector("#__next-build-watcher")?.remove()
  })
}

async function applyTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem("theme", t)
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(t)
    document.documentElement.style.colorScheme = t
  }, theme)
  await page.waitForTimeout(400)
}

const browser = await chromium.launch()

for (const theme of themes) {
  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      storageState,
      colorScheme: theme,
    })
    const page = await ctx.newPage()
    await page.goto(`${BASE}${vp.url}`)
    await page.waitForLoadState("networkidle")
    await applyTheme(page, theme)
    await hideDevOverlay(page)
    await page.waitForTimeout(300)
    await page.screenshot({
      path: `${outDir}/${vp.name}-${theme}.png`,
      clip: { x: 0, y: 0, width: vp.width, height: vp.height },
    })
    console.log(`✓ ${vp.name}-${theme} (${vp.width}×${vp.height})`)
    await ctx.close()
  }
}

await browser.close()
console.log("Done → public/screenshots/")
