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

// One copy of React — two would break hooks.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
