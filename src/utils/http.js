/**
 * Created by sorivevol on 2/21/17.
 */
'use strict';
import http from 'http';
import https from 'https';
import url from 'url';
import querystring from 'querystring';

export default class {

    static getData(uri, options = {}) {
        return new Promise((resolve, reject) => {
            let agent = uri.indexOf("https") === 0 ? https : http;
            let urlInfo = url.parse(uri);
            // console.log(urlInfo);
            let opts = Object.assign({
                protocol: urlInfo.protocol,
                hostname: urlInfo.hostname,
                // port: urlInfo.protocol == "http:" ? 80 : 443,
                path: urlInfo.path,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
                }
            }, options);

            // let req = agent.get(decodeURI(uri), (res) => {
            // console.log(opts);
            let req = agent
                .get(opts, (res) => {
                    res.setEncoding('utf8');
                    // console.log(res);
                    let statusCode = res.statusCode;
                    console.log("get STATUSCODE", statusCode);
                    // console.log(statusCode);
                    if (statusCode !== 200) {
                        reject(statusCode);
                        res.resume();
                        return;
                    }
                    let rawData = "";
                    res.on('data', (chunk) => rawData += chunk);
                    res.on('end', () => {
                        resolve(rawData);
                    });
                })
                .on('error', (e) => {
                    reject(e);
                });

            req.setTimeout(60000, () => {
                reject("-TIMEOUT-");
            });
        });
    }

    static postData(uri, data, options = {}) {
        return new Promise((resolve, reject) => {
            let agent = uri.indexOf("https") === 0 ? https : http;
            let urlInfo = url.parse(uri);
            // console.log(urlInfo);
            let opts = Object.assign({
                protocol: urlInfo.protocol,
                hostname: urlInfo.hostname,
                // port: urlInfo.protocol == "http:" ? 80 : 443,
                path: urlInfo.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
                }
            }, options);

            // let req = agent.get(decodeURI(uri), (res) => {
            let req = agent.request(opts, (res) => {
                res.setEncoding('utf8');
                // console.log(res);
                let statusCode = res.statusCode;
                console.log("get STATUSCODE", statusCode);
                // console.log(statusCode);
                if (statusCode !== 200) {
                    reject(statusCode);
                    res.resume();
                    return;
                }
                let rawData = "";
                res.on('data', (chunk) => rawData += chunk);
                res.on('end', () => {
                    resolve(rawData);
                });
            });

            req.on('error', (e) => {
                reject(e);
            });

            //send request witht the postData form
            req.write(querystring.stringify(data));
            req.end();

            req.setTimeout(60000, () => {
                reject("-TIMEOUT-");
            });
        });
    }


    static getBinary(url, options = {}) {
        return new Promise((resolve, reject) => {
            let agent = url.indexOf("https") === 0 ? https : http;

            let req = agent.get(decodeURI(url), (res) => {
                let statusCode = res.statusCode;
                console.log("getBinary STATUSCODE", statusCode);
                if (statusCode !== 200) {
                    reject(statusCode);
                    res.resume();
                    return;
                }
                let rawData = [];
                res.on('data', (chunk) => {
                    rawData.push(chunk);
                });
                res.on('end', () => {
                    let buffer = Buffer.concat(rawData);
                    resolve(buffer);
                });
            }).on('error', (e) => {
                reject(e);
            });
            req.setTimeout(60000, () => {
                reject("-TIMEOUT-");
            });
        });
    }
}