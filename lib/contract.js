import { CONTRACT_ABI } from "./contractABI";
import { CONTRACT_ADDRESS } from "./constants";
import toast from "react-hot-toast";
import { parseEther, formatEther } from "viem";

class ContractService {
  constructor() {
    this.contractAddress = CONTRACT_ADDRESS;
    this.abi = CONTRACT_ABI;
  }

  // Handle transaction with loading state
  async executeTransaction(
    transactionPromise,
    loadingMessage = "Processing..."
  ) {
    const toastId = toast.loading(loadingMessage);

    try {
      const hash = await transactionPromise;
      toast.loading("Waiting for confirmation...", { id: toastId });

      // Note: For production, you might want to wait for transaction receipt
      toast.success("Transaction successful!", { id: toastId });

      // Auto-refresh after 13 seconds as requested
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 13000);

      return { success: true, hash };
    } catch (error) {
      console.error("Transaction failed:", error);
      const errorMessage = this.parseError(error);
      toast.error(errorMessage, { id: toastId });

      // Auto-refresh after 13 seconds on error too
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 13000);

      return { success: false, error: errorMessage };
    }
  }

  // Parse contract errors
  parseError(error) {
    if (error.code === 4001) {
      return "Transaction was rejected by user";
    }

    if (error.reason) {
      return error.reason;
    }

    if (error.data?.message) {
      return error.data.message;
    }

    if (error.message) {
      if (error.message.includes("insufficient funds")) {
        return "Insufficient funds for transaction";
      }
      if (error.message.includes("user rejected")) {
        return "Transaction rejected by user";
      }
      return error.message;
    }

    return "Transaction failed. Please try again.";
  }

  // Handle error with auto-reload
  handleErrorWithReload(error) {
    console.error("Contract Error:", error);

    // Auto-refresh after 13 seconds
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }, 13000);

    return { success: false, error: this.parseError(error) };
  }

  // PROFILE FUNCTIONS
  async createProfile(walletClient, username) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "createProfile",
        args: [username],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Creating profile..."
      );
    } catch (error) {
      return this.handleErrorWithReload(error);
    }
  }

  async updateUsername(walletClient, newUsername) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "setProfileName",
        args: [newUsername],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Updating username..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async deleteAccount(walletClient) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "deleteProfile",
        args: [],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Deleting account..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async getProfile(publicClient, address) {
    try {
      const profile = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "profiles",
        args: [address],
      });

      return {
        owner: profile[0],
        name: profile[1],
        timeCreated: Number(profile[2]),
        id: Number(profile[3]),
        postCount: Number(profile[4]),
        followerCount: Number(profile[5]),
        followingCount: Number(profile[6]),
        exists: profile[0] !== "0x0000000000000000000000000000000000000000",
      };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }

  async followUser(walletClient, userAddress) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "followUser",
        args: [userAddress],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Following user..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async unfollowUser(walletClient, userAddress) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "unfollowUser",
        args: [userAddress],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Unfollowing user..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async checkIsFollowing(publicClient, followerAddress, followedAddress) {
    try {
      return await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "checkIsFollowing",
        args: [followerAddress, followedAddress],
      });
    } catch (error) {
      console.error("Error checking follow status:", error);
      return false;
    }
  }

  async getUserFollowers(publicClient, userAddress) {
    try {
      return await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "getUserFollowers",
        args: [userAddress],
      });
    } catch (error) {
      console.error("Error fetching followers:", error);
      return [];
    }
  }

  async getUserFollowing(publicClient, userAddress) {
    try {
      return await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "getUserFollowing",
        args: [userAddress],
      });
    } catch (error) {
      console.error("Error fetching following:", error);
      return [];
    }
  }

  /// POST FUNCTIONS
  async createPost(walletClient, postType, description, postURL = "") {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "createPost",
        args: [postType, description, postURL],
        value: parseEther("0.000003"),
      });

      return await this.executeTransaction(
        Promise.resolve(hash),
        "Creating post..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async getUserPosts(publicClient, userAddress) {
    try {
      const posts = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "getUserPosts",
        args: [userAddress],
      });

      console.log("Raw user posts result:", posts);

      return posts
        .map((post, index) => {
          console.log(`Processing user post ${index}:`, post);

          if (Array.isArray(post)) {
            return {
              author: post[0] || "",
              postType: post[1] || "text",
              postDescription: post[2] || "",
              postURL: post[3] || "",
              timeCreated: Number(post[4] || 0),
              postID: Number(post[5] || 0),
              likes: Number(post[6] || 0),
              commentCount: post.length > 8 ? Number(post[7] || 0) : 0,
              isDeleted: post.length > 8 ? !!post[8] : !!post[7],
            };
          } else if (typeof post === "object") {
            return {
              author: post.author || "",
              postType: post.postType || "text",
              postDescription: post.postDescription || "",
              postURL: post.postURL || "",
              timeCreated: Number(post.timeCreated || 0),
              postID: Number(post.postID || 0),
              likes: Number(post.likes || 0),
              commentCount: Number(post.commentCount || 0),
              isDeleted: !!post.isDeleted,
            };
          }

          return {
            author: "",
            postType: "text",
            postDescription: "",
            postURL: "",
            timeCreated: 0,
            postID: 0,
            likes: 0,
            commentCount: 0,
            isDeleted: false,
          };
        })
        .filter((post) => post.author && !post.isDeleted);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      return [];
    }
  }

  async getAllPosts(publicClient, offset = 0, limit = 10) {
    try {
      console.log("Calling getAllPosts with:", {
        contractAddress: this.contractAddress,
        offset,
        limit,
      });

      const result = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "getAllPosts",
        args: [BigInt(offset), BigInt(limit)],
      });

      console.log("Raw contract result:", result);

      const postsArray = Array.isArray(result)
        ? result[0]
        : result.posts || result[0];
      const totalCount = Array.isArray(result)
        ? result[1]
        : result.total || result[1];

      console.log("Posts array:", postsArray);
      console.log("Total count:", totalCount);

      const posts = postsArray.map((post, index) => {
        console.log(`Processing post ${index}:`, post);
        let parsedPost;
        if (Array.isArray(post)) {
          parsedPost = {
            author: post[0] || "",
            postType: post[1] || "text",
            postDescription: post[2] || "",
            postURL: post[3] || "",
            timeCreated: Number(post[4] || 0),
            postID: Number(post[5] || 0),
            likes: Number(post[6] || 0),
            commentCount: post.length > 8 ? Number(post[7] || 0) : 0,
            isDeleted: post.length > 8 ? !!post[8] : !!post[7],
          };
        } else if (typeof post === "object") {
          parsedPost = {
            author: post.author || "",
            postType: post.postType || "text",
            postDescription: post.postDescription || "",
            postURL: post.postURL || "",
            timeCreated: Number(post.timeCreated || 0),
            postID: Number(post.postID || 0),
            likes: Number(post.likes || 0),
            commentCount: Number(post.commentCount || 0),
            isDeleted: !!post.isDeleted,
          };
        } else {
          console.warn("Unexpected post structure:", post);
          parsedPost = {
            author: "",
            postType: "text",
            postDescription: "",
            postURL: "",
            timeCreated: 0,
            postID: 0,
            likes: 0,
            commentCount: 0,
            isDeleted: false,
          };
        }

        console.log(`Parsed post ${index}:`, parsedPost);
        return parsedPost;
      });

      const response = {
        posts: posts.filter((post) => post.author && !post.isDeleted),
        total: Number(totalCount) || 0,
      };

      console.log("Final processed response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching all posts:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
      });
      return { posts: [], total: 0 };
    }
  }

  async checkIfLiked(publicClient, postId, userAddress) {
    try {
      return await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "checkIfLiked",
        args: [BigInt(postId), userAddress],
      });
    } catch (error) {
      console.error("Error checking like status:", error);
      return false;
    }
  }

  async likePost(walletClient, postId) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "likePost",
        args: [BigInt(postId)],
      });

      return this.executeTransaction(Promise.resolve(hash), "Liking post...");
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async unlikePost(walletClient, postId) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "unlikePost",
        args: [BigInt(postId)],
      });

      return this.executeTransaction(Promise.resolve(hash), "Unliking post...");
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async addComment(walletClient, comment, postId, isReply = false, parentCommentIndex = 0) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "addComment",
        args: [comment, BigInt(postId), isReply, BigInt(parentCommentIndex)],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        isReply ? "Replying to broadcast..." : "Adding comment..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async getPostComments(publicClient, postId) {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "getPostComments",
        args: [BigInt(postId)],
      });

      return result.map((c) => ({
        author: c.author,
        text: c.text,
        timeCreated: Number(c.timeCreated),
        isReply: c.isReply,
        parentCommentIndex: Number(c.parentCommentIndex),
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  }

  async editPost(walletClient, postId, newDescription) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "editPost",
        args: [BigInt(postId), newDescription],
      });

      return this.executeTransaction(Promise.resolve(hash), "Editing post...");
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async deletePost(walletClient, postId) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "deletePost",
        args: [BigInt(postId)],
      });

      return this.executeTransaction(Promise.resolve(hash), "Deleting post...");
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  // GROUP FUNCTIONS
  async createGroup(walletClient, name, description) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "createGroup",
        args: [name, description],
        value: parseEther("0.000003"),
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Creating group..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async joinGroup(walletClient, groupId) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "joinGroup",
        args: [BigInt(groupId)],
      });

      return this.executeTransaction(Promise.resolve(hash), "Joining group...");
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async getGroupDetails(publicClient, groupId) {
    try {
      const result = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "getGroupDetails",
        args: [BigInt(groupId)],
      });

      return {
        members: result[0],
        name: result[1],
        description: result[2],
        memberCount: Number(result[3]),
        creator: result[4],
      };
    } catch (error) {
      console.error("Error fetching group details:", error);
      return null;
    }
  }

  async getAllGroupIds(publicClient) {
    try {
      const groupIds = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "getAllGroupIds",
        args: [],
      });
      return groupIds.map((id) => Number(id));
    } catch (error) {
      console.error("Error fetching group IDs:", error);
      return [];
    }
  }

  async deleteGroup(walletClient, groupId) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "deleteGroup",
        args: [BigInt(groupId)],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Deleting group..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  // MESSAGING FUNCTIONS
  async sendDirectMessage(walletClient, recipientAddress, message, replyToIndex = -1) {
    console.log("Service: sendDirectMessage", { recipientAddress, message, replyToIndex });
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "sendDirectMessage",
        args: [recipientAddress, message, BigInt(replyToIndex)],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Sending message..."
      );
    } catch (error) {
      console.error("Service: sendDirectMessage error:", error);
      return { success: false, error: this.parseError(error) };
    }
  }

  async deleteDirectMessage(walletClient, recipientAddress, index) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "deleteDirectMessage",
        args: [recipientAddress, BigInt(index)],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Deleting message..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async getDirectMessages(publicClient, otherUserAddress, currentUserAddress) {
    try {
      const messages = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "getDirectMessages",
        args: [otherUserAddress],
        account: currentUserAddress,
      });

      return messages.map((msg) => ({
        sender: msg.sender || msg[0],
        timestamp: Number(msg.timestamp || msg[1]),
        content: msg.content || msg[2],
        isDeleted: msg.isDeleted || msg[3] || false,
        replyToIndex: Number(msg.replyToIndex || msg[4])
      }));
    } catch (error) {
      console.error("Error fetching direct messages:", error);
      return [];
    }
  }

  // SYSTEM FUNCTIONS
  async getContractOwner(publicClient) {
    try {
      const owner = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "owner",
        args: [],
      });
      return owner;
    } catch (error) {
      console.error("Error fetching contract owner:", error);
      return null;
    }
  }

  async checkIsAdmin(publicClient, address) {
    try {
      const isAdmin = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "checkIsAdmin",
        args: [address],
      });
      return isAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  async addAdmin(walletClient, adminAddress) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "addAdmin",
        args: [adminAddress],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Adding admin..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async removeAdmin(walletClient, adminAddress) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "removeAdmin",
        args: [adminAddress],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Removing admin..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  // GROUP MESSAGING FUNCTIONS

  async sendGroupMessage(walletClient, groupId, message, replyToIndex = -1) {
    console.log("Service: sendGroupMessage", { groupId, message, replyToIndex });
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "sendGroupMessage",
        args: [BigInt(groupId), message, BigInt(replyToIndex)],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Sending group message..."
      );
    } catch (error) {
      console.error("Service: sendGroupMessage error:", error);
      return { success: false, error: this.parseError(error) };
    }
  }

  async getGroupMessages(publicClient, groupId, currentUserAddress) {
    try {
      const messages = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "getGroupMessages",
        args: [BigInt(groupId)],
        account: currentUserAddress,
      });

      return messages.map((msg) => ({
        sender: msg.sender || msg[0],
        timestamp: Number(msg.timestamp || msg[1]),
        content: msg.content || msg[2],
        isDeleted: msg.isDeleted || msg[3],
        replyToIndex: Number(msg.replyToIndex || msg[4])
      }));
    } catch (error) {
      console.error("Error fetching group messages:", error);
      return [];
    }
  }

  // Compatibility function for local state updates
  async storeGroupMessage(groupId, messageData) {
    try {
      if (typeof window !== "undefined") {
        const messagesKey = `group_messages_${groupId}`;
        const storedMessages = localStorage.getItem(messagesKey);
        let messages = storedMessages ? JSON.parse(storedMessages) : [];
        messages.push(messageData);
        localStorage.setItem(messagesKey, JSON.stringify(messages));
      }
      return true;
    } catch (error) {
      console.error("Error storing group message:", error);
      return false;
    }
  }

  async deleteGroupMessage(walletClient, groupId, index) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "deleteGroupMessage",
        args: [BigInt(groupId), BigInt(index)],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Deleting message..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  // USER FUNCTIONS
  async getAllUsers(publicClient, offset = 0, limit = 20) {
    try {
      console.log("Fetching all users with offset:", offset, "limit:", limit);

      const result = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "getAllUsers",
        args: [BigInt(offset), BigInt(limit)],
      });

      console.log("Raw users result:", result);

      const usersArray = Array.isArray(result)
        ? result[0]
        : result.users || result[0];
      const totalCount = Array.isArray(result)
        ? result[1]
        : result.total || result[1];

      const users = usersArray
        .map((user, index) => {
          console.log(`Processing user ${index}:`, user);

          let parsedUser;
          if (Array.isArray(user)) {
            parsedUser = {
              owner: user[0],
              name: user[1],
              timeCreated: Number(user[2]),
              id: Number(user[3]),
              postCount: Number(user[4]),
              followerCount: Number(user[5]),
              followingCount: Number(user[6]),
            };
          } else if (typeof user === "object") {
            parsedUser = {
              owner: user.owner,
              name: user.name,
              timeCreated: Number(user.timeCreated),
              id: Number(user.id),
              postCount: Number(user.postCount),
              followerCount: Number(user.followerCount),
              followingCount: Number(user.followingCount),
            };
          } else {
            console.warn("Unexpected user structure:", user);
            return null;
          }

          if (
            !parsedUser.owner ||
            !parsedUser.name ||
            parsedUser.owner === "0x0000000000000000000000000000000000000000"
          ) {
            console.warn("Invalid user data, skipping:", parsedUser);
            return null;
          }

          console.log(`Parsed user ${index}:`, parsedUser);
          return parsedUser;
        })
        .filter((user) => user !== null);

      const response = {
        users,
        total: Number(totalCount) || 0,
      };

      console.log("Final users response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching all users:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        data: error.data,
      });
      return { users: [], total: 0 };
    }
  }

  // Debug function to test contract calls
  async debugContractCall(publicClient) {
    try {
      console.log("=== DEBUG CONTRACT CALL ===");

      const postCounter = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "postCounter",
        args: [],
      });
      console.log("Post counter:", Number(postCounter));

      const rawResult = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "getAllPosts",
        args: [BigInt(0), BigInt(10)],
      });

      console.log("Raw getAllPosts result type:", typeof rawResult);
      console.log("Raw getAllPosts result:", rawResult);
      console.log("Is array:", Array.isArray(rawResult));

      if (Array.isArray(rawResult)) {
        console.log("Result length:", rawResult.length);
        console.log("First element (posts):", rawResult[0]);
        console.log("Second element (total):", rawResult[1]);

        if (rawResult[0] && rawResult[0].length > 0) {
          console.log("First post structure:", rawResult[0][0]);
          console.log("First post keys:", Object.keys(rawResult[0][0] || {}));
        }
      }

      console.log("=== END DEBUG ===");
      return rawResult;
    } catch (error) {
      console.error("Debug contract call failed:", error);
      return null;
    }
  }
  async pauseContract(walletClient) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "pause",
        args: [],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Pausing contract..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async unpauseContract(walletClient) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "unpause",
        args: [],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Unpausing contract..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async deactivateGroup(walletClient, groupId) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "deactivateGroup",
        args: [BigInt(groupId)],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Deactivating group..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async emergencyWithdraw(walletClient) {
    try {
      const hash = await walletClient.writeContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "emergencyWithdraw",
        args: [],
      });

      return this.executeTransaction(
        Promise.resolve(hash),
        "Processing withdrawal..."
      );
    } catch (error) {
      return { success: false, error: this.parseError(error) };
    }
  }

  async getContractBalance(publicClient) {
    try {
      const balance = await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "getContractBalance",
        args: [],
      });
      return formatEther(balance);
    } catch (error) {
      console.error("Error fetching contract balance:", error);
      return "0";
    }
  }

  async isContractPaused(publicClient) {
    try {
      return await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "paused",
        args: [],
      });
    } catch (error) {
      console.error("Error checking pause status:", error);
      return false;
    }
  }

  async getContractOwner(publicClient) {
    try {
      return await publicClient.readContract({
        address: this.contractAddress,
        abi: this.abi,
        functionName: "owner",
        args: [],
      });
    } catch (error) {
      console.error("Error fetching contract owner:", error);
      return null;
    }
  }
}

export const contractService = new ContractService();
export default contractService;
