/**
 * Created by sorivevol on 7/20/16.
 */
import redis from 'redis';
import bluebird from 'bluebird';
import EventEmitter from 'events';

class Redis extends EventEmitter {
    static _instance;

    static get Instance() {
        if (!Redis._instance) {
            Redis._instance = new this();
        }
        return Redis._instance;
    }

    constructor() {
        super();
        this.connections = {};
        this.lastDB = {};
    }

    connect(configs) {
        return new Promise((resolve, reject) => {
            if (!this.connections[configs.name]) {
                bluebird.promisifyAll(redis.RedisClient.prototype);
                bluebird.promisifyAll(redis.Multi.prototype);

                if (!configs.options) {
                    configs.options = {};
                }
                configs.options.retry_strategy = (options) => {
                    // console.log(options.error);
                    if (options.error) {
                        if (options.error.code === "ENOTFOUND") {
                            return this.emit("error", "Redis connection failed");
                        }
                        if (options.error.code === 'ECONNREFUSED') {
                            // End reconnecting on a specific error and flush all commands with a individual error
                            return this.emit("error", "The server refused the connection");
                        }
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        // End reconnecting after a specific timeout and flush all commands with a individual error
                        return this.emit("error", "Retry time exhausted");
                    }

                    if (options.times_connected > 10) {
                        // End reconnecting with built in error
                        return undefined;
                    }
                    // reconnect after
                    return Math.max(options.attempt * 100, 3000);
                };

                this.connections[configs.name] = redis.createClient(configs.port, configs.host, configs.options);
                this.connections[configs.name].on("error", (error) => {
                    this.emit("error", error);
                });

                this.connections[configs.name].once("connect", () => {
                    this.emit("info", "REDIS CONNECTED");
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    // TODO : wrong
    client(name, db) {
        return this.connections[name].selectAsync(db).then(() => {
            return this.connections[name];
        });
        // if (this.lastDB[name] != db) {
        //     this.lastDB[name] = db;
        //     return this.connections[name].selectAsync(db).then(() => this.connections[name]);
        // }
        // return new Promise((resolve, reject) => resolve(this.connections[name]));
    }
}

export default Redis.Instance;