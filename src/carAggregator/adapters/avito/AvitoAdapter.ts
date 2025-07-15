/* eslint-disable @typescript-eslint/unbound-method */
import { Page } from 'puppeteer';
import { ParsedData } from '../../analytics/api/types';
import { BrowserFactory } from '../../browserFactory';
import { parseByInterestCars } from './parsers/parseByInterestCars';
import { promisifyQueue } from 'src/utils/helpers/promisifyQueue';
import { CarInfo } from 'src/carAggregator/api/types';

class AvitoAdapter {
  pageNumber: number;
  page: Page;
  processAggregation: boolean;

  constructor(pageNumber: number) {
    this.pageNumber = pageNumber;
  }

  async listPageAggregate() {
    this.processAggregation = true;
    const url = `https://www.avito.ru/moskva/avtomobili?context=H4sIAAAAAAAA_wEmANn_YToxOntzOjE6InkiO3M6MTY6IjVSU1VWalM4ZmQ2bHVhbVQiO301M17tJgAAAA&f=ASgBAQECA0SeEqC4ArCzFP6hjwPs6hSSmZADAUCE0RKEgMnaEajJ2hGSydoRnMnaEaLJ2hH8yNoRpsnaEYjJ2hEBRcaaDBx7ImZyb20iOjUwMDAwMCwidG8iOjEwMDAwMDB9&p=${this.pageNumber}&q=автомобили+с+пробегом+от+собственника&radius=3000&searchRadius=3000`;
    const page = await BrowserFactory.getPage();

    this.page = page;

    await page.goto(url, {
      waitUntil: 'domcontentloaded', // Ждём загрузки DOM
      timeout: 30000, // 30 секунд таймаут
    });

    await page.waitForSelector('[data-marker="page-title"]', {
      timeout: 30000,
    });

    const items: ParsedData[] = await page.evaluate(() => {
      const results: ParsedData[] = [];
      const titles = document.querySelectorAll('[data-marker="item-title"]');
      const prices = document.querySelectorAll('[data-marker="item-price"]');
      const speciphication = document.querySelectorAll(
        '[data-marker="item-specific-params"]',
      );
      const location = [...document.querySelectorAll('[class]')].filter((el) =>
        [...el.classList].some((className) => /^geo-root-\w+$/.test(className)),
      );

      for (let i = 0; i < titles.length; i++) {
        results.push({
          title: (titles?.[i] as HTMLDivElement)?.innerText,
          price: (prices[i] as HTMLDivElement)?.innerText,
          speciphication: (speciphication[i] as HTMLDivElement)?.innerText,
          location: (location[i] as HTMLDivElement)?.innerText,
          detailUrl: (titles?.[i] as HTMLLinkElement)?.href,
        });
      }

      return results;
    });

    const parseCars = items
      .map((item) => parseByInterestCars(item))
      .filter((el) => !!el);

    return parseCars;
  }

  async unpackCarDetails(carUrl: string) {
    await this.page.goto(carUrl, {
      waitUntil: 'domcontentloaded', // Ждём загрузки DOM
      timeout: 30000, // 30 секунд таймаут
    });

    await this.page.waitForSelector('[data-marker="item-view/title-info"]', {
      timeout: 30000,
    });

    const carDetails = await this.page.evaluate(() => {
      const carsParams = document.querySelector(
        '[data-marker="item-view/item-params"]',
      ) as HTMLDivElement;

      const ownersCount = carsParams?.children?.[1]
        ?.children?.[5] as HTMLDivElement;

      const year = carsParams?.children?.[1]?.children[0] as HTMLDivElement;

      const state = carsParams?.children[1].children[6] as HTMLDivElement;

      // const [element] = await page.$x(`//*[contains(text(), '${text}')]`);

      // const titles  =document.querySelectorAll('h3')

      // const ownersCount = (carsParams as any)?.children[1].children[5]
      //   .innerText;

      // return {
      //   ownersCount: ownersCount?.replace('Владельцев по ПТС:', '')?.trim(),
      //   year: year?.replace('Год выпуска:', '')?.trim(),
      //   status: state?.replace('Состояние:', '')?.trim(),
      // };

      return {
        ownersCount: +ownersCount?.innerText
          ?.replace('Владельцев по ПТС:', '')
          ?.trim(),
        year: +year?.innerText?.replace('Год выпуска:', '')?.trim(),
        state: state?.innerText?.replace('Состояние:', '')?.trim(),
      };
    });

    return carDetails;
  }

  async startAggregation() {
    if (this.processAggregation) {
      return null;
    }
    this.processAggregation = true;
    try {
      console.log('Agggregation started');
      const carsList = await this.listPageAggregate();

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const that = this;

      const func = this.unpackCarDetails;

      const argumentsQueue = carsList.map((car) => car.detailUrl);

      const details = await promisifyQueue({
        argumentsQueue,
        func,
        context: that,
      });

      this.processAggregation = false;

      return carsList.map(
        (
          { brand, model, price, mileage, location, detailUrl, year },
          index,
        ) => {
          const priceDetails = details[index];

          return {
            brand,
            model,
            price,
            speciphication: '',
            detailUrl,
            location,
            mileage,
            ownersCount: priceDetails.ownersCount,
            year: year || 0,
            state: priceDetails.state,
            priceEvaulationPercent: 0,
            dtpCount: 0,
            checkHistoryData: '',
          };
        },
      ) as CarInfo[];
    } catch (error) {
      console.log(`Abort, trying to repeat  ${error}`);
      return this.startAggregation();
    }
  }
}

// type parseByInterestCarsValue = {
//   brand: string;
//   model: string;
//   price: number;
//   mileage: number;
//   location: string;
//   detailUrl: string;
//   year: number | null;
// };

export { AvitoAdapter };
