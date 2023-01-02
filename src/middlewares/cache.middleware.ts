import * as expeditious from "express-expeditious";

const cacheoptions: expeditious.ExpeditiousOptions = {
  namespace: "expresscache",
  defaultTtl: "1 minute",
  engine: require("expeditious-engine-memory")(),
  statusCodeExpires: {
    404: "5 minutes",
    500: 60 * 1000,
  },
};

const cacheInit = expeditious(cacheoptions);

export default cacheInit;
