import { AutoRuAdapter } from './adapters/autoRu/AutoRuAdapter';
import { AvitoAdapter } from './adapters/avito/AvitoAdapter';
import { DromAdapter } from './adapters/drom/DromAdapter';

// const avitoData = new AvitoAdapter(1);
const dromData = new DromAdapter();
export class CarAggregator {
  async aggregateCars() {
    await dromData.startAggregation();

    // const aggregate = await avitoData.startAggregation();

    // return aggregate
  }
}
