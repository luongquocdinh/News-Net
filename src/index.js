/**
 * Created by sorivevol on 11/22/16.
 */
'use strict';
import optimist from 'optimist';
import Configs from './configs';
import Application from './app';
import Log from './utils/logger';

let env = process.env.NODE_ENV || "dev";

let params = optimist.options("app", {
    alias: "a",
    describe: "Application",
    default: "master"
}).options("child", {
    alias: "c",
    describe: "Application child",
}).options("queue", {
    alias: "q",
    describe: "Application queue",
}).argv;

Configs.configure(env);

let log = new Log(Configs.get('app').log.level);

Application.on('debug', (...arg) => {
    log.debug(...arg);
});

Application.on('info', (...arg) => {
    log.info(...arg);
});

Application.on('warn', (...arg) => {
    log.info(...arg);
});

Application.on('error', (...arg) => {
    log.error(...arg);
});
Application.emit('info', "STARTING SERVER - ", env);
Application.configure(params.app, Configs.app[params.app])
    .then(app => app.init(params))
    .catch(error => {
        Application.emit("error", error);
    });
