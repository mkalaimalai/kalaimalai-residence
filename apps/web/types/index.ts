/**
 * The data contract — re-exported from the shared workspace package.
 *
 * The definitions moved to `packages/contracts` so the web app, the admin app and the
 * iOS/Android app all compile against one copy. This shim stays because the
 * constitution names `types/index.ts` as the contract and every existing import in the
 * web app points at `@/types`; nothing below the import path changed.
 */
export * from "@kr/contracts";
