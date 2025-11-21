import { Module } from '@nestjs/common';
import { AntrianService } from './antrian.service';
import { AntrianController } from './antrian.controller';
import { AntrianGateway } from './antrian.gateway';
import { SequelizeModule } from '@nestjs/sequelize';
import { Antrian } from './antrian.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Antrian])
  ],
  controllers: [AntrianController],
  providers: [AntrianService, AntrianGateway],
  exports: [AntrianService],
})
export class AntrianModule {}
