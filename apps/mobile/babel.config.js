/**
 * babel-preset-expo is what inlines `EXPO_ROUTER_APP_ROOT` into expo-router's
 * `require.context` call. In a workspace the Expo CLI does not reliably set that env var
 * (Metro's project root resolves to the repo root, not this app), so set it here —
 * before the preset is constructed — and bundling works from any cwd.
 */
const path = require("path");

process.env.EXPO_ROUTER_APP_ROOT =
  process.env.EXPO_ROUTER_APP_ROOT || path.join(__dirname, "app");

module.exports = function (api) {
  api.cache(true);
  return { presets: ["babel-preset-expo"] };
};
