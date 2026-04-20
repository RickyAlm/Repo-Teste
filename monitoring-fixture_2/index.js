const minimist = require("minimist");
const lodash = require("lodash");

const args = minimist(process.argv.slice(2));
console.log("fixture 2:", lodash.pick(args, ["name", "env"]));