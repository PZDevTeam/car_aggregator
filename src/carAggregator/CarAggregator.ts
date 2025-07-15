import { Page } from 'puppeteer';
import { AvitoAdapter } from './adapters/avito/AvitoAdapter';

const avitoData = new AvitoAdapter(1);
export class CarAggregator {
  async aggregateCars() {

    const aggregate = await avitoData.startAggregation();

    return aggregate
  }
}

// type AggregateCarsProps = {
//   service: string;
//   carInfo: CarInfo[];
// };
