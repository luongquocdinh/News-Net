/**
 * Created by sorivevol on 2/27/17.
 */
"use strict";
import request from 'request';
import {FB, FacebookApiException} from 'fb';


export default class {

    static requestToken() {
        let req = request.defaults({
            jar: true
        });

        return new Promise((resolve, reject) => {
            req.post({
                url: 'https://www.facebook.com/login.php',
                headers: {
                    cookie: '_js_datr=mbyYWbgyyBLAkCi89KB3Apg5; _js_reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2Flogin.php; reg_fb_gate=https%3A%2F%2Fwww.facebook.com%2F; datr=mbyYWbgyyBLAkCi89KB3Apg5; fr=0kFR7WH7OVqdw1EnT..BZmLyZ.iX.AAA.0.0.BZmLyr.AWXqmKn6; reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2F',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.132 Safari/537.36'
                },
                form: {
                    lsd: 'AVpU-FwO',
                    email: "binhnna12@gmail.com",
                    pass: "nopasword",
                    persistent: '1',
                    default_persistent: '0',
                    timezone: '-420',
                    lgndim: 'eyJ3IjoxNjAwLCJoIjo5MDAsImF3IjoxNjAwLCJhaCI6ODc4LCJjIjoyNH0=',
                    lgnrnd: '153315_xwzW',
                    lgnjs: '1503181995',
                    locale: 'zh_TW',
                }
            }, (e, r, b) => {
                if (e) {
                    reject(e);
                    return;
                }

                req.get({
                    url: 'https://developers.facebook.com/tools/explorer/145634995501895/permissions?version=v2.1&__a=1&__dyn=5U463-i3S2e4oK4pomXWo5O12wAxu&__req=2&__rev=1470714',
                    headers: {
                        cookie: '_js_datr=mbyYWbgyyBLAkCi89KB3Apg5; _js_reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2Flogin.php; reg_fb_gate=https%3A%2F%2Fwww.facebook.com%2F; datr=mbyYWbgyyBLAkCi89KB3Apg5; fr=0kFR7WH7OVqdw1EnT..BZmLyZ.iX.AAA.0.0.BZmLyr.AWXqmKn6; reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2F',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.132 Safari/537.36'
                    },
                }, (err, res, body) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (res.statusCode !== 200) {
                        reject(new Error('Status code is ' + res.statusCode + ', ' + body));
                        return;
                    }

                    try {
                        body = JSON.parse(body.replace('for (;;);', ''));
                    } catch (e) {
                        return reject(new Error('JSON parse error:' + e));
                    }

                    let token;
                    try {
                        token = body.jsmods.instances[2][2][2];
                    } catch (e) {
                        return reject(new Error('No access token'));
                    }

                    resolve(token);
                })
            })
        })
    }

    static pageInfo(page, token) {
        return new Promise((resolve, reject) => {
            FB.api(page, {
                fields: [
                    'feed{link,caption,description,comments.summary(true),likes.summary(true),shares}'
                ],
                access_token: token
            }, r => {
                // console.log(r);
                if (!r || !r.feed) {
                    reject(new Error("TOKEN NOT VALID"));
                    return;
                }
                resolve(r);
            });
        });
    }

    static userInfo(token) {
        return new Promise((resolve, reject) => {
            FB.api('me', {
                fields: ['id', 'name', 'email', 'link', 'location', 'work', 'picture.width(300).height(300)', 'install_type', 'devices'],
                access_token: token
            }, r => {
                if (!r || !r.feed) {
                    reject(new Error("TOKEN NOT VALID"));
                    return;
                }
                resolve(r);
            });
        })
    }

    static linkInfo(link) {
        return new Promise((resolve, reject) => {
            request("http://graph.facebook.com/?id=" + link, (error, response, body) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(JSON.parse(body));
            });
        })
    }
}