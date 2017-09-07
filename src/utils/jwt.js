import jwt from 'jsonwebtoken';

export default class {

    static generateToken(data, secret, expireTime = 100000) {
        return new Promise((resolve, reject) => {
            jwt.sign(data, secret, {expiresIn: expireTime}, (err, token) => {
                if (err) {
                    return reject(err);
                }
                resolve(token);
            });
        });
    }

    static decodeToken(token, secret) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, decoded) => {
                if (err) {
                    return reject(err);
                }
                resolve(decoded);
            })
        })
    }
}