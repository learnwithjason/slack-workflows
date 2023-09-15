import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { GetRestaurantsDefinition } from "../functions/get_restaurants.ts";
import { UpdateRestaurantDefinition } from "../functions/update_restaurants.ts";

/**
 * @see https://api.slack.com/automation/workflows
 */
const LunchPickerWorkflow = DefineWorkflow({
  callback_id: "lunch_picker",
  title: "Where should we eat lunch?",
  description: "It’s time for team lunch! Where should we eat?",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      channel: { type: Schema.slack.types.channel_id },
      user: { type: Schema.slack.types.user_id },
    },
    required: ["user", "interactivity"],
  },
});

/**
 * @see https://api.slack.com/automation/forms#add-interactivity
 */
const getRestaurants = LunchPickerWorkflow.addStep(
  GetRestaurantsDefinition,
  {
    interactivity: LunchPickerWorkflow.inputs.interactivity,
  },
);

/**
 * @see https://api.slack.com/automation/functions#open-a-form
 */
const inputForm = LunchPickerWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Where should we eat?",
    interactivity: getRestaurants.outputs.interactivity,
    submit_label: "Suggest this restaurant",
    fields: {
      elements: [
        {
          name: "restaurant_id",
          title: "Choose from this list",
          type: Schema.types.string,
          enum: getRestaurants.outputs.restaurant_enum,
          choices: getRestaurants.outputs.restaurant_choices,
        },
        {
          name: "new_restaurant",
          title: "...or suggest somewhere new",
          type: Schema.types.string,
        },
      ],
      required: [],
    },
  },
);

/**
 * @see https://api.slack.com/automation/functions/custom
 */
LunchPickerWorkflow.addStep(
  UpdateRestaurantDefinition,
  {
    channel_id: LunchPickerWorkflow.inputs.channel,
    restaurant_id: inputForm.outputs.fields.restaurant_id,
    new_restaurant: inputForm.outputs.fields.new_restaurant,
    user: LunchPickerWorkflow.inputs.user,
  },
);

export default LunchPickerWorkflow;
