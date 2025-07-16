import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CarAggregator } from './CarAggregator';
import { PrismaService } from 'src/prisma.service';
import { CarInfo } from './api/types';

const carAggregator = new CarAggregator();

@Injectable()
export class CarAggregatorService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(CarAggregatorService.name);

  @Cron(CronExpression.EVERY_30_SECONDS) // Каждые 30 секунд
  async handleCron() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    carAggregator.aggregateCars();

    // if (!cars) {
    //   return;
    // }

    // for (const carData of cars) {
    //   const existingCar = await this.prisma.car.findUnique({
    //     where: { detailUrl: carData.detailUrl },
    //   });

    //   if (!existingCar) {
    //     return;
    //   }

    //   // Если цена изменилась — обновляем, сохраняя старую
    //   if (existingCar.price !== carData.price) {
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    //     this.prisma.priceHistory.create({
    //       data: {
    //         carId: existingCar.id,
    //         // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //         price: existingCar.price,
    //         createdAt: new Date(),
    //       },
    //     });
    //     // this.prisma.priceHistory.create({
    //     //   data: {
    //     //     carId: existingCar.id,
    //     //     price: existingCar.price,
    //     //   },
    //     // });
    //   }
    // }

    // await this.prisma.car.createMany({
    //   data: cars.map(
    //     ({
    //       brand,
    //       model,
    //       speciphication,
    //       location,
    //       detailUrl,
    //       mileage,
    //       price,
    //       ownersCount,
    //       year,
    //       dtpCount,
    //       state,
    //       color,
    //       engineCopacity,
    //       complectation,
    //       power,
    //     }) => ({
    //       brand,
    //       model,
    //       speciphication,
    //       location,
    //       detailUrl,
    //       mileage: mileage || 0,
    //       ownersCount: ownersCount,
    //       year,
    //       price,
    //       state: state,
    //       power,
    //       engineCopacity,
    //       color,
    //       complectation,
    //       dtpCount,
    //     }),
    //   ),
    //   skipDuplicates: true,
    // });
  }
}
