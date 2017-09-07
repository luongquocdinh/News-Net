/**
 * Created by sorivevol on 7/25/16.
 */
"use strict";
import ProtoBuf from 'protobufjs';

class Proto {

    static _instance;

    static get Instance() {
        if (!Proto._instance) {
            Proto._instance = new this();
        }
        return Proto._instance;
    }

    constructor() {
        this.messages = {};
    }

    _load(name) {
        return new Promise((resolve, reject) => {
            // console.log(name);
            if (!this.messages[name]) {
                return ProtoBuf.load(__dirname + "/../../proto/" + name + ".proto").then(root => {
                    let messageName = name.charAt(0).toUpperCase() + name.slice(1);
                    this.messages[name] = root.lookup(messageName);
                    resolve(this.messages[name]);
                }).catch(e => {
                    reject(e);
                });
            } else {
                resolve(this.messages[name]);
            }
        });
    }

    //
    set(name, data) {
        return this._load(name).then(m => {
            let message = m.create(data);
            return m.encode(message).finish();
        });
    }

    //
    get(name, data) {
        return this._load(name).then(m => {
            return m.decode(data);
        });
    }
}
export default Proto.Instance;