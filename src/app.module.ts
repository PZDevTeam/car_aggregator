import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { CarAggregatorService } from './carAggregator/carAggregator.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, CarAggregatorService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
