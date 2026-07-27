/**
 * Metro needs to be told about the monorepo: workspace packages live outside the app
 * directory and their sources are plain TypeScript (not prebuilt), so both the watch
 * roots and the module resolution paths have to include the repo root.
 */
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the whole workspace so edits to packages/* trigger a rebuild.
config.watchFolders = [workspaceRoot];

// Resolve from the app first, then the hoisted root node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// NOTE: hierarchical lookup is left ON. Disabling it (the usual monorepo advice) breaks
// resolution here because npm hoists most of Expo to the root while leaving expo-router
// and react-native in the app's own node_modules.

module.exports = config;
