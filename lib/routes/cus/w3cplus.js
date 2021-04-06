const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get('https://www.w3cplus.com/blogs-lists');
    const $ = cheerio.load(response.data);
    let list = $('.content .item-list li').get();
    list = list.slice(0, 20);

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        const content = $('.content .body-content .field-items');

        return {
            description: content.html(),
            pubDate: new Date($('.content .node-header .submitted span').eq(1).text()).toUTCString(),
            author: $('.content .node-header .submitted span').eq(0).text(),
        };
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('.field-content a');
            const link = $a.attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: 'https://www.w3cplus.com' + link,
            });

            const single = {
                title: $a.text(),
                ...ProcessFeed(response.data),
                link: link,
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'w3cplus',
        link: 'https://www.w3cplus.com/blogs-lists',
        description: 'w3cplus',
        item: items,
    };
};
