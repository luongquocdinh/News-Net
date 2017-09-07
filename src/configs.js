/**
 * Created by sorivevol on 11/22/16.
 */
'use strict';
class Configs {
    static _instance;

    static get Instance() {
        if (!Configs._instance) {
            Configs._instance = new this();
        }
        return Configs._instance;
    }

    constructor() {
        this.env = "";
    }

    configure(env) {
        this.env = env;
    }

    get(name) {
        if (!this[name]) {
            this[name] = require("../configs/" + name + "_" + this.env + ".json");
        }
        return this[name];
    }
}

export default Configs.Instance;