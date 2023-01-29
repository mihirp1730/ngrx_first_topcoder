import { Module } from '@nestjs/common';
import { AppHealthService } from './app-health.service';

@Module({
  controllers: [],
  providers: [AppHealthService],
  exports: [AppHealthService]
})
export class AppHealthModule {}
