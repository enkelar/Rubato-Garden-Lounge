const BOT_PATTERNS = [
  /facebookexternalhit/i,
  /Facebot/i,
  /Twitterbot/i,
  /WhatsApp/i,
  /TelegramBot/i,
  /Slackbot/i,
  /LinkedInBot/i,
  /Discordbot/i,
  /Pinterest/i,
  /redditbot/i,
  /Applebot/i,
];

export function isSocialBot(userAgent = '') {
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export default isSocialBot;