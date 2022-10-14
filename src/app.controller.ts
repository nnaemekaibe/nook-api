import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/notion/:id')
  async getNotionDoc(@Param() params): Promise<any> {
    const blocks = await this.appService.getNotionDoc(params.id);
    return { data: blocks };
  }
  @Get('/search')
  async search(): Promise<any> {
    const results = await this.appService.search();
    return { data: results };
  }
}
