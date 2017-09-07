/**
 * Created by sorivevol on 11/22/16.
 */
'use strict';

const HTTP = {
    BAD_REQUEST: 400,
    UNAUTHORIZE: 401,
    NOT_FOUND: 404,
};

const SERVER = {
    UNKNOWN: 1000,
    INVALID_TOKEN: 1001,
    TIMEOUT: 1002,
    EMPTY_KEYWORD: 1003,
    INVALID_REQUEST: 1004,


    OK: 1100,
};

const LOGIN = {
    MISS_TOKEN_OR_TYPE: 1992,
};


export {HTTP, SERVER, LOGIN};