export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x878F474f92897E71EdBf00D67f8b1312386443F8"; // Sepolia Deployment

// Debug contract address
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("Contract configuration:", {
    CONTRACT_ADDRESS,
    isValidAddress:
      CONTRACT_ADDRESS &&
      CONTRACT_ADDRESS.length === 42 &&
      CONTRACT_ADDRESS.startsWith("0x"),
  });
}

export const PINATA_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  secretApiKey: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY,
  jwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  gateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY,
};

export const CHAIN_CONFIG = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID),
  chainName: process.env.NEXT_PUBLIC_CHAIN_NAME,
  chainSymbol: process.env.NEXT_PUBLIC_CHAIN_SYMBOL,
  blockExplorer: process.env.NEXT_PUBLIC_BLOCK_EXPLORER,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
};

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_PLATFORM_NAME || "Liberty Social",
  description: "Decentralized Social Media Platform",
  version: "1.0.0",
};

export const IPFS_CONFIG = {
  gateway:
    process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud",
  uploadEndpoint: "https://api.pinata.cloud/pinning/pinFileToIPFS",
  jsonEndpoint: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
};

export const PAGINATION = {
  postsPerPage: 10,
  usersPerPage: 20,
  commentsPerPage: 50,
};

export const LIMITS = {
  maxUsernameLength: 50,
  maxPostDescription: 1000,
  maxGroupName: 100,
  maxMessageLength: 500,
  maxCommentLength: 300,
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

export const POST_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  VIDEO: "video",
};

export const SUPPORTED_FILE_TYPES = {
  images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  videos: ["video/mp4", "video/webm", "video/ogg"],
};
