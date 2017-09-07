/**
 * Created by sorivevol on 11/22/16.
 */
'use strict';
import EventEmitter from 'events';
import Components from '../components';

class Application extends EventEmitter {
    static _instance;

    static get Instance() {
        if (!Application._instance) {
            Application._instance = new this();
        }
        return Application._instance;
    }

    configure(appType, configs) {
        try {
            let file = require('./' + appType).default;
            let app = new file(configs);
            app.emit = this.emit.bind(this);
            // init app components
            if (configs.components) {
                return Promise.all(
                    Object.keys(configs.components).map(componentName => {
                        let componentConfigs = configs.components[componentName];
                        if (!(componentConfigs instanceof Array)) {
                            componentConfigs = [componentConfigs];
                        }
                        app[componentName] = {};
                        return Promise.all(
                            componentConfigs.map(componentConfig => {
                                if (!componentConfig['name']) {
                                    app[componentName] = new Components(componentName, componentConfig);
                                    app[componentName].emit = this.emit.bind(this);
                                    if (app[componentName].init) {
                                        return app[componentName].init();
                                    }
                                }
                                app[componentName][componentConfig['name']] = new Components(componentName, componentConfig);
                                app[componentName][componentConfig['name']].emit = this.emit.bind(this);
                                if (app[componentName][componentConfig['name']].init) {
                                    return app[componentName][componentConfig['name']].init();
                                }
                                return null;
                            })
                        );
                    })
                ).then(() => {
                    return app;
                });
            }
            return new Promise(resolve => resolve(app));
        } catch (error) {
            this.emit('error', error);
        }
    }
}

export default Application.Instance;