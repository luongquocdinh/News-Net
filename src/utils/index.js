/**
 * Created by sorivevol on 3/14/17.
 */
import Request from 'request';
import trim from 'trim';
import url from 'url';
import striptags from 'striptags';

export default class Utils {

    static info(str) {
        let err = new Error();
        err.message = str;
        err.name = "CUSTOM";
        return err;
    }

    static str2Arr(str) {
        let arr = [];
        if (!str) {
            return arr;
        }
        if (str.constructor != Array) {
            arr.push(str);
        } else {
            arr = str;
        }
        return arr;
    }

    static matchAll(str, regexp) {
        let matches = [];
        str.replace(regexp, function () {
            // console.log(arguments);
            let arr = ([]).slice.call(arguments, 0);
            let extras = arr.splice(-2);
            arr.index = extras[0];
            arr.input = extras[1];
            matches.push(arr);
        });
        return matches.length ? matches : null;
    }

    static request(url, body) {
        return new Promise((resolve, reject) => {
            Request.post({
                headers: {
                    'content-type': 'application/json; charset=utf-8',
                },
                url,
                body
            }, (error, res, body) => {
                if (error) {
                    reject(error);
                }
                resolve();
            });
        });
    }

    static normalizeUrl(href, currentUrl) {
        try {
            href = decodeURIComponent(trim(href));
            currentUrl = trim(currentUrl);

            // Split the link and the response url into parts
            let hrefInfo = url.parse(href, true, true);
            let requestInfo = url.parse(currentUrl, true, true);
            if (hrefInfo.protocol) {
                if (hrefInfo.protocol != 'http:' && hrefInfo.protocol != 'https:') {
                    return false;
                }
            }

            // Build up an object to pass to url.format
            let resultParts = {};
            resultParts.protocol = hrefInfo.protocol || requestInfo.protocol;
            resultParts.hostname = hrefInfo.hostname || requestInfo.hostname;

            resultParts.port = hrefInfo.port || requestInfo.port;
            // If the port is the default port, discard
            if (resultParts.port == 80) {
                resultParts.port = '';
            }

            // Fully resolve paths
            resultParts.pathname = url.resolve(requestInfo.pathname, (hrefInfo.pathname || ''))
            resultParts.pathname = resultParts.pathname.replace(/\/+/g, '/');

            // Reconstitue the normalized url
            let normalizedUrl = url.format(resultParts);

            // Remove trailing slash
            // if (normalizedUrl.slice(-1) === '/') {
            //     normalizedUrl = normalizedUrl.substr(0, normalizedUrl.length - 1);
            // }

            // Remove the directory index
            let dirIndexRe = /(index.(htm|html|php)|default.(asp|aspx))$/;
            if (normalizedUrl.match(dirIndexRe)) {
                normalizedUrl = normalizedUrl.substr(0, normalizedUrl.lastIndexOf('/'));
            }

            return normalizedUrl;
        } catch (error) {
            console.log("ERROR ", href, currentUrl);
            return false;
        }

    }

    static cleanHtml(html, url, tags = ['img', 'iframe', 'br']) {
        if (!html) return {
            body: '',
            images: [],
            videos: []
        };
        html = html.replace(/<\/p>/gm, '\r\n');

        html = striptags(html, tags);

        html = html.replace(/^\s*[\r\n]/gm, '');
        html = html.replace(/ {1,}/g, ' ');
        html = html.replace(/\t{1,}/g, ' ');
        html = html.replace(/\n +/g, '\n');
        html = html.replace(/<br>/gm, '\r\n');

        // videos
        let matches = html.match(/<iframe.*?src="([^"]*)"[^>]*>(?:<\/iframe>)?/gm);
        let videos = [];
        if (matches && matches.length > 0) {
            matches.map(match => {
                if (match.indexOf("youtube.com/embed") > -1) {
                    videos.push(match.replace(/<iframe.*?src="([^"]*)"[^>]*>(?:<\/iframe>)?/gm, "$1"));
                    html = html.replace(match, "\r\n{{VIDEO}}\r\n");
                } else {
                    html = html.replace(match, "\r\n");
                }
            });
        }

        //image
        // let test = html.match(/<img[.\s\S]*?src="([^"]*)"[^>]*>(?:<\/img>)?/gm);
        // console.log(test);
        html = html.replace(/<img[.\s\S]*?src="([^"]*)"[^>]*>(?:<\/img>)?/gm, '<img src="$1" />');
        let imageRex = html.match(/<img src="([^"]*)" \/>?/gm);
        // console.log(imageRex);
        let images = [];
        if (imageRex && imageRex.length > 0) {
            imageRex.map(image => {
                let i = image.replace(/<img src="([^"]*)" \/>?/, "$1");
                // console.log(i);
                if (i.indexOf("http") != 0 && url) {
                    i = i ? Utils.normalizeUrl(i, url) : null;
                }
                if (i) {
                    images.push(i);
                    html = html.replace(image, "\r\n{{IMAGE}}\r\n");
                } else {
                    html = html.replace(image, "\r\n");
                }
            });
        }

        html = html.replace(/[\r\n\t]+/gm, '\r\n');

        return {
            body: trim(html),
            images: images,
            videos: videos
        };
    }

}