/**
 * Created by sorivevol on 10/5/16.
 */
'use strict';
import mysql from 'mysql';

class MySQL {

    static _instance;

    static get Instance() {
        if (!MySQL._instance) {
            MySQL._instance = new this();
        }
        return MySQL._instance;
    }

    constructor() {
        this.pools = [];
    }

    connect(server, configs) {
        return new Promise((resolve, reject) => {
            if (!this.pools[server]) {
                let pool = mysql.createPool({
                    host: configs.host,
                    user: configs.user,
                    password: configs.password,
                    database: configs.database
                });
                pool.getConnection((err, connection) => {
                    if (err) {
                        return reject(err);
                    }
                    this.pools[server] = connection;
                    resolve(connection);
                });
            }
            resolve(this.pools[server]);
        });
    }

    query(server, queryPhrase, params) {
        return new Promise((resolve, reject) => {
            this.pools[server].query(queryPhrase, params, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                // And done with the connection.
                this.pools[server].release();
                resolve(rows);
            });
        });
    }
}

export default MySQL.Instance;