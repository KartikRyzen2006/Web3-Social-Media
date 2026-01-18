import { useState, useEffect, useRef } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  FaComments,
  FaArrowLeft,
  FaRocket,
  FaHeart,
  FaGlobe,
  FaUserCircle,
} from "react-icons/fa";
import { contractService } from "../lib/contract";
import { useUserProfile } from "../contexts/UserProfileContext";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import { LIMITS } from "../lib/constants";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";

// New Components
import ConversationSidebar from "../components/Messages/ConversationSidebar";
import ChatArea from "../components/Messages/ChatArea";
import NewConversationModal from "../components/Messages/NewConversationModal";

// Simple time ago function
// Simple time ago function
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";

  // Handle BigInt or string
  const validTimestamp = Number(timestamp);
  if (isNaN(validTimestamp)) return "";

  const now = new Date();
  const time = new Date(validTimestamp * 1000);

  // Check if date is valid
  if (isNaN(time.getTime())) return "";

  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
};

export default function Messages() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { userProfile } = useUserProfile();
  const { theme } = useTheme();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("direct"); // 'direct' or 'groups'
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [senderProfiles, setSenderProfiles] = useState({});

  // Fetch profiles for message senders
  useEffect(() => {
    const fetchSenderProfiles = async () => {
      if (!messages.length || !publicClient) return;

      const uniqueSenders = [...new Set(messages.map(m => m.sender))];
      const newProfiles = {};
      let hasNew = false;

      await Promise.all(uniqueSenders.map(async (senderAddr) => {
        if (!senderProfiles[senderAddr] && senderAddr) {
          try {
            const profile = await contractService.getProfile(publicClient, senderAddr);
            if (profile && profile.exists) {
              newProfiles[senderAddr] = profile;
              hasNew = true;
            }
          } catch (error) {
            console.error("Error fetching profile for:", senderAddr, error);
            // Cache as null to avoid refetching
            newProfiles[senderAddr] = { name: "Unknown" };
            hasNew = true;
          }
        }
      }));

      if (hasNew) {
        setSenderProfiles(prev => ({ ...prev, ...newProfiles }));
      }
    };

    fetchSenderProfiles();
  }, [messages, publicClient]);

  const getSenderName = (addr) => {
    if (!addr) return "Unknown";
    if (addr?.toLowerCase() === address?.toLowerCase()) return "You";
    return senderProfiles[addr]?.name || `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null); // { message, index }
  const messagesEndRef = useRef(null);


  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!publicClient || !isConnected || !userProfile?.exists) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch user's groups
        const groupIds = await contractService.getAllGroupIds(publicClient);
        const userGroups = [];

        for (const groupId of groupIds) {
          try {
            const groupDetails = await contractService.getGroupDetails(
              publicClient,
              groupId
            );
            if (
              groupDetails &&
              groupDetails.members.some(
                (member) => member.toLowerCase() === address.toLowerCase()
              )
            ) {
              userGroups.push({ id: groupId, ...groupDetails });
            }
          } catch (error) {
            console.error(`Error fetching group ${groupId}:`, error);
          }
        }

        setGroups(userGroups);

        // Fetch all users for direct messaging
        const { users: allUsers } = await contractService.getAllUsers(
          publicClient,
          0,
          100
        );
        setUsers(
          allUsers.filter(
            (user) => user.owner.toLowerCase() !== address.toLowerCase()
          )
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicClient, isConnected, address, userProfile]);

  // Handle URL parameter to open specific chat
  useEffect(() => {
    if (router.query.user && users.length > 0) {
      const userAddress = router.query.user;
      const user = users.find((u) => u.owner.toLowerCase() === userAddress.toLowerCase());

      if (user) {
        startDirectMessage(user.owner);
        // Clean up URL after opening chat
        router.replace('/messages', undefined, { shallow: true });
      }
    }
  }, [router.query.user, users]);

  // Fetch messages for selected conversation with polling
  useEffect(() => {
    let intervalId;

    const fetchMessages = async () => {
      if (!selectedConversation || !publicClient || !address) return;

      let fetchedMessages = [];

      try {
        if (selectedConversation.type === "direct") {
          fetchedMessages = await contractService.getDirectMessages(
            publicClient,
            selectedConversation.address,
            address
          );
        } else if (selectedConversation.type === "group") {
          fetchedMessages = await contractService.getGroupMessages(
            publicClient,
            selectedConversation.id,
            address
          );
        }

        setMessages(prev => {
          // Debug log
          console.log("Previous messages:", prev);
          console.log("New messages:", fetchedMessages);

          // Only update if messages have changed to avoid unnecessary re-renders
          if (JSON.stringify(prev) !== JSON.stringify(fetchedMessages)) {
            console.log("Updating messages state");
            return fetchedMessages;
          }
          return prev;
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    // Initial fetch
    fetchMessages();

    // Set up polling interval (every 3 seconds)
    intervalId = setInterval(fetchMessages, 3000);

    // Cleanup interval on unmount or dependency change
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedConversation, publicClient, address]);

  const handleDeleteMessage = async (index) => {
    if (!selectedConversation) return;

    try {
      if (confirm("Are you sure you want to unsend this message?")) {
        let result;

        if (selectedConversation.type === "direct") {
          result = await contractService.deleteDirectMessage(
            walletClient,
            selectedConversation.address,
            index
          );
        } else if (selectedConversation.type === "group") {
          result = await contractService.deleteGroupMessage(
            walletClient,
            selectedConversation.id,
            index
          );
        }

        if (result && result.success) {
          toast.success("Message deleted");
          // Optimistic update
          setMessages(prev => prev.map((m, i) =>
            i === index ? { ...m, isDeleted: true, content: "" } : m
          ));
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!walletClient || !newMessage.trim() || !selectedConversation) {
      console.log("Send aborted:", { walletClient: !!walletClient, message: !!newMessage.trim(), selectedConversation });
      return;
    }

    setSendingMessage(true);
    console.log("Sending message...", {
      recipient: selectedConversation.address,
      content: newMessage.trim(),
      replyTo
    });

    try {
      let result;

      if (selectedConversation.type === "direct") {
        console.log("Calling contractService.sendDirectMessage");
        result = await contractService.sendDirectMessage(
          walletClient,
          selectedConversation.address,
          newMessage.trim(),
          replyTo ? replyTo.index : -1
        );
        console.log("Contract call result:", result);
      } else if (selectedConversation.type === "group") {
        result = await contractService.sendGroupMessage(
          walletClient,
          selectedConversation.id,
          newMessage.trim(),
          replyTo ? replyTo.index : -1
        );
      }

      console.log("Contract call result:", result);

      if (result?.success) {
        // Optimistic update for UI
        const messageData = {
          sender: address,
          content: newMessage.trim(),
          timestamp: Math.floor(Date.now() / 1000),
          isDeleted: false,
          replyToIndex: replyTo ? replyTo.index : -1
        };

        setMessages(prev => [...prev, messageData]);
        scrollToBottom();

        setNewMessage("");
        setReplyTo(null);
        setReplyTo(null);

        // Add message to local state for immediate feedback
        setMessages((prev) => [...prev, messageData]);

        toast.success("Message sent!");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const startDirectMessage = async (userAddress) => {
    setSelectedConversation({
      type: "direct",
      address: userAddress,
      name: users.find((u) => u.owner === userAddress)?.name || "Unknown User",
    });
    setShowNewMessageModal(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter((group) =>
    group.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-3xl p-12 shadow-lg border border-white/20 overflow-hidden text-center">
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FaComments className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Connect to Start Chatting
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              Connect your wallet to access secure, decentralized messaging with
              the community
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <FaGlobe className="h-4 w-4 text-blue-500" />
                <span>Decentralized</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaHeart className="h-4 w-4 text-red-500" />
                <span>Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaRocket className="h-4 w-4 text-purple-500" />
                <span>Instant</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10"></div>
        </div>
      </div>
    );
  }

  if (!userProfile?.exists) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-3xl p-12 shadow-lg border border-white/20 overflow-hidden text-center">
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FaUserCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Profile Required
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
              Create your profile to start messaging other users and join the
              conversation
            </p>
            <Link
              href="/profile/setup"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-semibold rounded-2xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FaRocket className="mr-2 h-5 w-5" />
              Create Profile
            </Link>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Messages - Liberty Social</title>
        <meta
          name="description"
          content="Send and receive messages on Liberty Social"
        />
      </Head>

      <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
        <div className={`glass-panel rounded-[2.5rem] shadow-2xl border h-full flex overflow-hidden ${theme === 'dark' ? 'border-white/10' : 'border-white/20'}`}>
          <ConversationSidebar
            theme={theme}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loading={loading}
            filteredUsers={filteredUsers}
            filteredGroups={filteredGroups}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            onStartDirectMessage={startDirectMessage}
            onShowNewMessageModal={() => setShowNewMessageModal(true)}
          />

          <ChatArea
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
            messages={messages}
            messagesEndRef={messagesEndRef}
            address={address}
            senderProfiles={senderProfiles}
            formatTimeAgo={formatTimeAgo}
            getSenderName={getSenderName}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            handleDeleteMessage={handleDeleteMessage}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            sendingMessage={sendingMessage}
            theme={theme}
          />
        </div>
      </div>

      <NewConversationModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        users={users}
        onStartDirectMessage={startDirectMessage}
        theme={theme}
      />
    </>
  );
}
