/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/unbound-method */
import { Page } from 'puppeteer';
import { BrowserFactory } from 'src/carAggregator/browserFactory';
import { parseByInterestCars } from './parsers/parseByInterestCars';
import { promisifyQueue } from 'src/utils/helpers/promisifyQueue';
import { CarInfo } from 'src/carAggregator/api/types';

class DromAdapter {
  page: Page;
  processAggregation: boolean;
  async listPageAggregate(pageNumber: number = 1) {
    const page = await BrowserFactory.getPage();

    this.page = page;

    // await page.goto('https://auto.drom.ru/nissan/teana/');

    await page.goto(`https://auto.drom.ru/all/page${pageNumber}/`, {
      waitUntil: 'domcontentloaded', // Ждём загрузки DOM
      timeout: 30000, // 30 секунд таймаут
    });

    await page.waitForSelector('#candy_center_top', {
      timeout: 30000,
    });

    const items = await page.evaluate(() => {
      const results: {
        title: string;
        price: string;
        location: string;
        detailUrl: string;
        speciphication: string;
      }[] = [];
      const titles = document.querySelectorAll('[data-ftid="bull_title"]');
      const preciphication = document.querySelectorAll(
        '[data-ftid="component_inline-bull-description"]',
      );
      const prices = document.querySelectorAll('[data-ftid="bull_price"]');
      const locations = document.querySelectorAll(
        '[data-ftid="bull_location"]',
      );

      for (let i = 0; i < titles.length; i++) {
        results.push({
          title: (titles[i] as HTMLDivElement).textContent || '',
          price: (prices[i] as HTMLDivElement).textContent || '',
          speciphication:
            (preciphication[i] as HTMLDivElement).textContent || '',
          location: (locations[i] as HTMLDivElement).textContent || '',
          detailUrl: (titles[i] as HTMLLinkElement).href || '',
        });

        //   console.log(titles[i].textContent);
      }
      return results;
    });

    return items.map((item) => parseByInterestCars(item)).filter((el) => !!el);
  }

  async unpackCarDetails(carUrl: string) {
    await this.page.goto(carUrl, {
      waitUntil: 'domcontentloaded', // Ждём загрузки DOM
      timeout: 30000, // 30 секунд таймаут
    });

    const detalisation = await this.page.evaluate(() => {
      const autoDetails = (document.querySelector('table') as HTMLTableElement)
        .tBodies[0];

      const owners = (autoDetails as any)?.children?.[7]?.cells[1].innerText;
      const color = (autoDetails as any)?.children[5].cells[1].innerText;

      return {
        ownersCount: parseFloat(owners),
        state: 'new',
        postCreationDate: new Date().toISOString(),
        complectation: '',
        color: color,
      };
    });

    return detalisation;
  }

  async startAggregation() {
    if (this.processAggregation) {
      return null;
    }
    this.processAggregation = true;
    try {
      // const carsList = await this.listPageAggregate();
      const aggregatePage = this.listPageAggregate;
      const that = this;

      const args = new Array(2).fill('').map((_, i) => i + 1);

      console.log(args);

      const carsList = (
        await promisifyQueue({
          argumentsQueue: args,
          func: aggregatePage,
          context: that,
        })
      ).flat();

      const func = this.unpackCarDetails;

      const argumentsQueue = carsList.map((car) => car.detailUrl);

      console.log(argumentsQueue, 'queur');

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
            detailUrl,
            location,
            mileage,
            year: year || 0,
            priceEvaulationPercent: 0,
            dtpCount: 0,
            speciphication: '',
            checkHistoryData: '',
            power: '',
            engineCopacity: '',
            state: priceDetails.state,
            color: priceDetails.color,
            ownersCount: priceDetails.ownersCount,
            createdPostDate: priceDetails.postCreationDate,
            complectation: priceDetails.complectation,
          };
        },
      ) as CarInfo[];
    } catch (error) {
      console.log(`Abort, trying to repeat  ${error}`);
      return this.startAggregation();
    }
  }
}

export { DromAdapter };
