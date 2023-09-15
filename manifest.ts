import { Manifest } from "deno-slack-sdk/mod.ts";
import LunchPickerWorkflow from "./workflows/lunch_picker.ts";
import RestaurantsDatastore from "./datastores/restaurants.ts";

/**
 * @see https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "Lunch Restaurant Picker",
  description: "Help your team decide where to eat lunch.",
  icon: "assets/default_new_app_icon.png",
  workflows: [LunchPickerWorkflow],
  outgoingDomains: [],
  datastores: [RestaurantsDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
  ],
});
