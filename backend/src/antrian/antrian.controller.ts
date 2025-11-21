import { Controller, Get, Post, Body } from '@nestjs/common';
import { AntrianService } from './antrian.service';
import { AntrianGateway } from './antrian.gateway';

@Controller('antrian')
export class AntrianController {
  constructor(
    private service: AntrianService,
    private gateway: AntrianGateway,
  ) {}

  @Post('generate')
  async generateNewantrian() {
    const antrian = await this.service.generateNewAntrian();
    this.gateway.broadcastUpdate('New antrian generated!');
    return antrian;
  }

  @Post('call')
  async callNextantrian(@Body('idAntri') id_antrian: number) {
    const antrian = await this.service.callNextAntrian(id_antrian);
    if (antrian) this.gateway.broadcastUpdate('Antrian called!');
    return antrian;
  }

  @Post('skip')
  async skipAntrian(@Body('idAntri') id_antrian: number) {
    const antrian = await this.service.skipAntrian(id_antrian);
    if (antrian) this.gateway.broadcastUpdate('Antrian skipped!');
    return antrian;
  }

  @Post('repeat')
  async repeatAntrian(@Body('idAntri') id_antrian: number) {
    const antrian = await this.service.repeatAntrian(id_antrian);
    if (antrian) this.gateway.broadcastUpdate('Antrian repeated!');
    return antrian;
  }

  @Post('finish')
  async finishAntrian(@Body('idAntri') id_antrian: number) {
    const antrian = await this.service.finishAntrian(id_antrian);
    if (antrian) this.gateway.broadcastUpdate('Antrian finished!');
    return antrian;
  }

  @Get('waiting')
  async getWaitingList() {
    return this.service.getWaitingTokens();
  }

  @Get('display')
  async getDisplayData() {
    return this.service.getDisplayAntrians();
  }
}
