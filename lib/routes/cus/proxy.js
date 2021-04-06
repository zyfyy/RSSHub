/**
 * @file proxy to a good rss feed
 * such as https://medium.com/feed/i-am-mike
 */
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { url } = ctx.params;
    if (!url) {
        ctx.body = `error: url ${url}`;
    }
    const { body } = await got.get(url);
    ctx.body = body;
};
