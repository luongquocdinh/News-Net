/**
 * Created by sorivevol on 11/16/16.
 */
'use strict';

import EventEmitter from 'events';
import amqp from 'amqplib';

class Rabbitmq extends EventEmitter {
    static _instance;

    static get Instance() {
        if (!Rabbitmq._instance) {
            Rabbitmq._instance = new this();
        }
        return Rabbitmq._instance;
    }

    constructor() {
        super();
        this.connections = {};
    }

    connect(configs) {
        if (!this.connections[configs.name]) {
            this.connections[configs.name] = amqp.connect(configs.host, configs.options).then(conn => {
                return conn.createChannel();
            }).catch(error => {
                this.emit("error", "RabbitMQ connection failed");
            });
        }
        return this.connections[configs.name];
    }

    enqueue(name, queueName, data, priority = 1) {
        return this.connections[name].then(ch => {
            return ch.assertQueue(queueName, {durable: true, maxPriority: 10}).then(ok => {
                // console.log("priority",priority);
                return ch.sendToQueue(queueName, data, {persistent: true, priority});
                // return ch.close();
            });
        }).catch(error => {
            this.emit("error", error);
        });
    }

    subscribe(name, queueName, callback, callError) {
        this.connections[name].then(ch => {
            return ch.assertQueue(queueName, {durable: true, maxPriority: 10}).then(ok => {
                return ch.prefetch(1).then(() => {
                    return ch.consume(queueName, (msg) => {
                        if (msg !== null) {
                            // TODO : check callback is promise
                            // let finished = false;
                            if (callback) {
                                let timeout = setTimeout((m) => {
                                    console.log("ack timeout");
                                    ch.ack(m);
                                }, 20000, msg);

                                callback(msg.content).then(() => {
                                    ch.ack(msg);
                                    clearTimeout(timeout);
                                }).catch(error => {
                                    ch.ack(msg);
                                    clearTimeout(timeout);
                                    if (callError) {
                                        callError(error);
                                    }
                                });
                            } else {
                                ch.ack(msg);
                            }
                        }
                    }, {noAck: false});
                });
            });
        }).catch(error => {
            this.emit("error", error);
        });
    }

    checkQueue(name, queueName) {
        return this.connections[name].then(ch => {
            return ch.assertQueue(queueName, {durable: true}).then(ok => {
                return ch.checkQueue(queueName);
            });
        }).catch(error => {
            this.emit("error", error);
        });
    }
}
export default Rabbitmq.Instance;