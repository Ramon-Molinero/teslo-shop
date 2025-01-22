import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { WsMessage } from './dtos/ws-message';


@WebSocketGateway({ cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;
  constructor(private readonly messagesWsService: MessagesWsService) {}


  handleConnection(client: Socket) {
    this.messagesWsService.registerClient(client);
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
        fullName: 'yo',
        message: payload.message || 'no message',
      });
        
    }


}
