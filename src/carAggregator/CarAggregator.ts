import { AvitoAdapter } from './adapters/avito/AvitoAdapter';

export class CarAggregator {
  async aggregateCars() {
    const avitoData = new AvitoAdapter(1);

    const aggregate = await avitoData.startAggregation();

    return {
      test: aggregate,
    };
  }
}

// type AggregateCarsProps = {
//   service: string;
//   carInfo: CarInfo[];
// };
