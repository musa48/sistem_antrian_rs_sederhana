import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import { AntrianService } from './antrian.service';

@WebSocketGateway({
  cors: { origin: "*" },
})

export class AntrianGateway {
  @WebSocketServer()
  server: Server;
  constructor(private antrianService: AntrianService) {
    console.log("WS SERVER STARTED ON PORT 3010");
  }
  async broadcastUpdate(event: string) {
    const data = await this.antrianService.getDisplayAntrians();
    this.server.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          event: 'tokenUpdate',
          data: data,
          message: event,
        }));
      }
    });
  }
}