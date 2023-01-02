const util = require("util");
const mixpanel = require("mixpanel").init("b08a063550d91084d8ac29a23ef304da");

const trackAsync = util.promisify(mixpanel.track);

async function track(event, properties) {
  await trackAsync(event, properties);
}
module.exports = { track };
