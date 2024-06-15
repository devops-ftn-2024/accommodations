import amqp from "amqplib/callback_api.js";
import { AccommodationService } from "../service/accommodation-service";
import { UsernameDTO } from "../types/user";

export class EventQueue {
    private rabbit;
    constructor(private accommodationService: AccommodationService) {
        this.rabbit = amqp;
        this.init();
    }

    execute(payload: any, channelName: string) {
        this.rabbit.connect(`amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/`, function(error, connection) {
            if (error) {
                throw error;
            }

        connection.createChannel(function (error1, channel) {
                if (error1) {
                    throw error1;
                }

                var data = JSON.stringify(payload);
                channel.assertQueue(channelName, {
                    durable: false
                });

                channel.sendToQueue(channelName, Buffer.from(data));
            });
        });
    };

    private init() {
        amqp.connect(`amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}/`, (error, connection) => {
            if (error) {
                throw error;
            }

            connection.createChannel((error1, channel) => {
                if (error1) {
                    throw error1;
                }

                const exchangeName = 'username-updated';
                channel.assertExchange(exchangeName, 'fanout', { durable: true });
    
                channel.assertQueue('', { exclusive: true }, (error2, q) => {
                    if (error2) {
                        throw error2;
                    }
    
                    channel.bindQueue(q.queue, exchangeName, '');
    
                    console.log(`Waiting for messages in ${q.queue}. To exit press CTRL+C`);
    
                    channel.consume(q.queue, (payload) => {
                        console.log(`Updating username: ${payload}`);
                        if (payload !== null) {
                            const usernames: UsernameDTO = JSON.parse(payload.content.toString());
                            console.log(`Updating username: ${JSON.stringify(usernames)}`);
                            this.accommodationService.updateUsername(usernames);
                        }
                    }, { noAck: true });
                });
            });
        });
    }
}