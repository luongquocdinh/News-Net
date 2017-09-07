/**
 * Created by sorivevol on 4/29/16.
 */
'use strict';
import Memcached from 'memcached';
import EventEmitter from 'events';

class Caching extends EventEmitter {

    static _instance;

    static get Instance() {
        if (!Caching._instance) {
            Caching._instance = new this();
        }
        return Caching._instance;
    }

    constructor() {
        super();
        this.connection = null;
    }

    connect(configs) {
        return new Promise((resolve, reject) => {
            if (!this.connection) {
                this.emit("info", "[MEMCACHED] Connecting");
                this.connection = new Memcached(configs['servers'], configs['options']);
                this.connection.on('failure', detail => {
                    this.emit("error", "[MEMCACHED] Failure", detail);
                });
                this.connection.on('issue', detail => {
                    this.emit("error", "[MEMCACHED] Issue", detail);
                });
                this.connection.on('reconnecting', detail => {
                    this.emit("info", "[MEMCACHED] Reconnecting", detail);
                });
                this.connection.on('reconnect', detail => {
                    this.emit("info", "[MEMCACHED] Reconnect", detail);
                });
                this.connection.on('remove', detail => {
                    this.emit("info", "[MEMCACHED] Remove", detail);
                });
            }
            resolve(this.connection);
        });
    }

    get(key) {
        return new Promise((resolve, reject) => {
            this.connection.get(key, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            })
        });
    }

    getMulti(keys) {
        return new Promise((resolve, reject) => {
            this.connection.getMulti(key, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            })
        });
    }

    set(key, value, lifetime = 2592000) {
        return new Promise((resolve, reject) => {
            this.connection.set(key, value, lifetime, err => {
                if (err) {
                    return reject(err);
                }
                resolve(value);
            })
        });
    }

    delete(key) {
        return new Promise((resolve, reject) => {
            this.connection.del(key, err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            })
        });
    }
}


export default Caching.Instance;