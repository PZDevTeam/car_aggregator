// infrastructure/browser/browser.factory.ts
import puppeteer, { Browser, Page } from 'puppeteer';

export class BrowserFactory {
  private static browser: Browser;

  static async getPage(): Promise<Page> {
    const browser = await puppeteer.launch({
      headless: false, // Меняйте на false для отладки (чтобы видеть браузер)
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Для работы в некоторых средах (например, Docker)
    });

    const page = await browser.newPage();

    // Устанавливаем User-Agent, чтобы выглядеть как обычный браузер
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    );

    this.browser = browser;

    return page;
  }

  static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
