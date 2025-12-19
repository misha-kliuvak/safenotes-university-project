import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { Logger } from '@/modules/logger/logger';
import { NotificationService } from '@/modules/notification/notification.service';
import { TokenService } from '@/modules/token/token.service';

@WebSocketGateway({
  namespace: 'notification',
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger: Logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly tokenService: TokenService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('Notification Gateway initialized');
  }

  private getUserFromAuthToken(socket: Socket) {
    const token = socket.handshake.headers.auth_token as string;
    if (!token) {
      return undefined;
    }

    return this.tokenService.decode(token);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client Connected: ${client.id}`);
    const user = this.getUserFromAuthToken(client);

    client.data.user = user;
    if (!user) {
      client.emit('server_message', 'No auth token found! Disconnecting...');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected: ${client.id}`);
  }

  @SubscribeMessage('request_notifications')
  listenForMessages(@ConnectedSocket() socket: Socket) {
    const user = socket.data.user;
    const notifications = this.notificationService.getUserAll(user.id);
    socket.emit('receive_notifications', notifications);
  }
}
