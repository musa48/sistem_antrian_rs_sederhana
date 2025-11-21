import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AntrianModule } from './antrian/antrian.module';
import { Antrian } from './antrian/antrian.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,      
      username: 'postgres',
      password: '',
      database: 'antrian_rs',
      // autoLoadModels: true,
      synchronize: true,
      models: [Antrian], 
    }),
    AntrianModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}