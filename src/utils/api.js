/**
 * Created by sorivevol on 4/9/17.
 */

class API {
    static _instance;

    static get Instance() {
        if (!API._instance) {
            API._instance = new this();
        }
        return API._instance;
    }

    constructor() {
    }

    error(error, data = null) {
        return this.end(data, error.code ? error : {code: error});
    }

    end(data, error = null) {
        return {
            data,
            error
        };
    }

}

export default API.Instance;