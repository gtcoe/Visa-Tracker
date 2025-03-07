"use strict";

const { express, app } = require("./myApp");
const bodyParser = require("body-parser");
const logModule = require("./app/logging");
const logger = logModule.logger;
// const config = require('./configuration');
const s3Config = require("./app/config/s3BucketConfig")[process.env.NODE_ENV];
const cors = require("cors");
require("events").EventEmitter.prototype._maxListeners = 200;
const MySql = require("./app/database/mySqlConnection");
const AWS = require("aws-sdk");
const json2xls = require("json2xls");
// require('./configuration/authentication-token-config').init(app);
// const asyncHooks = require('./hooks/asyncHooks');

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(json2xls.middleware);
app.use(
  bodyParser.json({
    verify: function (req, res, buf, encoding) {
      // get rawBody
      req.rawBody = buf.toString();
    },
  })
);

app.use(cors());
app.disable("x-powered-by");

let port = process.env.PORT || 8081;
app.set("port", port);

app.use(function (req, res, next) {
  // Set context of a request for logging.
  asyncHooks.setRequestContext({
    requestId: "abc",
    endpoint: req.originalUrl,
  });

  let old = res.send.bind(res);
  let isLogged = true;
  res.send = (body) => {
    if (isLogged) {
      logger.info(
        `api request - ${
          (req.token && "driver:" + req.token.driverId) || ""
        } ` +
          JSON.stringify({
            url: req.originalUrl,
            request: req.body,
            code: res.statusCode,
            response: body,
            headers: req.headers,
          })
      );
    }
    isLogged = false;
    old(body);
  };
  next();
});

// routes
require("./app/routes")(app);

//configuring the AWS environment
//todo remove hard code aws credentials
const awsCred = {
  region: s3Config.REGION,
  accessKeyId: s3Config.ACCESS_KEY_ID,
  secretAccessKey: s3Config.SECRET_ACCESS_KEY,
};
logger.info(`AWS creds: ${JSON.stringify(awsCred)}`);
AWS.config.update(awsCred);

function keepAlive() {
  MySql.query("SELECT 1 p")
    .then((result) => {})
    .catch((err) => {
      logger.error("Error in SELECT 1 p: " + err);
    });
}
setInterval(keepAlive, 5000);

app.listen(app.get("port"), (err) => {
  console.log(`Server running on port: ${app.get("port")}`);
});
