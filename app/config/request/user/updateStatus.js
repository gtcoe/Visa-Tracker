const constants = require('../../../config/constants');

module.exports = {
    body: {
        status: {
            type: "number",
            required: true,
            minValue: constants.STATUS.USER.ACTIVE,
            maxValue: constants.STATUS.USER.INACTIVE,
        },
        id: {
            type: "number",
            required: true,
            minValue: 0,
        },
    },
}