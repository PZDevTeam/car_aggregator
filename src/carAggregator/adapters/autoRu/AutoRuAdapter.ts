/* eslint-disable @typescript-eslint/unbound-method */
import { Page } from 'puppeteer';
import { BrowserFactory } from 'src/carAggregator/browserFactory';
import { promisifyQueue } from 'src/utils/helpers/promisifyQueue';

type MockAutoRuData = {
  title: string;
  price: string;
  location: string;
  year: string;
  detailUrl: string;
  mileage: string;
};

class AutoRuAdapter {
  pageNumber: number;
  page: Page;

  constructor(pageNumber: number) {
    this.pageNumber = pageNumber;
  }

  async listPageAggregate() {
    const url =
      'https://auto.ru/moskva/cars/ford/focus/used/?pts_status=1&resolution_filter=is_owners_ok&resolution_filter=is_legal_ok';
    const page = await BrowserFactory.getPage();

    this.page = page;

    await page.goto(url);
    await page.waitForSelector('[class="ListingItem__description"]');

    const items = await page.evaluate(() => {
      const result: MockAutoRuData[] = [];
      const titles = document.querySelectorAll(
        '[class="ListingItemTitle ListingItem__title"]',
      );
      const prices = document.querySelectorAll(
        '[class="ListingItemPriceNew__content-HAVf2"]',
      );
      const locations = document.querySelectorAll(
        '[class="MetroListPlace MetroListPlace_nowrap ListingItem__place"]',
      );
      const years = document.querySelectorAll('[class="ListingItem__year"]');
      const detailUrls = document.querySelectorAll(
        '[class="Link ListingItemTitle__link"]',
      );
      const mileages = document.querySelectorAll(
        '[class="ListingItem__kmAge"]',
      );
      for (let i = 0; i < titles.length; i++) {
        result.push({
          title: (titles?.[i] as HTMLDivElement)?.innerText,
          price: (prices?.[i] as HTMLDivElement)?.innerText,
          location: (locations?.[i] as HTMLSpanElement)?.innerText,
          year: (years?.[i] as HTMLDivElement)?.innerText,
          detailUrl: (detailUrls?.[i] as HTMLLinkElement)?.href,
          mileage: (mileages?.[i] as HTMLDivElement)?.innerText,
        });
      }
      return result;
    });
    return items;
  }

  async detailInfoAggregate(carUrl: string) {
    await this.page.goto(carUrl);
    await this.page.waitForSelector('[class="CardHead"]');
    const detailInfo = await this.page.evaluate(() => {
      const ownersCount = (
        document.querySelector(
          '[class="CardInfoSummarySimpleRow__content-IIKcj"]',
        ) as HTMLDivElement
      )?.innerText
        .slice(0, 2)
        .trimEnd();
      return {
        ownersCount,
      };
    });
    return detailInfo;
  }

  async getFullInfo() {
    try {
      const mainInfo = await this.listPageAggregate();
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;
      const func = this.detailInfoAggregate;
      const queue = mainInfo.map((el) => el.detailUrl);
      const fullInfo = await promisifyQueue({
        argumentsQueue: queue,
        func,
        context: that,
      });

      return mainInfo.map(
        ({ detailUrl, location, mileage, price, title, year }, index) => {
          const ownersCount = fullInfo[index];

          return {
            title,
            year,
            mileage,
            price,
            location,
            detailUrl,
            ownersCount,
          };
        },
      );
    } catch (error) {
      console.log(`error while detailInfo ${error}`);
      //   return this.getFullInfo();
    }
  }
}

export { AutoRuAdapter };
