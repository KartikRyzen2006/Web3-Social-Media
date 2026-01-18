import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import Head from "next/head";
import Link from "next/link";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { useTheme } from "../../contexts/ThemeContext";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import { contractService } from "../../lib/contract";
import { LIMITS } from "../../lib/constants";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import {
  FaArrowLeft,
  FaCheck,
  FaComments,
  FaCrown,
  FaEye,
  FaInfo,
  FaPaperPlane,
  FaSpinner,
  FaUserPlus,
  FaUsers
} from "react-icons/fa";

export default function GroupDetails() {
  const { theme } = useTheme();
  const router = useRouter();
  const { groupId } = router.query;
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { userProfile } = useUserProfile();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  const isMember = members.some(
    (member) =>
      address &&
      member.address &&
      member.address.toLowerCase() === address.toLowerCase()
  );

  const isCreator =
    group && address && group.creator.toLowerCase() === address.toLowerCase();

  // Fetch group details and messages
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!publicClient || !groupId) return;

      setLoading(true);
      try {
        const groupDetails = await contractService.getGroupDetails(
          publicClient,
          parseInt(groupId)
        );

        if (!groupDetails) {
          setGroup(null);
          setLoading(false);
          return;
        }

        setGroup(groupDetails);

        const memberAddresses = Array.isArray(groupDetails.members)
          ? groupDetails.members
          : [];

        setMembers(
          memberAddresses.map((address) => ({ address, profile: null }))
        );

        const memberProfiles = await Promise.all(
          memberAddresses.map(async (memberAddress) => {
            try {
              if (!memberAddress || typeof memberAddress !== "string") {
                return null;
              }

              const profile = await contractService.getProfile(
                publicClient,
                memberAddress
              );
              return { address: memberAddress, profile };
            } catch (error) {
              console.error("Error fetching member profile:", error);
              return { address: memberAddress, profile: null };
            }
          })
        );

        const validMemberProfiles = memberProfiles.filter(
          (member) => member !== null
        );
        setMembers(validMemberProfiles);

        const groupMessages = await contractService.getGroupMessages(
          publicClient,
          parseInt(groupId),
          address
        );
        setMessages(groupMessages);
      } catch (error) {
        console.error("Error fetching group details:", error);
        toast.error("Failed to load group details");
        setGroup(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [publicClient, groupId]);

  const handleJoinGroup = async () => {
    if (!walletClient || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!userProfile?.exists) {
      toast.error("Please create your profile first");
      return;
    }

    setJoinLoading(true);

    try {
      const result = await contractService.joinGroup(
        walletClient,
        parseInt(groupId)
      );

      if (result.success) {
        const userProfile = await contractService.getProfile(
          publicClient,
          address
        );
        setMembers((prev) => [...prev, { address, profile: userProfile }]);

        setGroup((prev) => ({
          ...prev,
          memberCount: prev.memberCount + 1,
        }));

        toast.success("Successfully joined the group!");
      }
    } catch (error) {
      console.error("Error joining group:", error);
    } finally {
      setJoinLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "messages" && isMember && publicClient) {
      const interval = setInterval(async () => {
        try {
          const groupMessages = await contractService.getGroupMessages(
            publicClient,
            parseInt(groupId),
            address
          );
          setMessages(groupMessages);
        } catch (error) {
          console.error("Error refreshing messages:", error);
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [activeTab, isMember, publicClient, groupId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!walletClient || !newMessage.trim()) return;

    if (!isMember) {
      toast.error("You must be a member to send messages");
      return;
    }

    setSendingMessage(true);

    try {
      const result = await contractService.sendGroupMessage(
        walletClient,
        parseInt(groupId),
        newMessage.trim()
      );

      if (result.success) {
        const messageData = {
          sender: address,
          content: newMessage.trim(),
          timestamp: Math.floor(Date.now() / 1000),
        };

        await contractService.storeGroupMessage(parseInt(groupId), messageData);
        setMessages((prev) => [...prev, messageData]);
        setNewMessage("");
        toast.success("Message sent!");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center shadow-2xl animate-pulse ${theme === 'dark' ? 'bg-white/5 cyber-border cyber-glow' : 'bg-white shadow-xl'}`}>
          <LoadingSpinner size="xl" />
        </div>
        <div className="text-center space-y-2">
          <h3 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Syncing Neural Group
          </h3>
          <p className="text-gray-500 font-medium tracking-tight uppercase text-[10px] tracking-[0.2em]">Accessing the decentralized hive mind...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto text-center py-24 space-y-8">
        <div className={`w-32 h-32 rounded-[3rem] flex items-center justify-center mx-auto shadow-2xl ${theme === 'dark' ? 'bg-white/5 border border-purple-500/20' : 'bg-gray-100'}`}>
          <FaUsers className={`h-16 w-16 ${theme === 'dark' ? 'text-purple-400/40' : 'text-gray-300'}`} />
        </div>
        <div className="space-y-4">
          <h1 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Node Coordinates Not Found
          </h1>
          <p className={`text-lg font-medium max-w-md mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            This group protocol has been decommissioned or the coordinates are invalid.
          </p>
        </div>
        <Link
          href="/groups"
          className={`inline-flex items-center px-10 py-5 text-sm font-black uppercase tracking-widest text-white rounded-2xl transition-all duration-500 shadow-2xl transform hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}
        >
          <FaArrowLeft className="mr-4 h-4 w-4" />
          Back to Hub
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{group.name} - Liberty Social</title>
        <meta name="description" content={group.description} />
      </Head>

      <div className="max-w-6xl mx-auto space-y-10 py-6 px-4">
        {/* Back Button */}
        <div className="flex items-center">
          <Link
            href="/groups"
            className={`group inline-flex items-center text-xs font-black uppercase tracking-[0.2em] transition-colors py-3 px-6 rounded-2xl border ${theme === 'dark' ? 'text-gray-400 hover:text-white border-purple-500/20 bg-white/5 hover:bg-white/10' : 'text-gray-500 hover:text-purple-600 border-gray-100 bg-white hover:bg-gray-50'}`}
          >
            <FaArrowLeft className="mr-3 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Return to Nexus
          </Link>
        </div>

        {/* Enhanced Group Header */}
        <div className="glass-panel overflow-hidden relative group">
          {/* Cyber Cover */}
          <div className={`h-48 md:h-64 relative overflow-hidden ${theme === 'dark' ? 'bg-[#0d0b1c]' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}>
            {theme === 'dark' && (
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
            )}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent`}></div>

            <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl ${theme === 'dark' ? 'bg-purple-600/30 cyber-border cyber-glow' : 'bg-white/20 backdrop-blur-md'}`}>
                    <FaUsers className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">{group.name}</h1>
                    <div className="flex items-center space-x-6 mt-1 text-[10px] font-black uppercase tracking-widest text-purple-200/80">
                      <span className="flex items-center gap-2">
                        {group.memberCount} ENTITIES
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span className="flex items-center gap-2">
                        PROTOCOL #{groupId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Suite */}
              <div className="flex items-center space-x-4">
                {!isMember && !isCreator && isConnected && userProfile?.exists && (
                  <button
                    onClick={handleJoinGroup}
                    disabled={joinLoading}
                    className={`inline-flex items-center px-10 py-5 text-xs font-black uppercase tracking-[0.2em] text-white rounded-2xl transition-all duration-500 shadow-2xl transform hover:scale-105 disabled:opacity-50 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500' : 'bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30'}`}
                  >
                    {joinLoading ? (
                      <FaSpinner className="animate-spin h-4 w-4 mr-3" />
                    ) : (
                      <FaUserPlus className="mr-3 h-4 w-4" />
                    )}
                    Synchronize with Core
                  </button>
                )}

                {isMember && (
                  <div className={`inline-flex items-center px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl ${theme === 'dark' ? 'bg-green-400/10 border border-green-400/30 text-green-400 cyber-glow-sm' : 'bg-green-500 text-white'}`}>
                    <FaCheck className="mr-3 h-4 w-4" />
                    Interface Linked
                  </div>
                )}
              </div>
            </div>

            {/* Creator Badge */}
            <div className={`absolute top-8 right-8 px-6 py-3 rounded-xl border backdrop-blur-md z-20 transition-all duration-500 hover:scale-105 ${theme === 'dark' ? 'bg-black/40 border-purple-500/30' : 'bg-white/20 border-white/30'}`}>
              <div className="flex items-center space-x-3">
                <FaCrown className={`h-4 w-4 ${theme === 'dark' ? 'text-yellow-400 cyber-glow' : 'text-white'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white opacity-80 mr-2">Architect:</span>
                <Link href={`/profile/${group.creator}`} className="text-sm font-black text-white hover:text-cyan-400 transition-colors">
                  {group.creator.slice(0, 6)}...{group.creator.slice(-4)}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Connectivity System */}
        <div className="glass-panel overflow-hidden border-0 bg-transparent shadow-none">
          <div className="flex items-center space-x-2 p-1 bg-white/5 rounded-[2rem] border border-white/10 w-fit mx-auto md:mx-0">
            {[
              { id: "info", label: "Protocol Info", icon: FaInfo },
              { id: "members", label: "Entity Manifest", icon: FaUsers, count: group.memberCount },
              { id: "messages", label: "Neural Comm-Link", icon: FaComments },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isActive
                    ? theme === 'dark' ? 'bg-purple-600/20 text-purple-400 cyber-border' : 'bg-purple-600 text-white shadow-xl'
                    : theme === 'dark' ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5' : 'text-gray-500 hover:text-purple-600 hover:bg-white'
                    }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />
                  <span>{tab.label}</span>
                  {tab.count && (
                    <span className={`ml-2 px-2.5 py-1 rounded-lg text-[9px] ${isActive ? 'bg-white/10' : 'bg-black/5'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Enhanced Tab Content */}
          <div className="py-10">
            {activeTab === "info" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className={`md:col-span-2 glass-panel p-10 space-y-8 ${theme === 'dark' ? 'bg-white/5' : 'bg-white'}`}>
                  <div className="space-y-4">
                    <h3 className={`text-2xl font-black tracking-tight flex items-center gap-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-100'}`}>
                        <FaInfo className={`h-5 w-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                      </div>
                      Mission Parameters
                    </h3>
                    <p className={`text-lg font-medium leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {group.description || "No specific mission parameters defined for this terminal node."}
                    </p>
                  </div>

                  <div className={`pt-8 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                    <div className="flex flex-wrap gap-4">
                      <div className={`px-6 py-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">TOTAL DATA VOL</p>
                        <p className={`text-xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-purple-600'}`}>{messages.length} pkts</p>
                      </div>
                      <div className={`px-6 py-4 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'}`}>
                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">NETWORK STRENGTH</p>
                        <p className={`text-xl font-black ${theme === 'dark' ? 'text-pink-400' : 'text-purple-600'}`}>{(group.memberCount * 12.5).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className={`glass-panel p-8 ${theme === 'dark' ? 'bg-white/5' : 'bg-white'}`}>
                    <h4 className={`text-sm font-black tracking-[0.2em] uppercase mb-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>Terminal Status</h4>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Node Access:</span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isMember ? 'text-green-400 bg-green-400/10' : 'text-gray-400 bg-white/5'}`}>
                          {isMember ? 'AUTHENTICATED' : 'GUEST'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Security Clearance:</span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isCreator ? 'text-yellow-400 bg-yellow-400/10' : theme === 'dark' ? 'text-cyan-400 bg-cyan-400/10' : 'text-purple-600 bg-purple-50'}`}>
                          {isCreator ? 'ARCHITECT' : isMember ? 'OPERATOR' : 'READ-ONLY'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Entity Manifest Tab */}
            {activeTab === "members" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between">
                  <h3 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Synchronized Entities <span className={`ml-4 text-xs font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl ${theme === 'dark' ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>{group.memberCount} Units Active</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.length > 0 ? (
                    members.filter((member) => member && member.address).map((member) => (
                      <div key={member.address} className={`group p-6 rounded-[2rem] border transition-all duration-500 hover:scale-[1.02] transform relative overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-purple-500/40 hover:bg-white/10' : 'bg-white border-gray-100 hover:shadow-xl'}`}>
                        <div className="flex items-center space-x-5 relative z-10">
                          <div className={`h-16 w-16 rounded-[1.2rem] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:rotate-6 transform ${theme === 'dark' ? 'bg-[#0d0b1c] border border-purple-500/20' : 'bg-gradient-to-br from-purple-500 to-indigo-500'}`}>
                            <span className={`text-xl font-black ${theme === 'dark' ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' : 'text-white'}`}>
                              {member.profile?.name ? member.profile.name.charAt(0).toUpperCase() : member.address?.charAt(2)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <Link href={`/profile/${member.address}`}>
                                <p className={`font-black tracking-tight truncate transition-colors ${theme === 'dark' ? 'text-white group-hover:text-cyan-400' : 'text-gray-900 group-hover:text-purple-600'}`}>
                                  {member.profile?.name || "Anonymous Entity"}
                                </p>
                              </Link>
                              {member.address.toLowerCase() === group.creator.toLowerCase() && (
                                <FaCrown className={`h-3 w-3 ${theme === 'dark' ? 'text-yellow-400 cyber-glow' : 'text-yellow-500'}`} />
                              )}
                            </div>
                            <p className="text-[10px] font-black tracking-widest uppercase text-gray-500 mt-1 font-mono">
                              {member.address.slice(0, 6)}...{member.address.slice(-4)}
                            </p>
                          </div>
                          <Link href={`/profile/${member.address}`} className={`p-3 rounded-xl transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 text-purple-400 hover:bg-white/10' : 'bg-gray-50 text-gray-400 hover:text-purple-600'}`}>
                            <FaEye className="h-4 w-4" />
                          </Link>
                        </div>
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600/50 to-transparent' : 'bg-gradient-to-br from-purple-50 to-transparent'}`}></div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-24 text-center space-y-6 glass-panel border-dashed">
                      <FaUsers className={`h-16 w-16 mx-auto ${theme === 'dark' ? 'text-purple-400/20' : 'text-gray-200'}`} />
                      <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No active entities detected in manifest</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Neural Comm-Link Tab */}
            {activeTab === "messages" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {isMember ? (
                  <div className={`glass-panel p-0 overflow-hidden flex flex-col h-[70vh] ${theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-2xl'}`}>
                    {/* Comm Header */}
                    <div className={`p-6 border-b flex items-center justify-between ${theme === 'dark' ? 'border-white/10' : 'border-gray-100 bg-gray-50/50'}`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full bg-green-400 animate-pulse cyber-glow`}></div>
                        <h3 className={`text-sm font-black tracking-[0.2em] uppercase ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Channel Active: Secure P2A-Comm</h3>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const groupMessages = await contractService.getGroupMessages(publicClient, parseInt(groupId), address);
                            setMessages(groupMessages);
                            toast.success("Manifest Refreshed");
                          } catch (error) {
                            toast.error("Packet Loss Detected");
                          }
                        }}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all duration-300 py-2 px-6 rounded-xl border ${theme === 'dark' ? 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5 hover:bg-cyan-400/10' : 'text-purple-600 border-purple-200 bg-purple-50 hover:bg-purple-100'}`}
                      >
                        Reset Packets
                      </button>
                    </div>

                    {/* Messages Stack */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                      {messages.length > 0 ? (
                        messages.map((message, index) => {
                          const memberProfile = members.find((m) => m.address?.toLowerCase() === message.sender?.toLowerCase());
                          const isOwnMessage = address && message.sender?.toLowerCase() === address.toLowerCase();

                          return (
                            <div key={index} className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} animate-in fade-in zoom-in-95 duration-500`}>
                              <div className="flex items-center space-x-3 mb-2 px-1">
                                {!isOwnMessage && (
                                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black ${theme === 'dark' ? 'bg-purple-600/30 text-purple-400 border border-purple-500/30' : 'bg-purple-600 text-white'}`}>
                                    {memberProfile?.profile?.name?.charAt(0) || message.sender?.charAt(2) || "?"}
                                  </div>
                                )}
                                <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {isOwnMessage ? "YOU" : memberProfile?.profile?.name || `${message.sender?.slice(0, 6)}...`}
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 opacity-50">• {formatDistanceToNow(new Date(message.timestamp * 1000), { addSuffix: true })}</span>
                              </div>
                              <div className={`max-w-[80%] p-5 rounded-[1.5rem] text-sm font-medium leading-relaxed shadow-xl ${isOwnMessage
                                ? theme === 'dark' ? 'bg-gradient-to-br from-purple-600/80 to-indigo-600/80 text-white rounded-tr-none cyber-glow-sm' : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-none'
                                : theme === 'dark' ? 'bg-white/5 border border-purple-500/20 text-gray-300 rounded-tl-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'}`}
                              >
                                {message.content}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-40">
                          <FaComments className={`h-16 w-16 ${theme === 'dark' ? 'text-purple-400' : 'text-gray-300'}`} />
                          <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Silence in the grid...</p>
                        </div>
                      )}
                    </div>

                    {/* Input Hub */}
                    <div className={`p-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-100 bg-gray-50/50'}`}>
                      <form onSubmit={handleSendMessage} className="relative group">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Transmit neural pkt..."
                          maxLength={LIMITS.maxMessageLength}
                          className={`w-full pl-8 pr-24 py-5 rounded-2xl border text-sm font-bold transition-all duration-500 focus:outline-none focus:ring-0 ${theme === 'dark' ? 'bg-[#0d0b1c] border-purple-500/20 text-white placeholder-gray-600 focus:border-cyan-400/50' : 'bg-white border-gray-200 text-gray-900 focus:border-purple-600 shadow-sm'}`}
                          disabled={sendingMessage}
                        />
                        <button
                          type="submit"
                          disabled={sendingMessage || !newMessage.trim()}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 disabled:opacity-50 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white cyber-glow-sm' : 'bg-purple-600 text-white'}`}
                        >
                          {sendingMessage ? (
                            <FaSpinner className="animate-spin h-3 w-3" />
                          ) : (
                            <>
                              <span>BROADCAST</span>
                              <FaPaperPlane className="h-3 w-3 animate-pulse" />
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="py-24 text-center space-y-10 glass-panel">
                    <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl ${theme === 'dark' ? 'bg-white/5 border border-purple-500/20' : 'bg-gray-100'}`}>
                      <FaUsers className={`h-12 w-12 ${theme === 'dark' ? 'text-purple-400/40' : 'text-gray-300'}`} />
                    </div>
                    <div className="space-y-4">
                      <h3 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Clearance Required</h3>
                      <p className={`text-lg font-medium max-w-md mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        You must synchronize your neural net with this group to access the encrypted communication stream.
                      </p>
                    </div>
                    {isConnected && userProfile?.exists && (
                      <button
                        onClick={handleJoinGroup}
                        disabled={joinLoading}
                        className={`inline-flex items-center px-12 py-5 text-sm font-black uppercase tracking-widest text-white rounded-2xl transition-all duration-500 shadow-2xl transform hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500' : 'bg-purple-600'}`}
                      >
                        {joinLoading ? <FaSpinner className="animate-spin h-4 w-4 mr-4" /> : <FaUserPlus className="mr-4 h-4 w-4" />}
                        Apply for Access
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
