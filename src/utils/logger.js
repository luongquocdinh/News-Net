/**
 * Created by sorivevol on 11/16/16.
 */
export default class {

    constructor(level) {
        this.level = level;
    }

    info(...log) {
        console.log(...log);
    }

    debug(...log) {
        console.log(...log);
    }

    error(...log) {
        console.trace(...log);
    }
}