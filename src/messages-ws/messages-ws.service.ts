import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

interface ConnectedClients {
    [id: string]: {
        socket: Socket;
        user: User;
        mobile: boolean;
        tablet: boolean;
        desktop: boolean;
    };
}

@Injectable()
export class MessagesWsService {
    private connectedClients: ConnectedClients = {};


    /**
      * @constructor
      * 
      * @description
      * Constructor de la clase que utiliza la inyección de dependencias para inicializar el repositorio de usuarios.
      * Este repositorio se utiliza para interactuar con la base de datos y realizar operaciones relacionadas con la entidad `User`.
      * 
      * @param {Repository<User>} userRepository - Repositorio de TypeORM para la entidad `User`.
      * 
      * @decorator `@InjectRepository(User)`
      * Inyecta automáticamente el repositorio asociado a la entidad `User` en la clase.
      */
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }



    /**
      * @author R.M
      * @version 1.0
      * @method registerClient
      *
      * @description
      * Registra un cliente en el sistema de WebSocket, asociándolo a un usuario específico y verificando si el usuario ya tiene una conexión activa en el mismo tipo de dispositivo.
      * 
      * ### Proceso:
      * 1. **Buscar Usuario**: Consulta la base de datos para encontrar al usuario asociado al `userId` proporcionado.
      * 2. **Validar Usuario**:
      *    - Lanza un error si el usuario no existe.
      *    - Lanza un error si el usuario no está activo.
      * 3. **Generar Objeto de Conexión**:
      *    - Crea un objeto que contiene la información del cliente, el usuario y el tipo de dispositivo.
      * 4. **Verificar Conexión Activa**:
      *    - Llama a `checkUserConnection` para desconectar cualquier conexión activa existente del usuario en el mismo tipo de dispositivo.
      * 5. **Registrar Cliente**:
      *    - Agrega el cliente al listado de clientes conectados (`connectedClients`).
      * 
      * @param {Socket} client - Instancia del socket del cliente conectado.
      * @param {string} userId - Identificador único del usuario que se conecta.
      * @param {'mobile' | 'tablet' | 'desktop'} deviceType - Tipo de dispositivo desde el que se realiza la conexión.
      * 
      * @throws {Error} Si el usuario no existe o no está activo.
      */
    async registerClient(
        client: Socket,
        userId: string,
        deviceType: 'mobile' | 'tablet' | 'desktop',
    ) {
        try {
            const user = await this.userRepository.findOneBy({ id: userId });

            if (!user) throw new Error('User not found');
            if (!user.isActive) throw new Error('User is not active');

            const socketObject = this.generateObjetByconectedClients(client, user, deviceType);

            await this.checkUserConnection(socketObject, deviceType);

            this.connectedClients[client.id] = socketObject;


        } catch (error) {
            console.error('Error registering client:', error.message);
        }
    }


    /**
      * @method removeClient
      * 
      * @author R.M
      * @version 1.0
      * 
      * @description
      * Elimina un cliente del sistema de WebSocket, desconectándolo del servidor.
      * 
      * @param {Socket} client - Cliente que se desconecta.
      */
    removeClient(client: Socket) {
        delete this.connectedClients[client.id];
    }


    /**
      * @method getConnectedClients
      * 
      * @author R.M
      * @version 1.0
      * 
      * @description
      * Devuelve un array con los identificadores de los clientes conectados al servidor.
      * 
      * @returns {string[]} Array con los identificadores de los clientes conectados.
      */
    getConnectedClients(): string[] {

        return Object.keys(this.connectedClients);
    }


    /**
      * @method getUserFullNameBySocketId
      * 
      * @author R.M
      * @version 1.0
      * 
      * @description
      * Devuelve el nombre completo del usuario asociado a un identificador de socket.
      * 
      * @param {string} socketId - Identificador del socket del cliente.
      * 
      * @returns {string} Nombre completo del usuario.
      */
    getUserFullNameBySocketId(socketId: string): string {
        return this.connectedClients[socketId].user.fullName;
    }


    /**
      * @method sendMessageToUser
      * 
      * @author R.M
      * @version 1.0
      * 
      * @description
      * Envía un mensaje a un usuario específico, utilizando el identificador del socket del cliente.
      * 
      * @param {string} socketId - Identificador del socket del cliente.
      * @param {string} message - Mensaje a enviar.
      */
    private generateObjetByconectedClients(
        client: Socket,
        user: User,
        deviceType: 'mobile' | 'tablet' | 'desktop',
    ) {
        const socketObject = {
            socket: client,
            user,
            mobile: deviceType === 'mobile',
            tablet: deviceType === 'tablet',
            desktop: deviceType === 'desktop',
        };
        
        return socketObject;
    }


    /**
      * @method checkUserConnection
      * @author R.M
      * @version 1.0
      * 
      * @description
      * Verifica si un usuario ya tiene una conexión activa en el mismo tipo de dispositivo y desconecta la conexión existente.
      * 
      * @param {any} socketObject - Objeto que contiene la información del cliente, el usuario y el tipo de dispositivo.
      * @param {'mobile' | 'tablet' | 'desktop'} deviceType - Tipo de dispositivo desde el que se realiza la conexión.
      */
    private checkUserConnection(socketObject: any, deviceType: 'mobile' | 'tablet' | 'desktop') {


        for (const clientId of Object.keys(this.connectedClients)) {

            const connectedClient = this.connectedClients[clientId];

            if (connectedClient.user.id === socketObject.user.id) {

                if (
                    (connectedClient.mobile && deviceType === 'mobile') ||
                    (connectedClient.tablet && deviceType === 'tablet') ||
                    (connectedClient.desktop && deviceType === 'desktop')
                ) {
                    console.log(
                        `Disconnecting existing connection for user ${socketObject.user.id} on device type ${deviceType}`
                    );
                    connectedClient.socket.disconnect();
                    delete this.connectedClients[clientId];
                    break;
                }
            }
        }

    }


}
