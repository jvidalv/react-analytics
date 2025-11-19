import { Elysia } from "elysia";
import { overviewRoute } from "./overview.route";
import { newJoinersRoute } from "./new-joiners.route";
import { countryAggregatesRoute } from "./country-aggregates.route";
import { platformAggregatesRoute } from "./platform-aggregates.route";
import { identificationAggregatesRoute } from "./identification-aggregates.route";
import { errorRateAggregatesRoute } from "./error-rate-aggregates.route";

export const statsRoutes = new Elysia({ prefix: "/stats" })
  .use(overviewRoute)
  .use(newJoinersRoute)
  .use(countryAggregatesRoute)
  .use(platformAggregatesRoute)
  .use(identificationAggregatesRoute)
  .use(errorRateAggregatesRoute);
