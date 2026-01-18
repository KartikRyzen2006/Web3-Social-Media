// SPDX-License-Identifier: MIT
// Force recompile 1 // Comment to trigger smart contract recompilation
pragma solidity ^0.8.19; // Specifies the Solidity compiler version to use

import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; // Security library to prevent reentrancy attacks
import "@openzeppelin/contracts/access/Ownable.sol"; // Access control library to manage contract ownership
import "@openzeppelin/contracts/security/Pausable.sol"; // Library to allow pausing contract functions in emergencies

/**
 * @title OptimizedSocialMediaDapp
 * @dev A gas-optimized, secure social media smart contract with enhanced features
 * @author Your Name
 */
contract SocialMediaDapp is ReentrancyGuard, Ownable, Pausable { // Contract declaration with inherited security features
    
    // ============ CONSTANTS ============ // Fixed values used for validation
    uint256 private constant MAX_USERNAME_LENGTH = 50; // Maximum characters allowed for a username
    uint256 private constant MAX_POST_DESCRIPTION_LENGTH = 1000; // Maximum characters allowed for a post description
    uint256 private constant MAX_GROUP_NAME_LENGTH = 100; // Maximum characters allowed for a group name
    uint256 private constant MAX_MESSAGE_LENGTH = 500; // Maximum characters allowed for a message
    uint256 private constant MAX_COMMENT_LENGTH = 300; // Maximum characters allowed for a comment

    // ============ STATE VARIABLES ============ // Global variables stored on the blockchain
    uint256 public postCounter; // Tracks the total number of posts created
    uint256 public userCounter; // Tracks the total number of users registered
    uint256 public groupCounter; // Tracks the total number of groups created
    
    // ============ FEES ============ //
    uint256 public postFee = 0.000003 ether;
    uint256 public groupFee = 0.000003 ether;
    
    // Packed struct for gas optimization // Using uint32 saves space by packing variables into single storage slots
    struct Profile { // Defines the data structure for a user profile
        address owner; // Wallet address of the profile owner
        string name; // Direct name (username) of the user
        uint32 timeCreated; // Unix timestamp when the profile was created
        uint32 id; // Unique internal ID for the user
        uint32 postCount; // Number of posts created by this user
        uint32 followerCount; // Number of followers this user has
        uint32 followingCount; // Number of accounts this user is following
    }

    struct Post { // Defines the data structure for a post
        address author; // Wallet address of the post creator
        string postType; // Type of post (e.g., "text", "image", "video")
        string postDescription; // Text content of the post
        string postURL; // Optional URL for media content (e.g., IPFS hash)
        uint32 timeCreated; // Unix timestamp when the post was created
        uint32 postID; // Unique internal ID for the post
        uint32 likes; // Total number of likes the post has received
        uint32 commentCount; // Total number of comments on this post
        bool isDeleted; // Flag indicating if the post has been deleted
    }

    struct Message { // Defines the data structure for a direct message
        address sender; // Wallet address of the message sender
        uint32 timestamp; // Unix timestamp when the message was sent
        string content; // The text content of the message
        bool isDeleted; // Flag indicating if the message has been deleted
        int256 replyToIndex; // Index of the message being replied to (-1 if none)
    }

    struct Comment { // Defines the data structure for a comment
        address author; // Wallet address of the commenter
        string text; // The text content of the comment
        uint32 timeCreated; // Unix timestamp when the comment was created
        bool isReply; // Flag indicating if this is a reply to another comment
        uint256 parentCommentIndex; // Index of the parent comment in the post's comment array
    }

    struct Group { // Defines the data structure for a social group
        string name; // Name of the group
        string description; // Description of the group's purpose
        uint32 groupID; // Unique internal ID for the group
        uint32 memberCount; // Number of members in the group
        address creator; // Wallet address of the group creator
        bool isActive; // Flag indicating if the group is still active
    }

    struct UserSummary { // Simplified view of user data for efficient fetching
        address owner; // Wallet address of the user
        string name; // Username
        uint32 timeCreated; // Profile creation timestamp
        uint32 id; // User ID
        uint32 postCount; // Total posts
        uint32 followerCount; // Total followers
        uint32 followingCount; // Total following
    }

    // ============ MAPPINGS ============ // Key-value stores for data access
    mapping(address => Profile) public profiles; // Maps a wallet address to its associated Profile struct
    mapping(string => address) private usernameToAddress; // Maps a username string to its owner's wallet address
    mapping(address => Post[]) private userPosts; // Maps a user address to an array of their posts
    mapping(address => address[]) private userFollowers; // Maps a user address to an array of their followers' addresses
    mapping(address => address[]) private userFollowing; // Maps a user address to an array of addresses they follow
    mapping(address => mapping(address => bool)) private isFollowing; // nested mapping to check if A follows B
    mapping(uint256 => Post) private allPostsById; // Maps a post ID to the Post struct for global access
    mapping(uint256 => Comment[]) private postComments; // Maps a post ID to an array of its Comment structs
    mapping(uint256 => mapping(address => bool)) private hasLikedPost; // nested mapping to check if a user liked a post
    
    struct GroupMessage { // Defines the data structure for messages within a group
        address sender; // Sender's wallet address
        uint32 timestamp; // Time message was sent
        string content; // Message content
        bool isDeleted;
        int256 replyToIndex;
    }

    // Group mappings
    mapping(uint256 => Group) public groups;
    mapping(uint256 => address[]) private groupMembers;
    mapping(uint256 => mapping(address => bool)) private isGroupMember;
    mapping(uint256 => GroupMessage[]) private groupMessages; // Struct array instead of primitive mapping
    
    // Chat mappings
    mapping(bytes32 => Message[]) private chatMessages;
    
    // Active users array for iteration (gas-optimized)
    address[] private activeUsers;
    mapping(address => bool) private isActiveUser; // Check if an address is already in the activeUsers list

    // ... (rest of code) ... // Marker for internal organizational logic

    /**
     * @dev Send message to group
     * @param groupId Group ID
     * @param message Message content
     * @param replyToIndex Index of message replying to (-1 if none)
     */
    function sendGroupMessage(uint256 groupId, string calldata message, int256 replyToIndex) 
        external // Callable from off-chain
        hasProfile // Caller must have registered
        validGroupId(groupId) // Group must exist and be active
        onlyGroupMember(groupId) // Caller must be in the group
        validString(message, MAX_MESSAGE_LENGTH) // Message length check
        whenNotPaused // Contract must not be paused
    {
        groupMessages[groupId].push(GroupMessage({ // Append new message to the group's storage array
            sender: msg.sender, // Caller is the sender
            timestamp: uint32(block.timestamp), // Time of transaction
            content: message, // Text content
            isDeleted: false, // Default state
            replyToIndex: replyToIndex // Associated reply index
        }));

        emit GroupMessageSent(groupId, msg.sender, message); // Log message event
    }

    /**
     * @dev Get group messages
     * @param groupId Group ID
     */
    function getGroupMessages(uint256 groupId) 
        external // Public access
        view // Read-only access
        validGroupId(groupId) // Group ID check
        onlyGroupMember(groupId) // Member check
        returns (GroupMessage[] memory) // Returns list in memory
    {
        return groupMessages[groupId]; // Fetch entire message history for group
    }

    /**
     * @dev Delete group message (soft delete)
     * @param groupId Group ID
     * @param index Message index
     */
    function deleteGroupMessage(uint256 groupId, uint256 index)
        external // Public access
        validGroupId(groupId) // Group ID check
        onlyGroupMember(groupId) // Member check
        whenNotPaused // Pause check
    {
        require(index < groupMessages[groupId].length, "Message does not exist"); // Verify index is within bounds
        GroupMessage storage msgToDelete = groupMessages[groupId][index]; // Get storage pointer
        require(msgToDelete.sender == msg.sender, "Can only delete own messages"); // Only author can delete
        require(!msgToDelete.isDeleted, "Message already deleted"); // Pre-existing deletion check

        msgToDelete.isDeleted = true; // Set deleted flag
        msgToDelete.content = ""; // Wipe content string for data privacy/gas
    }

    // ============ EVENTS ============ // Real-time announcements for the frontend
    event ProfileCreated(address indexed user, string name, uint256 userId); // Profile setup complete
    event PostCreated(address indexed author, uint256 indexed postId, string postType); // Content broadcasted
    event PostLiked(address indexed liker, uint256 indexed postId); // Heart reaction added
    event PostUnliked(address indexed unliker, uint256 indexed postId); // Heart reaction removed
    event CommentAdded(address indexed commenter, uint256 indexed postId, string comment, bool isReply, uint256 parentCommentIndex); // Response added
    event UserFollowed(address indexed follower, address indexed followed); // Network connection made
    event UserUnfollowed(address indexed unfollower, address indexed unfollowed); // Network connection severed
    event GroupCreated(uint256 indexed groupId, address indexed creator, string name); // New sub-community formed
    event UserJoinedGroup(uint256 indexed groupId, address indexed user); // New member added to group
    event GroupDeleted(uint256 indexed groupId, address indexed creator); // Community disbanded
    event GroupMessageSent(uint256 indexed groupId, address indexed sender, string message); // Group dialogue log
    event DirectMessageSent(address indexed sender, address indexed recipient); // P2P dialogue log
    event PostDeleted(address indexed author, uint256 indexed postId); // Content removed
    event PostEdited(address indexed author, uint256 indexed postId); // Content updated
    event ProfileNameUpdated(address indexed user, string newName); // Username updated
    event ProfileDeleted(address indexed user); // Profile deleted

    // ============ MODIFIERS ============ // Logical gates for function execution
    modifier hasProfile() { // Ensures sender has a profile
        require(profiles[msg.sender].owner == msg.sender, "Profile required"); // ownership check
        _; // run function body
    }

    modifier profileExists(address user) { // Ensures target user has a profile
        require(profiles[user].owner == user, "Profile does not exist"); // check mapping
        _; // run function body
    }

    modifier validString(string calldata str, uint256 maxLength) { // String validation logic
        require(bytes(str).length > 0 && bytes(str).length <= maxLength, "Invalid string length"); // min/max check
        _; // run function body
    }

    modifier postExists(uint256 postId) { // Ensures post ID refers to valid content
        require(postId > 0 && postId <= postCounter && !allPostsById[postId].isDeleted, "Post does not exist"); // ID and deletion check
        _; // run function body
    }

    modifier onlyPostAuthor(uint256 postId) { // Author-only restriction
        require(allPostsById[postId].author == msg.sender, "Not post author"); // Ownership check
        _; // run function body
    }

    modifier validGroupId(uint256 groupId) { // Group existence check
        require(groupId > 0 && groupId <= groupCounter && groups[groupId].isActive, "Invalid group"); // ID and active check
        _; // run function body
    }

    modifier onlyGroupMember(uint256 groupId) { // Group membership restriction
        require(isGroupMember[groupId][msg.sender], "Not a group member"); // membership mapping check
        _; // run function body
    }

    // ============ CONSTRUCTOR ============ // runs once when the contract is deployed
    constructor() { // Initialization function
        _transferOwnership(msg.sender); // Set the deployer as the initial owner
    }

    // ============ PROFILE FUNCTIONS ============ // Core user identity logic
    
    /**
     * @dev Create a new user profile
     * @param name Username (must be unique and within length limits)
     */
    function createProfile(string calldata name) 
        external // Publicly callable
        validString(name, MAX_USERNAME_LENGTH) // check name length
        whenNotPaused // check pause state
    {
        require(profiles[msg.sender].owner == address(0), "Profile already exists"); // Ensure one profile per wallet
        require(usernameToAddress[name] == address(0), "Username taken"); // Ensure unique usernames

        unchecked { // Optimized arithmetic (gas saving)
            ++userCounter; // Increment total user count
        }

        profiles[msg.sender] = Profile({ // Create and store profile data
            owner: msg.sender, // Wallet address
            name: name, // Chosen handle
            timeCreated: uint32(block.timestamp), // Creation time
            id: uint32(userCounter), // Numerical ID
            postCount: 0, // start with 0 posts
            followerCount: 0, // start with 0 followers
            followingCount: 0 // start with 0 following
        });

        usernameToAddress[name] = msg.sender; // set lookup for username uniqueness
        
        if (!isActiveUser[msg.sender]) { // check if user is already tracked
            activeUsers.push(msg.sender); // add to iteration list
            isActiveUser[msg.sender] = true; // mark as active
        }

        emit ProfileCreated(msg.sender, name, userCounter); // announce new user
    }

    /**
     * @dev Follow another user
     * @param userToFollow Address of user to follow
     */
    function followUser(address userToFollow) 
        external // Publicly callable
        hasProfile // Sender must be registered
        profileExists(userToFollow) // Target must be registered
        whenNotPaused // Not paused check
    {
        require(userToFollow != msg.sender, "Cannot follow yourself"); // Block self-following
        require(!isFollowing[msg.sender][userToFollow], "Already following"); // Block duplicate following

        isFollowing[msg.sender][userToFollow] = true; // update membership mapping
        userFollowers[userToFollow].push(msg.sender); // add sender to target's followers
        userFollowing[msg.sender].push(userToFollow); // add target to sender's following list

        unchecked { // Gas saving increment
            ++profiles[userToFollow].followerCount; // update target count
            ++profiles[msg.sender].followingCount; // update sender count
        }

        emit UserFollowed(msg.sender, userToFollow); // announce connection
    }

    /**
     * @dev Unfollow a user
     * @param userToUnfollow Address of user to unfollow
     */
    function unfollowUser(address userToUnfollow) 
        external // Publicly callable
        hasProfile // Sender must be registered
        profileExists(userToUnfollow) // Target must be registered
        whenNotPaused // Not paused check
    {
        require(userToUnfollow != msg.sender, "Cannot unfollow yourself"); // Block self-unfollowing
        require(isFollowing[msg.sender][userToUnfollow], "Not following"); // Ensure connection exists

        isFollowing[msg.sender][userToUnfollow] = false; // remove from membership mapping

        // Remove from arrays (gas-optimized removal) // Internal cleanup functions
        _removeFromArray(userFollowers[userToUnfollow], msg.sender); // slice out of follower list
        _removeFromArray(userFollowing[msg.sender], userToUnfollow); // slice out of following list

        unchecked { // optimized underflow check
            --profiles[userToUnfollow].followerCount; // decrement target count
            --profiles[msg.sender].followingCount; // decrement sender count
        }

        emit UserUnfollowed(msg.sender, userToUnfollow); // announce disconnection
    }

    /**
     * @dev Update profile name
     * @param newName New username
     */
    function setProfileName(string calldata newName) 
        external 
        hasProfile 
        validString(newName, MAX_USERNAME_LENGTH) 
        whenNotPaused 
    {
        require(usernameToAddress[newName] == address(0), "Username taken");
        
        string memory oldName = profiles[msg.sender].name;
        delete usernameToAddress[oldName];
        
        profiles[msg.sender].name = newName;
        usernameToAddress[newName] = msg.sender;
        
        emit ProfileNameUpdated(msg.sender, newName);
    }

    /**
     * @dev Delete profile
     */
    function deleteProfile() 
        external 
        hasProfile 
        whenNotPaused 
    {
        string memory name = profiles[msg.sender].name;
        
        delete usernameToAddress[name];
        delete profiles[msg.sender];
        
        if (isActiveUser[msg.sender]) {
            isActiveUser[msg.sender] = false;
            _removeFromArray(activeUsers, msg.sender);
        }
        
        emit ProfileDeleted(msg.sender);
    }

    // ============ POST FUNCTIONS ============ // Core content creation and interaction
    
    /**
     * @dev Create a new post
     * @param postType Type of post (text, image, video)
     * @param description Post description
     * @param postURL IPFS URL for media content
     */
    function createPost(
        string calldata postType,
        string calldata description,
        string calldata postURL
    ) 
        external // Publicly callable
        hasProfile // Sender must be registered
        validString(postType, 20) // validate type length
        validString(description, MAX_POST_DESCRIPTION_LENGTH) // validate content length
        whenNotPaused // Pause check
        payable // Allow ETH to be sent
    {
        require(msg.value >= postFee, "Insufficient fee"); // Fee check
        unchecked { // optimized overflow check
            ++postCounter; // create new unique post ID
        }

        Post memory newPost = Post({ // Assemble the post struct in memory first
            author: msg.sender, // Caller is the owner
            postType: postType, // Categorization
            postDescription: description, // Text content
            postURL: postURL, // Media reference
            timeCreated: uint32(block.timestamp), // Posting time
            postID: uint32(postCounter), // Assigned ID
            likes: 0, // Starts with no likes
            commentCount: 0, // Starts with no comments
            isDeleted: false // Active state
        });

        userPosts[msg.sender].push(newPost); // Add to user's personal feed
        allPostsById[postCounter] = newPost; // Add to global lookup map

        unchecked { // gas-efficient counter
            ++profiles[msg.sender].postCount; // update user profile stats
        }

        emit PostCreated(msg.sender, postCounter, postType); // announce new content
    }

    /**
     * @dev Like a post
     * @param postId ID of post to like
     */
    function likePost(uint256 postId) 
        external // Publicly callable
        hasProfile // Voter must be registered
        postExists(postId) // content must exist
        whenNotPaused // Pause check
    {
        require(!hasLikedPost[postId][msg.sender], "Already liked"); // Prevent double voting

        hasLikedPost[postId][msg.sender] = true; // Mark as liked in mapping
        unchecked { // optimized increment
            ++allPostsById[postId].likes; // update global post stats
        }

        // Update in user's posts array // Sync the specific copy in author's list
        _updatePostInUserArray(allPostsById[postId].author, postId);

        emit PostLiked(msg.sender, postId); // Log like event
    }

    /**
     * @dev Unlike a post
     * @param postId ID of post to unlike
     */
    function unlikePost(uint256 postId) 
        external // Publicly callable
        hasProfile // Voter must be registered
        postExists(postId) // content must exist
        whenNotPaused // Pause check
    {
        require(hasLikedPost[postId][msg.sender], "Not liked"); // Must have liked first

        hasLikedPost[postId][msg.sender] = false; // Remove like status
        unchecked { // optimized decrement
            --allPostsById[postId].likes; // decrease global count
        }

        // Update in user's posts array // Sync data across copies
        _updatePostInUserArray(allPostsById[postId].author, postId);
        emit PostUnliked(msg.sender, postId); // Log unlike event
    }

    /**
     * @dev Check if a user has liked a specific post
     * @param postId ID of post
     * @param user Address of user
     * @return True if liked, false otherwise
     */
    function checkIfLiked(uint256 postId, address user) external view returns (bool) {
        return hasLikedPost[postId][user]; // Direct mapping lookup for UI state
    }

    /**
     * @dev Add comment to a post
     * @param comment Comment text
     * @param postId ID of post to comment on
     * @param isReply True if this is a reply to another comment
     * @param parentCommentIndex Index of the parent comment
     */
    function addComment(
        string calldata comment, 
        uint256 postId, 
        bool isReply, 
        uint256 parentCommentIndex
    ) 
        external // Publicly callable
        hasProfile // Commenter must be registered
        postExists(postId) // post must exist
        validString(comment, MAX_COMMENT_LENGTH) // length check
        whenNotPaused // pause check
    {
        postComments[postId].push(Comment({ // Append new comment struct to storage
            author: msg.sender, // Caller address
            text: comment, // Comment body
            timeCreated: uint32(block.timestamp), // Time added
            isReply: isReply, // Multi-level tracking
            parentCommentIndex: parentCommentIndex // Threading logic
        }));
        
        unchecked { // gas-efficient increment
            ++allPostsById[postId].commentCount; // update global post stats
        }

        // Update in user's posts array // keep profile view in sync
        _updatePostInUserArray(allPostsById[postId].author, postId);

        emit CommentAdded(msg.sender, postId, comment, isReply, parentCommentIndex); // Log comment event
    }

    /**
     * @dev Edit a post (only description)
     * @param postId ID of post to edit
     * @param newDescription New description
     */
    function editPost(uint256 postId, string calldata newDescription) 
        external // Publicly callable
        hasProfile // Editor must be registered
        postExists(postId) // Post must exist
        onlyPostAuthor(postId) // Only author can edit
        validString(newDescription, MAX_POST_DESCRIPTION_LENGTH) // validate length
        whenNotPaused // pause check
    {
        allPostsById[postId].postDescription = newDescription; // update global description
        
        // Update in user's posts array // sync across records
        _updatePostInUserArray(msg.sender, postId);

        emit PostEdited(msg.sender, postId); // Announcement
    }

    /**
     * @dev Delete a post
     * @param postId ID of post to delete
     */
    function deletePost(uint256 postId) 
        external // Publicly callable
        hasProfile // Deleter must be registered
        postExists(postId) // post must exist
        onlyPostAuthor(postId) // Only author can delete
        whenNotPaused // pause check
    {
        allPostsById[postId].isDeleted = true; // Mark as deleted (soft delete)
        
        // Update in user's posts array
        _updatePostInUserArray(allPostsById[postId].author, postId);
        
        unchecked {
            --profiles[msg.sender].postCount; // Decrement user profile post count
        }

        emit PostDeleted(msg.sender, postId); // Announce deletion
    }

    // ============ GROUP FUNCTIONS ============ // Shared spaces for user interaction
    
    /**
     * @dev Create a new group (only owner)
     * @param name Group name
     * @param description Group description
     */
    function createGroup(string calldata name, string calldata description) 
        external // Publicly callable
        hasProfile // Creator must be registered
        validString(name, MAX_GROUP_NAME_LENGTH) // Check name length
        validString(description, 500) // check description length
        whenNotPaused // Pause check
        payable // Allow ETH to be sent
    {
        require(msg.value >= groupFee, "Insufficient fee"); // Fee check
        unchecked { // Optimized counter increment
            ++groupCounter; // generate new group ID
        }

        groups[groupCounter] = Group({ // Save group structural data
            name: name, // public handle
            description: description, // about text
            groupID: uint32(groupCounter), // assigned ID
            memberCount: 1, // Start with the creator as a member
            creator: msg.sender, // Caller is the owner/admin
            isActive: true // active state
        });

        groupMembers[groupCounter].push(msg.sender); // add creator to member list array
        isGroupMember[groupCounter][msg.sender] = true; // set membership lookup mapping

        emit GroupCreated(groupCounter, msg.sender, name); // Announce group formation
    }

    /**
     * @dev Join a group
     * @param groupId ID of group to join
     */
    function joinGroup(uint256 groupId) 
        external // Publicly callable
        hasProfile // Joiner must be registered
        validGroupId(groupId) // group must exist
        whenNotPaused // pause check
    {
        require(!isGroupMember[groupId][msg.sender], "Already a member"); // prevent double entry

        groupMembers[groupId].push(msg.sender); // Add to member list array
        isGroupMember[groupId][msg.sender] = true; // Mark as member in mapping
        
        unchecked { // gas-efficient increment
            ++groups[groupId].memberCount; // update group stats
        }

        emit UserJoinedGroup(groupId, msg.sender); // Announce member join
    }

    /**
     * @dev Delete a group (only group creator)
     * @param groupId Group ID to delete
     */
    function deleteGroup(uint256 groupId) 
        external // Publicly callable
        hasProfile // Deleter must be registered
        validGroupId(groupId) // group must exist
        whenNotPaused // pause check
    {
        require(groups[groupId].creator == msg.sender, "Only group creator can delete"); // Authorization check
        groups[groupId].isActive = false; // Mark as inactive (cannot join/message)
        emit GroupDeleted(groupId, msg.sender); // Announce disbanding
    }

    // ============ MESSAGING FUNCTIONS ============ // P2P encrypted/direct communication
    
    /**
     * @dev Send a direct message to another user
     * @param recipient Message recipient
     * @param messageContent Message content
     * @param replyToIndex Index of message being replied to (-1 if none)
     */
    function sendDirectMessage(address recipient, string calldata messageContent, int256 replyToIndex) 
        external // Publicly callable
        hasProfile // Sender must be registered
        profileExists(recipient) // recipient must exist
        validString(messageContent, MAX_MESSAGE_LENGTH) // length check
        whenNotPaused // pause check
    {
        require(recipient != msg.sender, "Cannot message yourself"); // logic check

        bytes32 chatId = _getChatId(msg.sender, recipient); // Generate deterministic chat identifier
        
        chatMessages[chatId].push(Message({ // Store message in the specific chat array
            sender: msg.sender, // message author
            timestamp: uint32(block.timestamp), // time sent
            content: messageContent, // text content
            isDeleted: false, // default state
            replyToIndex: replyToIndex // thread referencing logic
        }));

        emit DirectMessageSent(msg.sender, recipient); // Announce message event (no content for privacy)
    }

    /**
     * @dev Delete a direct message (soft delete)
     * @param recipient The other user in the chat
     * @param index The index of the message to delete
     */
    function deleteDirectMessage(address recipient, uint256 index) 
        external // Publicly callable
        hasProfile // Deleter must be registered
        profileExists(recipient) // conversation participant check
        whenNotPaused // pause check
    {
        bytes32 chatId = _getChatId(msg.sender, recipient); // fetch chat ID
        require(index < chatMessages[chatId].length, "Message does not exist"); // bounds check
        
        Message storage msgToDelete = chatMessages[chatId][index]; // get storage ref
        require(msgToDelete.sender == msg.sender, "Can only delete own messages"); // author check
        require(!msgToDelete.isDeleted, "Message already deleted"); // duplicate deletion check

        msgToDelete.isDeleted = true; // set soft delete flag
        msgToDelete.content = ""; // wipe data
    }

    // ============ VIEW FUNCTIONS ============ // Non-gas operations for checking data
    
    /**
     * @dev Get user's posts
     * @param user User address
     * @return Array of user's posts
     */
    function getUserPosts(address user) external view profileExists(user) returns (Post[] memory) {
        Post[] storage allUserPosts = userPosts[user]; // Reference the user's post storage
        uint256 activeCount = 0; // counter for non-deleted posts
        
        for (uint256 i = 0; i < allUserPosts.length; i++) { // First pass: count active posts
            if (!allUserPosts[i].isDeleted && allUserPosts[i].author != address(0)) { // sanity check
                activeCount++; // increment
            }
        }
        
        Post[] memory activePosts = new Post[](activeCount); // Initialize memory array of correct size
        uint256 currentIndex = 0; // tracker for insertion
        
        for (uint256 i = 0; i < allUserPosts.length; i++) { // Second pass: fill the array
            if (!allUserPosts[i].isDeleted && allUserPosts[i].author != address(0)) { // filter check
                activePosts[currentIndex] = allUserPosts[i]; // copy post data
                currentIndex++; // increment index
            }
        }
        
        return activePosts; // Return the filtered result
    }

    /**
     * @dev Get all posts (paginated)
     * @param offset Starting index
     * @param limit Number of posts to return
     * @return posts Array of posts
     * @return total Total number of posts
     */
    function getAllPosts(uint256 offset, uint256 limit) 
        external // Publicly callable
        view // Read-only
        returns (Post[] memory posts, uint256 total) 
    {
        total = postCounter; // Fetch total count from state
        
        if (offset >= total) { // handle out-of-bounds offset
            return (new Post[](0), total); // return empty results
        }

        uint256 end = offset + limit; // calculate logical end
        if (end > total) { // cap at total
            end = total; // overflow handling
        }

        uint256 resultCount = 0; // capacity tracker
        // Count non-deleted posts in range
        for (uint256 i = offset + 1; i <= end; i++) { // range iterate
            if (!allPostsById[i].isDeleted) { // filter check
                resultCount++; // count active items
            }
        }

        posts = new Post[](resultCount); // Allocate memory array
        uint256 currentIndex = 0; // insertion tracker

        for (uint256 i = offset + 1; i <= end; i++) { // range iterate and fill
            if (!allPostsById[i].isDeleted) {
                posts[currentIndex] = allPostsById[i];
                currentIndex++;
            }
        }
    }

    /**
     * @dev Get post comments
     * @param postId Post ID
     * @return Array of comments
     */
    function getPostComments(uint256 postId) external view postExists(postId) returns (Comment[] memory) {
        return postComments[postId]; // Fetches the full array of comments for a given post
    }

    /**
     * @dev Get user followers
     * @param user User address
     * @return Array of follower addresses
     */
    function getUserFollowers(address user) external view profileExists(user) returns (address[] memory) {
        return userFollowers[user]; // Fetches list of addresses that follow this user
    }

    /**
     * @dev Get users that a user is following
     * @param user User address
     * @return Array of following addresses
     */
    function getUserFollowing(address user) external view profileExists(user) returns (address[] memory) {
        return userFollowing[user]; // Fetches list of addresses this user follows
    }

    /**
     * @dev Check if user is following another user
     * @param follower Follower address
     * @param followed Followed address
     * @return true if following
     */
    function checkIsFollowing(address follower, address followed) external view returns (bool) {
        return isFollowing[follower][followed]; // Simple boolean check in the lookup mapping
    }

    /**
     * @dev Get all active users (paginated)
     * @param offset Starting index
     * @param limit Number of users to return
     * @return users Array of user summaries
     * @return total Total number of users
     */
    function getAllUsers(uint256 offset, uint256 limit) 
        external // Public callable
        view // read-only
        returns (UserSummary[] memory users, uint256 total) 
    {
        total = activeUsers.length; // Total registered users count
        
        if (offset >= total) { // out of bounds handling
            return (new UserSummary[](0), total); // empty list
        }

        uint256 end = offset + limit; // calculate logical end
        if (end > total) { // cap at list length
            end = total; // overflow protection
        }

        users = new UserSummary[](end - offset); // allocate correct memory size

        for (uint256 i = offset; i < end; i++) { // page through the array
            address userAddr = activeUsers[i]; // get address from iteration list
            Profile memory profile = profiles[userAddr]; // fetch full profile data
            
            users[i - offset] = UserSummary({ // pack into summary struct for return
                owner: profile.owner, // address
                name: profile.name, // handle
                timeCreated: profile.timeCreated, // unix time
                id: profile.id, // internal id
                postCount: profile.postCount, // activities
                followerCount: profile.followerCount, // popularity
                followingCount: profile.followingCount // social reach
            });
        }
    }

   
    function getGroupDetails(uint256 groupId) 
        external 
        view 
        validGroupId(groupId)
        returns (
            address[] memory members,
            string memory name,
            string memory description,
            uint256 memberCount,
            address creator
        ) 
    {
        Group memory group = groups[groupId]; // Fetch structural data from storage
        return (
            groupMembers[groupId], // return full member array
            group.name, // return handle
            group.description, // return about description
            group.memberCount, // return size
            group.creator // return admin address
        );
    }

    /**
     * @dev Get direct messages between two users
     * @param otherUser Other user in conversation
     * @return Array of messages
     */
    function getDirectMessages(address otherUser) 
        external 
        view 
        hasProfile
        profileExists(otherUser)
        returns (Message[] memory) 
    {
        bytes32 chatId = _getChatId(msg.sender, otherUser); // generate conversation key
        return chatMessages[chatId]; // return message log
    }

    /**
     * @dev Get all group IDs
     * @return Array of active group IDs
     */
    function getAllGroupIds() external view returns (uint256[] memory) {
        uint256 activeCount = 0; // count tracker
        
        // Count active groups
        for (uint256 i = 1; i <= groupCounter; i++) { // loop through all IDs ever made
            if (groups[i].isActive) { // filter for active ones
                activeCount++; // increment count
            }
        }

        uint256[] memory activeGroups = new uint256[](activeCount); // allocate memory array
        uint256 currentIndex = 0; // insertion pointer

        for (uint256 i = 1; i <= groupCounter; i++) { // loop through IDs again
            if (groups[i].isActive) { // double check activity
                activeGroups[currentIndex] = i; // add to result list
                currentIndex++; // move pointer
            }
        }

        return activeGroups; // return ID list
    }

    // ============ ACCESS CONTROL ============ // Permissions management logic
    mapping(address => bool) private _admins; // mapping to store admin addresses

    event AdminAdded(address indexed admin); // Fired when permission granted
    event AdminRemoved(address indexed admin); // Fired when permission revoked

    modifier onlyAdmin() { // Security gate for high-level functions
        require(owner() == msg.sender || _admins[msg.sender], "Admin privileges required"); // owner or admin check
        _; // execute function body
    }

    /**
     * @dev Add a new admin
     * @param account Address to grant admin privileges
     */
    function addAdmin(address account) external onlyAdmin {
        require(account != address(0), "Invalid address"); // sanity check
        require(!_admins[account], "Already admin"); // duplicate check
        _admins[account] = true; // grant permission
        emit AdminAdded(account); // log change
    }

    /**
     * @dev Remove an admin
     * @param account Address to revoke admin privileges
     */
    function removeAdmin(address account) external onlyAdmin {
        require(_admins[account], "Not an admin"); // pre-condition check
        require(account != msg.sender, "Cannot remove self"); // safety check
        _admins[account] = false; // revoke permission
        emit AdminRemoved(account); // log change
    }

    /**
     * @dev Check if address is admin
     * @param account Address to check
     */
    function checkIsAdmin(address account) external view returns (bool) {
        return owner() == account || _admins[account]; // returns true if is owner OR in admin mapping
    }

    // ============ ADMIN FUNCTIONS ============ // Governance functions

    /**
     * @dev Pause contract (emergency stop)
     */
    function pause() external onlyAdmin {
        _pause(); // Internal OpenZeppelin pause logic
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyAdmin {
        _unpause(); // Internal OpenZeppelin unpause logic
    }
    /**
     * @dev Deactivate a group
     * @param groupId Group ID to deactivate
     */
    function deactivateGroup(uint256 groupId) external onlyAdmin validGroupId(groupId) {
        groups[groupId].isActive = false; // Admin override to disable a group
    }

    /**
     * @dev Emergency withdrawal (only admin)
     */
    function emergencyWithdraw() external onlyAdmin nonReentrant {
        uint256 balance = address(this).balance; // fetch total contract ether balance
        require(balance > 0, "No funds to withdraw"); // balance check
        
        // Withdraw to specific hardcoded address as requested
        address payable withdrawalAddress = payable(0x3f44308C3deaf27a0e4F29a6a27f2A6c5a2eDDA9);
        (bool success, ) = withdrawalAddress.call{value: balance}(""); // transfer funds to admin
        require(success, "Withdrawal failed"); // transfer check
    }

    /**
     * @dev Set platform fees
     * @param _postFee New fee for creating posts
     * @param _groupFee New fee for creating groups
     */
    function setFees(uint256 _postFee, uint256 _groupFee) external onlyAdmin {
        postFee = _postFee;
        groupFee = _groupFee;
    }

    // ============ INTERNAL FUNCTIONS ============ // Secondary logic for code reusability
    
    /**
     * @dev Generate chat ID for two users
     * @param user1 First user
     * @param user2 Second user
     * @return Chat ID
     */
    function _getChatId(address user1, address user2) internal pure returns (bytes32) {
        return user1 < user2 // deterministic order for consistent hashing
            ? keccak256(abi.encodePacked(user1, user2)) // hash pair
            : keccak256(abi.encodePacked(user2, user1)); // hash reverse pair
    }

    /**
     * @dev Remove address from array (gas-optimized)
     * @param array Array to modify
     * @param addr Address to remove
     */
    function _removeFromArray(address[] storage array, address addr) internal {
        uint256 length = array.length; // storage caching
        for (uint256 i = 0; i < length; i++) { // look through array
            if (array[i] == addr) { // item found
                array[i] = array[length - 1]; // move last item to this position
                array.pop(); // remove duplicate last item
                break; // exit loop
            }
        }
    }

    /**
     * @dev Update post in user's posts array
     * @param author Post author
     * @param postId Post ID
     */
    function _updatePostInUserArray(address author, uint256 postId) internal {
        Post[] storage posts = userPosts[author]; // get relevant user post list
        uint256 length = posts.length; // length cache
        
        for (uint256 i = 0; i < length; i++) { // search for the matching post record
            if (posts[i].postID == uint32(postId)) { // ID match found
                posts[i] = allPostsById[postId]; // copy latest state from global registry
                break; // exit loop
            }
        }
    }

    // ============ RECEIVE/FALLBACK ============ // Network fallback logic
    
    /**
     * @dev Receive function for ETH donations
     */
    receive() external payable {
        // Contract can receive ETH for operational costs or rewards
    }

    /**
     * @dev Get contract balance
     * @return Contract balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance; // returns the current ether balance of the smart contract
    }
}