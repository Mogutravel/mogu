export function esBot(ua: string) {
  return (
    !ua ||
    /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|curl|wget/i.test(ua)
  );
}

export function dispositivo(ua: string) {
  if (/iphone|ipad|ios/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "otro";
}
