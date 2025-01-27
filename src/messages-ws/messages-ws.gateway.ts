import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { WsMessage } from './dtos/ws-message';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces';
import { UAParser } from 'ua-parser-js';




/**
  * @class MessagesWsGateway
  * 
  * @author R.M
  * @version 1.0
  *
  * @description
  * Este gateway gestiona las conexiones y desconexiones de clientes mediante WebSocket, así como el envío y recepción de mensajes en tiempo real. 
  * Implementa las interfaces `OnGatewayConnection` y `OnGatewayDisconnect` para controlar la conexión y desconexión de clientes. 
  * También identifica el tipo de dispositivo (móvil, tableta o escritorio) que realiza la conexión.
  *
  * @decorator `@WebSocketGateway({ cors: true })`
  * Habilita un servidor WebSocket con soporte para CORS.
  *
  */
@WebSocketGateway({ cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  private readonly uaParser = new UAParser();


  /**
    * @property {Server} wss
    * Instancia del servidor WebSocket para gestionar y emitir eventos a los clientes conectados.
    * 
    * @decorator `@WebSocketServer`
    */
  @WebSocketServer() wss: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}


  /**
    * @method handleConnection
    * 
    * @author R.M
    * @version 1.0
    *
    * @description
    * Maneja la conexión de un cliente al servidor WebSocket.
    * Valida el token JWT del cliente, registra al cliente en el sistema, y emite un evento global con la lista actualizada de clientes conectados.
    *
    * @param {Socket} client - Instancia del cliente conectado.
    * 
    * @throws {Error} Desconecta al cliente si el token JWT es inválido o si ocurre algún error durante la conexión.
   */
  async handleConnection(client: Socket) {

    const token = client.handshake.headers.authorization as string;
    const deviceType = this._connexionDeviceType(client);
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



  /**
   * @method handleDisconnect
   * 
   * @author R.M
   * @version 1.0
   *
   * @description
   * Maneja la desconexión de un cliente, eliminándolo del registro de clientes conectados y notificando a los demás clientes.
   *
   * @param {Socket} client - Instancia del cliente desconectado.
   */
  handleDisconnect(client: Socket) {

    this.messagesWsService.removeClient(client);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }



  /**
    * @method onMessageFormClient
    *
    * @description
    * Escucha los mensajes enviados por un cliente y los retransmite a todos los clientes conectados mediante el evento `message-from-server`.
    *
    * @decorator `@SubscribeMessage('message-form-client')`
    * 
    * @param {Socket} client - Cliente que envió el mensaje.
    * @param {WsMessage} payload - Contenido del mensaje enviado.
    */
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


    /**
      * @method _connexionDeviceType
      * 
      * @author R.M
      * @version 1.0
      * 
      * @private
      * 
      * @description
      * Determina el tipo de dispositivo que realiza la conexión basándose en el encabezado `User-Agent`.
      * 
      * @param {Socket} client - Instancia del cliente conectado.
      * @returns {'mobile' | 'tablet' | 'desktop'} - Tipo de dispositivo detectado.
      */
    private _connexionDeviceType(client: Socket): 'mobile' | 'tablet' | 'desktop' {
      const userAgent: string = client.handshake.headers['user-agent'] || '';
      const deviceType = this._detectDevice(userAgent);

      return deviceType;
    }


    /**
      * @method _detectDevice
      * 
      * @author R.M
      * @version 1.0
      * 
      * @private
      * 
      * @description
      * Analiza el `User-Agent` proporcionado para identificar el tipo de dispositivo.
      * 
      * @param {string} userAgent - Cadena del `User-Agent` del cliente.
      * @returns {'mobile' | 'tablet' | 'desktop'} - Tipo de dispositivo detectado.
      */
    private _detectDevice(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
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
