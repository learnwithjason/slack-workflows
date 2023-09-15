import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import LunchPickerWorkflow from "../workflows/lunch_picker.ts";
/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const pickLunchRestaurantTrigger: Trigger<
  typeof LunchPickerWorkflow.definition
> = {
  type: TriggerTypes.Shortcut,
  name: "Suggest a restaurant for lunch",
  description: "Help the team decide where to eat lunch",
  workflow: `#/workflows/${LunchPickerWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
    user: {
      value: TriggerContextData.Shortcut.user_id,
    },
  },
};

export default pickLunchRestaurantTrigger;
