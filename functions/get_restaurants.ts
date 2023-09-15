import {
  DefineFunction,
  DefineType,
  Schema,
  SlackFunction,
} from "deno-slack-sdk/mod.ts";
import RestaurantsDatastore from "../datastores/restaurants.ts";

/**
 * @see https://api.slack.com/automation/types/custom
 */
const RestaurantChoice = DefineType({
  name: "RestaurantChoice",
  type: Schema.types.object,
  properties: {
    value: {
      type: Schema.types.string,
    },
    title: {
      type: Schema.types.string,
    },
  },
});

const RestaurantChoices = DefineType({
  name: "RestaurantChoices",
  type: Schema.types.array,
  items: {
    type: RestaurantChoice,
  },
});

/**
 * @see https://api.slack.com/automation/functions/custom
 */
export const GetRestaurantsDefinition = DefineFunction({
  callback_id: "get_restaurants",
  title: "Get all restaurants",
  source_file: "functions/get_restaurants.ts",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
    },
    required: ["interactivity"],
  },
  output_parameters: {
    properties: {
      restaurant_choices: { type: RestaurantChoices },
      restaurant_enum: {
        type: Schema.types.array,
        items: { type: Schema.types.string },
      },
      interactivity: { type: Schema.slack.types.interactivity },
    },
    required: ["restaurant_choices", "restaurant_enum", "interactivity"],
  },
});

export default SlackFunction(
  GetRestaurantsDefinition,
  async ({ inputs, client }) => {
    const restaurants = await client.apps.datastore.query({
      datastore: RestaurantsDatastore.name,
    });

    const idArray = restaurants.items.map((r) => r.object_id);
    const choices = restaurants.items.map((r) => ({
      value: r.object_id,
      title: r.restaurant_name,
    }));

    return {
      outputs: {
        restaurant_enum: idArray,
        restaurant_choices: choices,
        interactivity: inputs.interactivity,
      },
    };
  },
);
