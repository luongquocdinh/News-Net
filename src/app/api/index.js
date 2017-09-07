/**
 * Created by sorivevol on 11/22/16.
 */
'use strict';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import jwt from 'express-jwt';

import Configs from '../../configs';
import defaultRoutes from './default';

const UNUSE_ROUTE = [];

export default class {
    constructor(configs) {
        this.configs = configs;
    }

    init() {
        this.emit("info", "INIT API ... ");

        let app = express();

        app.use(morgan('dev'));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));

        app.use('/static', express.static("./public"));

        app.get('/static', (req, res) => {
            res.render('index');
        });

        app.use(jwt({secret: Configs.get('app').app_secret}).unless({
            path: [
                {
                    url: /\/v3\/authenticate(.*)/,
                    methods: ['POST']
                },{
                    url: /\/v3\/news(.*)/,
                    methods: ['POST']
                },{
                    url: /\/v3\/video(.*)/,
                    methods: ['POST']
                },
            ]
        }));

        // app.use(function(req, res, next) {
        //     res.header("Access-Control-Allow-Origin", "*");
        //     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        //     next();
        // });

        let routeIndex = new defaultRoutes(this);
        routeIndex.router = express.Router();
        routeIndex.route();
        app.use('/', routeIndex.router);

        fs.readdirSync(__dirname).filter(file => fs.statSync(path.join(__dirname, file)).isDirectory()).forEach(folder => {
            fs.readdirSync(path.join(__dirname, folder)).filter(filename => /\.js$/.test(filename)).forEach((filename) => {
                // if (!/\.js$/.test(filename)) {
                //     return;
                // }
                let name = path.basename(filename, '.js');

                if (name == "index" || UNUSE_ROUTE.indexOf(name) >= 0) {
                    return;
                }
                let route = '/' + folder + '/' + name;
                let _load = require('.' + route).default;
                let r = new _load(this);
                r.router = express.Router();
                r.route();


                this.emit("info", "ROUTES : " + route);
                app.use(route, r.router);
            });
        });

        app.use((req, res, next) => {
            // let err = new Error('Not Found Route ' + req.path);
            // err.status = 404;
            // next(err);

            res.status(404);
            res.end();
        });

        // app.use((err, req, res, next) => {
        //     if (err.name === 'UnauthorizedError') {
        //         res.send({data: null, error: {code: 401}});
        //     }
        // });

        if (app.get("env") !== 'prod') {
            app.use((err, req, res, next) => {
                res.status(err.status || 500);
                res.send(err);
                this.emit("error", err);
            });
        }

        app.use((err, req, res, next) => {
            res.end();
        });

        let server = app.listen(this.configs.port, () => {
            let host = server.address().address;
            let port = server.address().port;
            this.emit("info", "STARTED SERVER " + host + ":" + port);
        });
    }
}