import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CarAggregator } from './CarAggregator';

const carAggregator = new CarAggregator();

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_30_SECONDS) // Каждые 30 секунд
  async handleCron() {
    const cars = await carAggregator.aggregateCars();

    console.log(cars, 'my cars');
  }
}
