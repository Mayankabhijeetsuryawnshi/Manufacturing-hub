/**
 * Application Configuration
 * Resolves values from environment variables or localStorage to keep secrets out of GitHub.
 * 
 * To run locally with secrets, create a file named `.env` in the root folder and add:
 * VITE_GOOGLE_SHEET_URL=your_google_sheet_url_here
 * VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
 */

export const CONFIG = {
  // Brand Configuration
  APP_NAME: (import.meta.env.VITE_APP_NAME || "") || "Manufacturing Hub",
  COMPANY_NAME: (import.meta.env.VITE_COMPANY_NAME || "") || "Production Suite",
  BOT_USERNAME: (import.meta.env.VITE_BOT_USERNAME || "") || "YourTelegramBot",

  // Your Google Apps Script Web App URL (ends with /exec)
  GOOGLE_SHEET_URL: 
    (import.meta.env.VITE_GOOGLE_SHEET_URL || "") || 
    (() => {
      try {
        return localStorage.getItem('VITE_GOOGLE_SHEET_URL') || "";
      } catch {
        return "";
      }
    })(),
};

