import "server-only";
export function siteUrl() {
  const fallback = process.env.NODE_ENV === "production"
    ? "https://heros.dolphinxstudio.com"
    : "http://127.0.0.1:3000";
  const url = new URL(process.env.HEROS_SITE_URL?.trim() || fallback);
  if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname))
    throw new Error("Cần cấu hình URL HTTPS cho website.");
  return url.origin;
}
export function checkoutEnabled() {
  return process.env.HEROS_CHECKOUT_ENABLED === "true";
}
