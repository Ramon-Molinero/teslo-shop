import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { WsMessage } from './dtos/ws-message';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';
import { UAParser } from 'ua-parser-js';


@WebSocketGateway({ cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  private readonly uaParser = new UAParser();

  @WebSocketServer() wss: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}


  async handleConnection(client: Socket) {

    const token = client.handshake.headers.authorization as string;
    const deviceType = this.connexionDeviceType(client);
    let payload: JwtPayload


    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id, deviceType);
      
    } catch (error) {
      client.disconnect();
      return;
    }
    
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
    
    
  }



  handleDisconnect(client: Socket) {

    this.messagesWsService.removeClient(client);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }



  @SubscribeMessage('message-form-client')
    onMessageFormClient(client: Socket, payload: WsMessage){
      
      //! Emite unicamente al cliente que envio el mensaje
      // client.emit('message-from-server', {
      //   fullName: 'yo',
      //   message: payload.message || 'no message',
      // });

      //! Emitir a todos menos al cliente que envio el mensaje
      // client.broadcast.emit('message-from-server', {
      //   fullName: 'yo',
      //   message: payload.message || 'no message',
      // });

      //! Emitir a todos los clientes conectados
      this.wss.emit('message-from-server', {
        fullName: this.messagesWsService.getUserFullNameBySocketId(client.id),
        message: payload.message || 'no message',
      });
        
    }

    connexionDeviceType(client: Socket): 'mobile' | 'tablet' | 'desktop' {
      const userAgent: string = client.handshake.headers['user-agent'] || '';
      const deviceType = this.detectDevice(userAgent);

      return deviceType;
    }

    private detectDevice(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
      const device = this.uaParser.setUA(userAgent).getDevice();

      switch (device.type) {
        case 'mobile':
          return 'mobile';
        case 'tablet':
          return 'tablet';
        default:
          return 'desktop';
      }

    }


}
