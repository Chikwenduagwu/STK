/**
 * GenLayer connection settings. The project currently runs on GenLayer Studio (studionet),
 * so these are fixed here instead of environment variables. To move to another network,
 * change this one file (and see lib/genlayer/client.ts for the chain mapping).
 */
export const GENLAYER = {
  network: "studionet",
  chainId: 61999,
  rpcUrl: "https://studio.genlayer.com/api",
  contractAddress: "0x2A4c613eddc25F1Ad90c167Cdb6262Ba9c95659b",
  currency: "GEN",
  explorerUrl: "https://explorer-studio.genlayer.com",
} as const;
