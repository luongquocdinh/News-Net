/**
 * Created by sorivevol on 4/5/17.
 */
'use strict';

import Configs from '../../configs';
import Utils from '../../utils';

const CHECK_SOURCE = 3600;

export default class {
    constructor(configs) {
        this.configs = configs;

        this.listSources = {};
        this.initSources = {};

        this.exclude;
        this.only;

        this.checkSource = this.checkSource.bind(this);
        this.doCheckSource = this.doCheckSource.bind(this);
    }

    init(params) {
        this.emit("info", "INIT MASTER ...");
        // console.log(params);
        try {
            this.exclude = JSON.parse(params.exclude);
        } catch (error) {
        }

        try {
            this.only = JSON.parse(params.only);
        } catch (error) {
        }

        this.data['elastic'].article.migrate()
            .then(() => this.data['elastic'].video.migrate())
            .then(() => {
                return this.data['mongo'].sourceArticle.getListEnable()
                    .then(sourceList => {
                        if (!sourceList || sourceList.length == 0) {
                            return this.migrateSource()
                        }
                    });
            })
            .then(() => {
                this.emit("info", "[ELASTIC] migrated");
                this.checkSource();
                    // this.checkCategory();
                    //
                    setInterval(this.checkSource, CHECK_SOURCE * 1000);
                    // setInterval(this.checkCategory, CHECK_CATEGORY * 1000);
            })
            .catch(e => console.log(e))
    }

    migrateSource() {
        return this.data['file'].sourceArticle.getListEnable()
            .then(sources => Promise.all(sources.map(source => {
                let s = {
                    name: source.name,
                    icon: source.icon,
                    url: source.url,
                    parsers: source.parsers.map(parser => {
                        delete parser._id;
                        return parser;
                    }),
                    refresh_rate: source.refresh_rate,
                    onboarding: source.onboarding || true,
                    is_enable: source.is_enable
                };
                return this.data['mongo'].sourceArticle.insert(s)
                    .then(data => {
                        let parsers = {};
                        data.parsers.forEach(parser => {
                            for (let index in source.parsers) {
                                if (source.parsers[index].name === parser.name) {
                                    parsers[source.parsers[index].name] = parser._id;
                                    break;
                                }
                            }
                        });
                        data.categories = source.categories.map(category => {
                            return {
                                name: category.name,
                                url: category.url,
                                parser: {
                                    list: parsers[category.parser.list],
                                    detail: parsers[category.parser.detail]
                                },
                                mapped_category: category.mapped_category,
                                refresh_rate: category.refresh_rate,
                                is_enable: category.is_enable,
                            }
                        });
                        return data.save();
                    })
                    .catch(e => console.log(e))
            })))
            .catch(e => console.log(e))
    }

    checkSource() {
        // let counter = 0;
        return this.data['mongo'].sourceArticle.getListEnable()
            .then(s => s.map(source => source.categories.map(category => {
                let sourceID = source._id.toString();
                let categoryID = category._id.toString();
                let id = sourceID + categoryID;
                this.emit("info", "[SOURCE] [CHECKING] ...", source.name, category.name);
                if (!this.listSources[id]) {
                    this.listSources[id] = 1;
                    if (!this.initSources[id]) {
                        this.initSources[id] = 1;
                        // counter++;
                        this.doCheckSource(source, category);
                    }
                    setTimeout(this.doCheckSource, (category.refresh_rate || source.refresh_rate || 43200) * 1000, source, category)
                }
            })))
            // .then(() => console.log(counter))
            .catch(error => this.emit('error', error));
    }

    doCheckSource(source, category) {
        this.emit("info", "[SOURCE] [CRAWL] ...", source.name, category.name);
        let sourceID = source._id.toString();
        let categoryID = category._id.toString();
        this.messages.set(this.messages.types.ARTICLE_LIST, sourceID, categoryID)
            .then(message => {
                this.listSources[sourceID + categoryID] = 0;
                return this.queue.enqueue(this.queue.types.ARTICLE_LIST, message)
            })
            .catch(error => this.emit('error', error))
    }
}