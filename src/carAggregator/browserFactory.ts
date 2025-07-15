import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Инициализация StealthPlugin перед запуском браузера

export class BrowserFactory {
  private static browser: Browser;
  
  static async getPage(): Promise<Page> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
    puppeteer.use(StealthPlugin());
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled', // Важно!
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
        '--lang=ru-RU,ru', // Язык браузера
      ],
      ignoreDefaultArgs: ['--enable-automation'], // Отключает флаги автоматизации
    });

    const page = await browser.newPage();

    // Переопределяем navigator.webdriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    this.browser = browser;
    return page;
  }
}
