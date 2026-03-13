import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  /**
   * GET /
   * Health check / greeting endpoint.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

}
