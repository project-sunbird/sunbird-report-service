const _ = require('lodash');
const { channelRead, frameworkRead } = require('../../helpers/learnerHelper');
const debug = require('debug')('dynamicCategoryManager');

class DynamicCategoryManager {
    async getCategoriesForChannel(channelId) {
        try {
            const channelReadResponse = await channelRead({ channelId });
            const frameworkName = _.get(channelReadResponse, 'data.result.channel.defaultFramework');
            if (!frameworkName) {
                throw new Error('Default framework missing');
            }

            const frameworkReadResponse = await frameworkRead({ frameworkId: frameworkName });
            const frameworkData = _.get(frameworkReadResponse, 'data.result.framework');
            const categories = _.map(frameworkData.categories, 'code');
            
            return categories;
        } catch (error) {
            debug('Failed to fetch framework categories', error);
            return [];
        }
    }

}

module.exports = new DynamicCategoryManager();