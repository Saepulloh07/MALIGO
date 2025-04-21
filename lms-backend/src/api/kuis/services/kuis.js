'use strict';

/**
 * kuis service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::kuis.kuis');
