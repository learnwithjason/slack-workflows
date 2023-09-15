import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import RestaurantsDatastore from "../datastores/restaurants.ts";

type Outputs = {
  restaurant_name: string;
  suggestion_count: number;
  originally_suggested_by: string;
  user: string;
};

function getBlocks(outputs: Outputs) {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `Team lunch at ${outputs.restaurant_name}?`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          `Who’s hungry? <@${outputs.user}> is suggesting we all go grab lunch at *${outputs.restaurant_name}*!\n\nReact with :yum: to let them know you’re in!`,
      },
      accessory: {
        type: "image",
        image_url:
          "https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c2FuZHdpY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=200&h=200&q=60",
        alt_text: "sandwich",
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text:
            `:point_right: this restaurant has been suggested ${outputs.suggestion_count} times so far`,
        },
      ],
    },
  ];
}

/**
 * @see https://api.slack.com/automation/functions/custom
 */
export const UpdateRestaurantDefinition = DefineFunction({
  callback_id: "update_restaurant",
  title: "create or update restaurant details",
  source_file: "functions/update_restaurants.ts",
  input_parameters: {
    properties: {
      channel_id: { type: Schema.slack.types.channel_id },
      restaurant_id: { type: Schema.types.string },
      new_restaurant: { type: Schema.types.string },
      user: { type: Schema.slack.types.user_id },
    },
    required: ["channel_id", "user"],
  },
  output_parameters: {
    properties: {
      restaurant_name: { type: Schema.types.string },
      suggestion_count: { type: Schema.types.integer },
      user: { type: Schema.slack.types.user_id },
    },
    required: ["restaurant_name", "suggestion_count", "user"],
  },
});

/**
 * @see https://api.slack.com/automation/functions/custom
 */
export default SlackFunction(
  UpdateRestaurantDefinition,
  async ({ inputs, client }) => {
    if (!inputs.restaurant_id && !inputs.new_restaurant) {
      throw new Error(
        "must supply a restaurant ID or new restaurant suggestion",
      );
    }

    const outputs: Outputs = {
      restaurant_name: "",
      suggestion_count: 1,
      originally_suggested_by: inputs.user,
      user: inputs.user,
    };

    if (inputs.restaurant_id) {
      const restaurant = await client.apps.datastore.get({
        datastore: RestaurantsDatastore.name,
        id: inputs.restaurant_id,
      });

      outputs.suggestion_count = restaurant.item.suggestion_count + 1;
      outputs.restaurant_name = restaurant.item.restaurant_name;
      outputs.originally_suggested_by = restaurant.item.user,
        await client.apps.datastore.update({
          datastore: RestaurantsDatastore.name,
          item: {
            object_id: inputs.restaurant_id,
            suggestion_count: outputs.suggestion_count,
          },
        });
    } else {
      outputs.restaurant_name = inputs.new_restaurant as string;

      await client.apps.datastore.put<typeof RestaurantsDatastore.definition>(
        {
          datastore: RestaurantsDatastore.name,
          item: {
            object_id: crypto.randomUUID(),
            ...outputs,
          },
        },
      );
    }

    client.chat.postMessage({
      channel: inputs.channel_id,
      blocks: getBlocks(outputs),
    });

    return { outputs };
  },
);
