import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

/**
 * @see https://api.slack.com/automation/datastores
 */
const RestaurantsDatastore = DefineDatastore({
  name: "Restaurants",
  primary_key: "object_id",
  attributes: {
    object_id: {
      type: Schema.types.string,
    },
    restaurant_name: {
      type: Schema.types.string,
    },
    suggestion_count: {
      type: Schema.types.integer,
      default: 0,
    },
    user: {
      type: Schema.slack.types.user_id,
    },
  },
});

export default RestaurantsDatastore;
