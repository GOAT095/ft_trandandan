import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    entities: ['dist/**/*.entity.{ts,js}'],
    logger: 'file',
    synchronize: true, // never use TRUE in productio
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
