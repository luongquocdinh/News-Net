/**
 * Created by sorivevol on 4/7/17.
 */
'use strict';
import Services from './services';

export default class {
    constructor(configs) {
        this.configs = configs;
    }

    init(params) {
        let process = params.child || "index";

        let queue = process;

        if (params.queue) {
            queue = this.queue.types[params.queue];
        }

        if (!queue) {
            return this.emit("error", "Unknown Queue");
        }

        this.emit("info", "INIT CRAWLER ... ", process, queue);

        let services = new Services(this);

        this.queue.consume(queue, (data) => {
            return this.messages.get(data).then(message => {
                return services.run(message.action, message.data);
            }).catch(error => {
                this.emit('error', error);
            })
        });
    }
}