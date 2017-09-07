/**
 * Created by sorivevol on 7/19/16.
 */
'use strict';
import mongoose, {
    Schema,
    Types
} from 'mongoose';
import EventEmitter from 'events';

mongoose.Promise = global.Promise;

class Mongo extends EventEmitter {
    static _instance;

    static get Instance() {
        if (!Mongo._instance) {
            Mongo._instance = new this();
        }
        return Mongo._instance;
    }

    constructor() {
        super();
        this.connections = {};
    }

    connect(configs) {
        return new Promise((resolve, reject) => {
            if (!this.connections[configs.name]) {
                // mongoose.Promise = global.Promise;
                this.connections[configs.name] = mongoose.createConnection(configs.uri, configs.options);
                this.connections[configs.name].on('error', error => {
                    this.emit("error", error);
                    reject(error);
                });
                this.connections[configs.name].once('open', () => {
                    this.emit("info", "MONGO CONNECTED", configs.name, configs.uri);
                    resolve(this.connections[configs.name]);
                });
            } else {
                resolve(this.connections[configs.name]);
            }
        });
    }

    get schema() {
        return Schema;
    }

    createMongoSchema(data, options = {}) {
        return new Schema(data, options);
    }

    createMongoIndex(schema, index, data) {
        schema.index(index, data);
    }

    getMongoModel(name, collection, schema, data) {
        return new Promise((resolve, reject) => {
            if (!this.connections[name]) {
                reject("MONGO NOT CONNECTED");
            }
            let model = this.connections[name].model(collection, schema, collection);
            if (!data) {
                return resolve(model);
            }
            let res = new model(data);
            return resolve(res);
        });
    }

    ObjectId() {
        return Types.ObjectId;
    }

    Mixed(){
        return Types.Mixed;
    }
}

export default Mongo.Instance;