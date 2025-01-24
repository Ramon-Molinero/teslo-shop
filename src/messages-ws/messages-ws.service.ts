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

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    
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


    removeClient(client: Socket) {
        delete this.connectedClients[client.id];
    }


    getConnectedClients(): string[] {

        return Object.keys(this.connectedClients);
    }


    getUserFullNameBySocketId(socketId: string): string {
        return this.connectedClients[socketId].user.fullName;
    }


    private generateObjetByconectedClients(
        client: Socket,
        user: User,
        deviceType: 'mobile' | 'tablet' | 'desktop',
    ) {
        const socketObject = {
            socket: client,
            user,
            mobile: deviceType === 'mobile' ? true : false,
            tablet: deviceType === 'tablet' ? true : false,
            desktop: deviceType === 'desktop' ? true : false,
        };

        return socketObject;
    }


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
