import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import Head from "next/head";
import Link from "next/link";
import {
  FaUsers,
  FaPlus,
  FaSearch,
  FaUserPlus,
  FaCrown,
  FaGlobe,
  FaRocket,
  FaStar,
  FaHeart,
  FaCheck,
  FaCompass,
  FaUserCircle,
  FaCalendarAlt,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import { contractService } from "../lib/contract";
import { useUserProfile } from "../contexts/UserProfileContext";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import CreateGroupModal from "../components/Groups/CreateGroupModal";
import toast from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";

export default function Groups() {
  const { theme } = useTheme();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { userProfile } = useUserProfile();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [membershipStates, setMembershipStates] = useState({});
  const [joinLoading, setJoinLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  const [isOwner, setIsOwner] = useState(false);

  // Check if user is contract owner
  useEffect(() => {
    const checkOwnership = async () => {
      if (publicClient && address) {
        try {
          const owner = await contractService.getContractOwner(publicClient);
          setIsOwner(owner && owner.toLowerCase() === address.toLowerCase());
        } catch (error) {
          console.error("Error checking ownership:", error);
          setIsOwner(false);
        }
      }
    };

    checkOwnership();
  }, [publicClient, address, userProfile]);

  // Fetch groups
  const fetchGroups = async () => {
    if (!publicClient) return;

    setLoading(true);
    try {
      const groupIds = await contractService.getAllGroupIds(publicClient);

      const groupsData = await Promise.all(
        groupIds.map(async (groupId) => {
          try {
            const details = await contractService.getGroupDetails(
              publicClient,
              groupId
            );
            return { id: groupId, ...details };
          } catch (error) {
            console.error(`Error fetching group ${groupId}:`, error);
            return null;
          }
        })
      );

      const validGroups = groupsData.filter((group) => group !== null);
      setGroups(validGroups);

      if (address && validGroups.length > 0) {
        const membershipChecks = {};
        for (const group of validGroups) {
          const isMember = group.members.some(
            (member) => member.toLowerCase() === address.toLowerCase()
          );
          membershipChecks[group.id] = isMember;
        }
        setMembershipStates(membershipChecks);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [publicClient, address]);

  const handleJoinGroup = async (groupId) => {
    if (!walletClient || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!userProfile?.exists) {
      toast.error("Please create your profile first");
      return;
    }

    setJoinLoading((prev) => ({ ...prev, [groupId]: true }));

    try {
      const result = await contractService.joinGroup(walletClient, groupId);

      if (result.success) {
        setMembershipStates((prev) => ({
          ...prev,
          [groupId]: true,
        }));

        setGroups((prev) =>
          prev.map((group) => {
            if (group.id === groupId) {
              return {
                ...group,
                memberCount: group.memberCount + 1,
                members: [...group.members, address],
              };
            }
            return group;
          })
        );

        toast.success("Successfully joined the group!");
      }
    } catch (error) {
      console.error("Error joining group:", error);
    } finally {
      setJoinLoading((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  const handleGroupCreated = () => {
    setShowCreateModal(false);
    fetchGroups();
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (!walletClient || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleteLoading((prev) => ({ ...prev, [groupId]: true }));

    try {
      const result = await contractService.deleteGroup(walletClient, groupId);

      if (result.success) {
        setGroups((prev) => prev.filter((group) => group.id !== groupId));
        toast.success("Group deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [groupId]: false }));
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Groups - Liberty Social</title>
        <meta
          name="description"
          content="Join and create groups on Liberty Social"
        />
      </Head>

      <div className="max-w-7xl mx-auto space-y-10 py-6 px-4">
        {/* Enhanced Header with Glassmorphism */}
        <div className="glass-panel relative overflow-hidden group">
          <div className="relative z-10 p-10 md:p-14">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 transform group-hover:rotate-6 ${theme === 'dark' ? 'bg-[#0d0b1c] border border-purple-500/20 cyber-glow' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
                    <FaCompass className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-4xl md:text-6xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Neural Communities
                    </h1>
                    <div className="flex items-center space-x-6 mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">
                      <span className="flex items-center gap-2">
                        <FaUsers className="h-4 w-4" /> {groups.length} ENTITY NODES
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span className="flex items-center gap-2">
                        <FaGlobe className="h-4 w-4" /> DECENTRALIZED MESH
                      </span>
                    </div>
                  </div>
                </div>
                <p className={`text-xl font-medium max-w-2xl leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Access the decentralized hive mind. Join synchronized clusters and collaborate in persistent decentralized environments.
                </p>
              </div>

              {isConnected && userProfile?.exists && (
                <div className="flex flex-col items-center lg:items-end gap-3">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className={`inline-flex items-center px-12 py-5 text-sm font-black uppercase tracking-widest text-white rounded-2xl transition-all duration-500 shadow-2xl transform hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 cyber-glow-sm' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}
                  >
                    <FaPlus className="mr-4 h-5 w-5" />
                    Initialize Protocol
                  </button>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">OPEN PROTOCOL ACCESS</p>
                </div>
              )}
            </div>
          </div>

          {/* Background elements */}
          <div className={`absolute inset-0 opacity-10 transition-opacity duration-500 group-hover:opacity-20 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600 via-transparent to-cyan-500' : 'bg-gradient-to-br from-purple-50 via-transparent to-pink-50'}`}></div>
          {theme === 'dark' && (
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          )}
        </div>

        {/* Search Bar with Neon Effects */}
        <div className="glass-panel p-2">
          <div className="relative group">
            <FaSearch className={`absolute left-8 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-500 ${theme === 'dark' ? 'text-purple-500/50 group-focus-within:text-cyan-400' : 'text-gray-400 group-focus-within:text-purple-600'}`} />
            <input
              type="text"
              placeholder="Search protocol names, description or node IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-20 pr-10 py-6 rounded-[1.5rem] border text-lg font-bold transition-all duration-500 focus:outline-none focus:ring-0 ${theme === 'dark' ? 'bg-[#0d0b1c] border-purple-500/20 text-white placeholder-gray-600 focus:border-cyan-400/50' : 'bg-white border-gray-100 text-gray-900 placeholder-gray-400 focus:border-purple-600 shadow-sm'}`}
            />
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in fade-in duration-1000">
            <div className={`w-36 h-36 rounded-[3rem] flex items-center justify-center shadow-2xl animate-spin-slow ${theme === 'dark' ? 'bg-white/5 cyber-border cyber-glow' : 'bg-white shadow-xl'}`}>
              <FaCompass className={`h-16 w-16 ${theme === 'dark' ? 'text-cyan-400' : 'text-purple-600'}`} />
            </div>
            <div className="text-center space-y-2">
              <h3 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Scanning Neural Nets
              </h3>
              <p className="text-gray-500 font-medium tracking-tight uppercase text-[10px] tracking-[0.2em]">Locating active community clusters...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredGroups.map((group) => {
                  const isMember = membershipStates[group.id];
                  const isJoinLoading = joinLoading[group.id];
                  const isCreator = address && group.creator.toLowerCase() === address.toLowerCase();

                  return (
                    <div
                      key={group.id}
                      className={`group rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.03] transform relative overflow-hidden ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:border-purple-500/40 hover:bg-white/10 cyber-glow-sm' : 'bg-white border-gray-100 hover:shadow-2xl'}`}
                    >
                      {/* Card Header Illustration */}
                      <div className={`h-32 relative overflow-hidden ${theme === 'dark' ? 'bg-[#0d0b1c]' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}>
                        {theme === 'dark' && <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
                          <h3 className="text-lg font-black text-white truncate pr-2 tracking-tight">
                            {group.name}
                          </h3>
                          {isCreator && (
                            <div className={`p-2 rounded-xl transition-all duration-500 shadow-lg ${theme === 'dark' ? 'bg-yellow-400/20 border border-yellow-400/30' : 'bg-yellow-500'}`}>
                              <FaCrown className={`h-3 w-3 ${theme === 'dark' ? 'text-yellow-400 cyber-glow' : 'text-white'}`} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="p-6 space-y-6">
                        <div className="flex items-center space-x-4">
                          <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                            {group.memberCount} UNITS
                          </div>
                          <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-cyan-400/10 text-cyan-400' : 'bg-cyan-50 text-cyan-600'}`}>
                            ID: #{group.id}
                          </div>
                        </div>

                        <p className={`text-xs font-medium leading-relaxed line-clamp-3 min-h-[3.5rem] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {group.description || "No mission summary provided for this node."}
                        </p>

                        {/* Creator Link */}
                        <div className={`flex items-center space-x-3 p-3 rounded-2xl transition-colors duration-500 ${theme === 'dark' ? 'bg-black/20 group-hover:bg-black/40' : 'bg-gray-50'}`}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-white'}`}>
                            <FaUserCircle className={`h-4 w-4 ${theme === 'dark' ? 'text-purple-400' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">ARCHITECT</p>
                            <Link href={`/profile/${group.creator}`} className={`text-[10px] font-black truncate block hover:text-cyan-400 transition-colors ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                              {group.creator.slice(0, 6)}...{group.creator.slice(-4)}
                            </Link>
                          </div>
                        </div>

                        {/* Action Space */}
                        <div className="space-y-3 pt-2">
                          <Link
                            href={`/groups/${group.id}`}
                            className={`w-full inline-flex items-center justify-center px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${theme === 'dark' ? 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-purple-500/30' : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200'}`}
                          >
                            <FaCompass className="mr-3 h-3.5 w-3.5" />
                            Interface with Node
                          </Link>

                          {!isMember && !isCreator && isConnected && userProfile?.exists && (
                            <button
                              onClick={() => handleJoinGroup(group.id)}
                              disabled={isJoinLoading}
                              className={`w-full inline-flex items-center justify-center px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-2xl transition-all duration-500 transform hover:scale-105 disabled:opacity-50 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-cyan-500 cyber-glow-sm' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}
                            >
                              {isJoinLoading ? (
                                <FaSpinner className="animate-spin h-4 w-4 mr-3" />
                              ) : (
                                <FaUserPlus className="mr-3 h-4 w-4" />
                              )}
                              Sync Entity
                            </button>
                          )}

                          {isMember && (
                            <div className={`w-full flex items-center justify-center px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-green-400/10 text-green-400 border border-green-400/20 cyber-glow-sm' : 'bg-green-500 text-white shadow-lg'}`}>
                              <FaCheck className="mr-3 h-4 w-4" />
                              Synced
                            </div>
                          )}

                          {isCreator && (
                            <button
                              onClick={() => handleDeleteGroup(group.id, group.name)}
                              disabled={deleteLoading[group.id]}
                              className={`w-full inline-flex items-center justify-center px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all duration-500 shadow-2xl transform hover:scale-105 disabled:opacity-50 ${theme === 'dark' ? 'bg-gradient-to-r from-red-600 to-pink-600' : 'bg-red-600'}`}
                            >
                              {deleteLoading[group.id] ? (
                                <FaSpinner className="animate-spin h-4 w-4 mr-3" />
                              ) : (
                                <FaTrash className="mr-3 h-4 w-4" />
                              )}
                              Purge Protocol
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-32 text-center space-y-10 animate-in zoom-in-95 duration-700">
                <div className={`w-32 h-32 rounded-[3.5rem] flex items-center justify-center mx-auto shadow-2xl ${theme === 'dark' ? 'bg-white/5 border border-purple-500/20' : 'bg-gray-100'}`}>
                  <FaUsers className={`h-16 w-16 ${theme === 'dark' ? 'text-purple-400/20' : 'text-gray-300'}`} />
                </div>
                <div className="space-y-4">
                  <h3 className={`text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {searchTerm ? "No Clusters Detected" : "Mesh Net Empty"}
                  </h3>
                  <p className={`text-lg font-medium max-w-md mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchTerm
                      ? "The search query yielded no synchronized groups in this sector."
                      : "Be the architect. Initialize the first community node in the mesh."}
                  </p>
                </div>

                {searchTerm ? (
                  <button
                    onClick={() => setSearchTerm("")}
                    className={`inline-flex items-center px-10 py-5 text-sm font-black uppercase tracking-widest text-white rounded-2xl transition-all duration-500 shadow-2xl transform hover:scale-105 ${theme === 'dark' ? 'bg-purple-600' : 'bg-gray-900'}`}
                  >
                    Reset Grid Search
                  </button>
                ) : (
                  isConnected && userProfile?.exists && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className={`inline-flex items-center px-12 py-5 text-sm font-black uppercase tracking-widest text-white rounded-2xl transition-all duration-500 shadow-2xl transform hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 cyber-glow' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}
                    >
                      <FaRocket className="mr-4 h-5 w-5" />
                      Genesis Creation
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* Connectivity Prompts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {!isConnected && (
            <div className={`glass-panel p-10 relative overflow-hidden group`}>
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 transform ${theme === 'dark' ? 'bg-purple-600/30' : 'bg-purple-600'}`}>
                  <FaUsers className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-blue-900'}`}>Connect Neural Link</h3>
                  <p className={`text-sm font-medium leading-relaxed max-w-xs ${theme === 'dark' ? 'text-gray-400' : 'text-blue-700'}`}>Initialize your wallet connection to synchronize with the decentralized mesh network.</p>
                </div>
                <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                  <span className="flex items-center gap-2"><FaGlobe className="h-4 w-4" /> GLOBAL</span>
                  <span className="flex items-center gap-2"><FaShield className="h-4 w-4" /> SECURE</span>
                </div>
              </div>
              <div className={`absolute inset-0 opacity-10 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600 to-cyan-500' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}></div>
            </div>
          )}

          {isConnected && !userProfile?.exists && (
            <div className={`glass-panel p-10 relative overflow-hidden group`}>
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 transform ${theme === 'dark' ? 'bg-yellow-400/20' : 'bg-yellow-500'}`}>
                  <FaUserCircle className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-4">
                  <h3 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-yellow-900'}`}>Initialize Entity Manifest</h3>
                  <p className={`text-sm font-medium leading-relaxed max-w-xs ${theme === 'dark' ? 'text-gray-400' : 'text-yellow-800'}`}>An entity manifest is required to join clusters and participate in decentralized governance.</p>
                  <Link
                    href="/profile/setup"
                    className={`inline-flex items-center px-10 py-4 text-[10px] font-black uppercase tracking-widest text-white rounded-[1.5rem] transition-all duration-500 shadow-2xl transform hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 'bg-yellow-600'}`}
                  >
                    <FaRocket className="mr-3 h-4 w-4" />
                    Setup Entity
                  </Link>
                </div>
              </div>
              <div className={`absolute inset-0 opacity-10 ${theme === 'dark' ? 'bg-gradient-to-br from-yellow-600 to-orange-500' : 'bg-gradient-to-br from-yellow-100 to-orange-100'}`}></div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </>
  );
}
