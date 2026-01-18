import axios from "axios";
import { PINATA_CONFIG, IPFS_CONFIG, LIMITS } from "./constants";

class PinataService {
  constructor() {
    this.apiKey = PINATA_CONFIG.apiKey;
    this.secretApiKey = PINATA_CONFIG.secretApiKey;
    this.jwt = PINATA_CONFIG.jwt;
    this.gateway = PINATA_CONFIG.gateway;
  }

  // Upload file to IPFS via Pinata
  async uploadFile(file, metadata = {}) {
    try {
      // Validate file size
      if (file.size > LIMITS.maxFileSize) {
        throw new Error(
          `File size exceeds ${LIMITS.maxFileSize / (1024 * 1024)}MB limit`
        );
      }

      const formData = new FormData();
      formData.append("file", file);

      // Add metadata
      const pinataMetadata = JSON.stringify({
        name: metadata.name || file.name,
        keyvalues: {
          uploadedBy: metadata.uploadedBy || "user",
          fileType: file.type,
          uploadDate: new Date().toISOString(),
          ...metadata.keyvalues,
        },
      });
      formData.append("pinataMetadata", pinataMetadata);

      // Add pinata options
      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", pinataOptions);

      const response = await axios.post(IPFS_CONFIG.uploadEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: this.apiKey,
          pinata_secret_api_key: this.secretApiKey,
        },
        timeout: 60000, // 60 seconds timeout
      });

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        ipfsUrl: `${this.gateway}/ipfs/${response.data.IpfsHash}`,
        size: response.data.PinSize,
        timestamp: response.data.Timestamp,
      };
    } catch (error) {
      console.error("Error uploading file to IPFS:", error);
      throw new Error(
        `IPFS upload failed: ${error.response?.data?.error || error.message}`
      );
    }
  }

  // Upload JSON metadata to IPFS
  async uploadJSON(jsonData, metadata = {}) {
    try {
      const data = {
        pinataContent: jsonData,
        pinataMetadata: {
          name: metadata.name || "JSON Data",
          keyvalues: {
            uploadedBy: metadata.uploadedBy || "user",
            dataType: "json",
            uploadDate: new Date().toISOString(),
            ...metadata.keyvalues,
          },
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };

      const response = await axios.post(IPFS_CONFIG.jsonEndpoint, data, {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: this.apiKey,
          pinata_secret_api_key: this.secretApiKey,
        },
        timeout: 30000, // 30 seconds timeout
      });

      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        ipfsUrl: `${this.gateway}/ipfs/${response.data.IpfsHash}`,
        size: response.data.PinSize,
        timestamp: response.data.Timestamp,
      };
    } catch (error) {
      console.error("Error uploading JSON to IPFS:", error);
      throw new Error(
        `IPFS JSON upload failed: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  // Get file info from IPFS
  async getFileInfo(ipfsHash) {
    try {
      const response = await axios.get(`${this.gateway}/ipfs/${ipfsHash}`, {
        timeout: 30000,
      });
      return {
        success: true,
        data: response.data,
        contentType: response.headers["content-type"],
      };
    } catch (error) {
      console.error("Error fetching file from IPFS:", error);
      throw new Error(`IPFS fetch failed: ${error.message}`);
    }
  }

  // Validate file type
  validateFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  }

  // Get IPFS URL from hash
  getIpfsUrl(hash) {
    if (!hash) return "";
    return hash.startsWith("http") ? hash : `${this.gateway}/ipfs/${hash}`;
  }

  // Extract IPFS hash from URL
  extractHashFromUrl(url) {
    if (!url) return "";
    const match = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
    return match ? match[1] : url;
  }

  // Check if Pinata is configured
  isConfigured() {
    return !!(this.apiKey && this.secretApiKey);
  }
}

export const pinataService = new PinataService();
export default pinataService;
