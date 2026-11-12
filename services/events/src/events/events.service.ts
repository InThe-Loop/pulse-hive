import {
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
    ServiceUnavailableException,
} from '@nestjs/common';

import * as amqp from 'amqplib';

export const EVENT_EXCHANGE = 'pulsehive.events';

export interface DomainEvent<T = Record<string, unknown>> {
    eventId: string;
    eventType: string;
    version: number;
    occurredAt: string;
    data: T;
}

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(EventsService.name);

    private connection?: amqp.ChannelModel;
    private channel?: amqp.ConfirmChannel;

    private reconnectTimer?: ReturnType<typeof setTimeout>;
    private reconnectAttempt = 0;
    private reconnecting = false;
    private shuttingDown = false;

    async onModuleInit(): Promise<void> {
        await this.connect();
    }

    async onModuleDestroy(): Promise<void> {
        this.shuttingDown = true;

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }

        await this.close();
    }

    private async connect(): Promise<void> {
        if (
            this.shuttingDown ||
            this.reconnecting ||
            this.channel
        ) {
            return;
        }

        const rabbitMqUrl = process.env.RABBITMQ_URL;

        if (!rabbitMqUrl) {
            throw new Error(
                'RABBITMQ_URL environment variable is not configured',
            );
        }

        this.reconnecting = true;

        try {
            this.logger.log('Connecting to RabbitMQ...');

            const connection = await amqp.connect(rabbitMqUrl);

            if (this.shuttingDown) {
                await connection.close();
                return;
            }

            this.connection = connection;

            connection.on('error', (error) => {
                this.logger.error(
                    'RabbitMQ connection error',
                    error instanceof Error ? error.stack : String(error),
                );
            });

            connection.on('close', () => {
                this.logger.warn('RabbitMQ connection closed');
                this.handleDisconnect(connection);
            });

            const channel = await connection.createConfirmChannel();

            if (this.shuttingDown) {
                await channel.close();
                await connection.close();
                return;
            }

            this.channel = channel;

            channel.on('error', (error) => {
                this.logger.error(
                    'RabbitMQ channel error',
                    error instanceof Error ? error.stack : String(error),
                );
            });

            channel.on('close', () => {
                this.logger.warn('RabbitMQ confirm channel closed');
                this.handleDisconnect(connection);
            });

            await channel.assertExchange(EVENT_EXCHANGE, 'topic', {
                durable: true,
            });

            this.reconnectAttempt = 0;

            this.logger.log(
                `RabbitMQ connected. Confirm channel ready. Exchange: ${EVENT_EXCHANGE}`,
            );
        } catch (error) {
            this.logger.error(
                'RabbitMQ connection failed',
                error instanceof Error ? error.stack : String(error),
            );

            await this.close();
            this.scheduleReconnect();
        } finally {
            this.reconnecting = false;
        }
    }

    private handleDisconnect(
        connection: amqp.ChannelModel,
    ): void {
        if (this.connection !== connection) {
            return;
        }

        this.connection = undefined;
        this.channel = undefined;

        void connection.close().catch(() => undefined);

        this.scheduleReconnect();
    }

    private scheduleReconnect(): void {
        if (this.shuttingDown || this.reconnectTimer) {
            return;
        }

        const delay = Math.min(
            1000 * Math.pow(2, this.reconnectAttempt),
            30000,
        );

        this.reconnectAttempt++;

        this.logger.warn(
            `RabbitMQ reconnect scheduled in ${delay / 1000} seconds`,
        );

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = undefined;
            void this.connect();
        }, delay);
    }

    private async close(): Promise<void> {
        const channel = this.channel;
        const connection = this.connection;

        this.channel = undefined;
        this.connection = undefined;

        try {
            await channel?.close();
        } catch {
            this.logger.debug('RabbitMQ channel already closed');
        }

        try {
            await connection?.close();
        } catch {
            this.logger.debug('RabbitMQ connection already closed');
        }
    }

    async publish<T extends Record<string, unknown>>(
        event: DomainEvent<T>,
    ): Promise<void> {
        const channel = this.channel;

        if (!channel) {
            throw new ServiceUnavailableException(
                'RabbitMQ channel is not available',
            );
        }

        const message = Buffer.from(JSON.stringify(event));

        try {
            channel.publish(
                EVENT_EXCHANGE,
                event.eventType,
                message,
                {
                    persistent: true,
                    contentType: 'application/json',
                    contentEncoding: 'utf-8',
                    messageId: event.eventId,
                    timestamp: Date.now(),
                    type: event.eventType,
                    headers: {
                        version: event.version,
                    },
                },
            );

            await channel.waitForConfirms();

            this.logger.log(
                `Published and confirmed event ${event.eventType} (${event.eventId})`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to publish event ${event.eventType} (${event.eventId})`,
                error instanceof Error ? error.stack : String(error),
            );

            throw new ServiceUnavailableException(
                'RabbitMQ could not confirm the published event',
            );
        }
    }
}
