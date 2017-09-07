/**
 * Created by sorivevol on 8/1/16.
 */
"use strict";
import elasticsearch from 'elasticsearch';
import EventEmitter from 'events';

class Elastic extends EventEmitter {
    static _instance;

    static get Instance() {
        if (!Elastic._instance) {
            Elastic._instance = new this();
        }
        return Elastic._instance;
    }

    constructor() {
        super();
        this.connections = {};
    }

    connect(configs) {
        return new Promise(resolve => {
            let name = configs.name;
            if (!this.connections[name]) {
                this.emit('info','ELASTIC CONNECTED');
                this.connections[name] = new elasticsearch.Client(configs);
            }
            resolve(this.connections[name]);
        });
    }

    ping(name) {
        return this.connections[name].ping();
    }

    get(name, id, index, type) {
        if (!index && !type) {
            return this.connections[name].search({
                body: {
                    query: {
                        term: {
                            _id: id
                        }
                    }
                }
            });
        } else {
            return this.connections[name].get({
                index: index,
                type: type,
                id: id
            }).catch(error => {
                return null;
            })
        }

    }

    search(name, index, type, page, perPage, data) {
        if (!page || page <= 0) {
            page = 1;
        }

        let search = {
            index: index,
            type: type,
            from: (page - 1) * perPage,
            size: perPage,
            body: data
        };

        return this.connections[name].search(search);
    }

    init(name, index, type, data) {
        return this.existsIndex(name, index).then(exists => {
            if (!exists) {
                return this.initIndex(name, index).then(() => {
                    return this.putMapping(name, index, type, data);
                });
            }
        });
    }

    create(name, index, type, data) {
        // let info = Object.assign({}, data);
        // info.index = index;
        // info.type = type;
        let info = {
            index,
            type,
            body: data
        };
        if (data.id) {
            info.id = data.id;
            delete info.body.id;
        }
        return this.connections[name].index(info);
    }

    existsIndex(name, index) {
        return this.connections[name].indices.exists({
            index
        });
    }

    initIndex(name, index) {
        return this.connections[name].indices.create({
            index,
            body: {
                settings: {
                    index: {
                        number_of_shards: 1,
                        number_of_replicas: 0
                    }
                }
            }
        });
    }


    getMapping(name, index, type) {
        return this.connections[name].indices.getMapping({
            index,
            type
        });
    }

    putMapping(name, index, type, data) {
        return this.connections[name].indices.putMapping({
            index,
            type,
            body: data
        });
    }

    count(name, index, type, data) {
        return this.connections[name].count({
            index,
            type,
            body: data
        });
    }

    update(name, index, type, id, data) {
        let info = {
            index: index,
            type: type,
            id: id,
            body: {
                doc: data
            }
        };
        return this.connections[name].update(info);
    }

    delete() {

    }

    suggest() {

    }
}

export default Elastic.Instance;