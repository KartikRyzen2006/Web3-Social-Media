import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  FaChartBar,
  FaUsers,
  FaComments,
  FaPlayCircle,
  FaPauseCircle,
  FaDollarSign,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCrown,
  FaSync,
  FaExternalLinkAlt,
  FaLock,
  FaUnlock,
  FaBolt,
  FaEye,
  FaServer,
  FaChartLine,
  FaGlobe,
  FaStar,
  FaUserPlus
} from "react-icons/fa";
import { contractService } from "../lib/contract";
import { useUserProfile } from "../contexts/UserProfileContext";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import toast from "react-hot-toast";

export default function AdminPanel() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { userProfile } = useUserProfile();

  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contractStats, setContractStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalGroups: 0,
    contractBalance: "0",
    isPaused: false,
  });
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [actionLoading, setActionLoading] = useState({
    pause: false,
    unpause: false,
    withdraw: false,
    refresh: false,
    addAdmin: false,
    removeAdmin: false,
  });

  // Check if user is contract admin
  useEffect(() => {
    const checkOwnership = async () => {
      if (!isConnected || !address || !publicClient) {
        router.push("/");
        return;
      }

      try {
        const isAdmin = await contractService.checkIsAdmin(publicClient, address);

        if (!isAdmin) {
          toast.error("Access denied: Admin privileges required");
          router.push("/");
          return;
        }

        setIsOwner(true);
        await fetchContractStats();
      } catch (error) {
        console.error("Error checking permissions:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkOwnership();
  }, [isConnected, address, publicClient, router]);

  const fetchContractStats = async () => {
    if (!publicClient) return;

    setActionLoading((prev) => ({ ...prev, refresh: true }));

    try {
      const [balance, isPaused, userResult, postResult, groupIds] =
        await Promise.all([
          contractService.getContractBalance(publicClient),
          contractService.isContractPaused(publicClient),
          contractService.getAllUsers(publicClient, 0, 1),
          contractService.getAllPosts(publicClient, 0, 1),
          contractService.getAllGroupIds(publicClient),
        ]);

      setContractStats({
        totalUsers: userResult.total,
        totalPosts: postResult.total,
        totalGroups: groupIds.length,
        contractBalance: balance,
        isPaused: isPaused,
      });
    } catch (error) {
      console.error("Error fetching contract stats:", error);
      toast.error("Failed to load contract statistics");
    } finally {
      setActionLoading((prev) => ({ ...prev, refresh: false }));
    }
  };

  const handlePauseContract = async () => {
    if (!walletClient) return;

    setActionLoading((prev) => ({ ...prev, pause: true }));

    try {
      const result = await contractService.pauseContract(walletClient);
      if (result.success) {
        setContractStats((prev) => ({ ...prev, isPaused: true }));
        toast.success("Contract paused successfully");
      }
    } catch (error) {
      console.error("Error pausing contract:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, pause: false }));
    }
  };

  const handleUnpauseContract = async () => {
    if (!walletClient) return;

    setActionLoading((prev) => ({ ...prev, unpause: true }));

    try {
      const result = await contractService.unpauseContract(walletClient);
      if (result.success) {
        setContractStats((prev) => ({ ...prev, isPaused: false }));
        toast.success("Contract unpaused successfully");
      }
    } catch (error) {
      console.error("Error unpausing contract:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, unpause: false }));
    }
  };

  const handleEmergencyWithdraw = async () => {
    if (!walletClient) return;

    const confirmMessage = `Are you sure you want to withdraw all funds (${contractStats.contractBalance} ETH) from the contract?`;
    if (!confirm(confirmMessage)) return;

    setActionLoading((prev) => ({ ...prev, withdraw: true }));

    try {
      const result = await contractService.emergencyWithdraw(walletClient);
      if (result.success) {
        await fetchContractStats(); // Refresh stats
        toast.success("Emergency withdrawal completed successfully");
      }
    } catch (error) {
      console.error("Error during emergency withdrawal:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, withdraw: false }));
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!walletClient || !newAdminAddress) return;

    setActionLoading((prev) => ({ ...prev, addAdmin: true }));

    try {
      const result = await contractService.addAdmin(walletClient, newAdminAddress);
      if (result.success) {
        toast.success("Admin added successfully");
        setNewAdminAddress("");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
    } finally {
      setActionLoading((prev) => ({ ...prev, addAdmin: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
          <LoadingSpinner size="xl" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Loading Admin Panel
        </h3>
        <p className="text-gray-600">Verifying administrator privileges...</p>
      </div>
    );
  }

  if (!isOwner) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>Admin Panel - Liberty Social</title>
        <meta
          name="description"
          content="Admin panel for Liberty Social smart contract management"
        />
        <link rel="icon" href="/logo.png" />
      </Head>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-3xl p-8 shadow-lg border border-white/20 overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-600 rounded-3xl flex items-center justify-center shadow-lg">
                    <FaShieldAlt className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Admin Control Center
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">
                      Manage and monitor the Liberty Social smart contract
                    </p>
                  </div>
                </div>

                {/* Admin Badge */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-red-500/20 backdrop-blur-sm px-4 py-2 rounded-2xl border border-red-300/30">
                    <FaCrown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-700">
                      Administrator
                    </span>
                  </div>
                  <div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border ${contractStats.isPaused
                      ? "bg-red-500/20 border-red-300/30 text-red-700"
                      : "bg-green-500/20 border-green-300/30 text-green-700"
                      }`}
                  >
                    {contractStats.isPaused ? (
                      <FaLock className="h-4 w-4" />
                    ) : (
                      <FaUnlock className="h-4 w-4" />
                    )}
                    <span className="text-sm font-semibold">
                      {contractStats.isPaused
                        ? "Contract Paused"
                        : "Contract Active"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[100px] text-center p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
                  <div className="text-2xl font-bold text-blue-600">
                    {contractStats.totalUsers}
                  </div>
                  <div className="text-xs font-medium text-blue-700">Users</div>
                </div>
                <div className="flex-1 min-w-[100px] text-center p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
                  <div className="text-2xl font-bold text-green-600">
                    {contractStats.totalPosts}
                  </div>
                  <div className="text-xs font-medium text-green-700">
                    Posts
                  </div>
                </div>
                <div className="flex-1 min-w-[100px] text-center p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
                  <div className="text-2xl font-bold text-purple-600">
                    {contractStats.totalGroups}
                  </div>
                  <div className="text-xs font-medium text-purple-700">
                    Groups
                  </div>
                </div>
                <div className="flex-[1.5] min-w-[140px] text-center p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
                  <div className="text-2xl font-bold text-yellow-600">
                    {contractStats.contractBalance}
                  </div>
                  <div className="text-xs font-medium text-yellow-700">ETH</div>
                </div>
              </div>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 via-orange-400/10 to-yellow-400/10"></div>
        </div>

        {/* Contract Paused Warning */}
        {contractStats.isPaused && (
          <div className="relative bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/50 rounded-3xl p-6 shadow-lg overflow-hidden">
            <div className="relative z-10 flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900 mb-2">
                  ⚠️ Contract Emergency Pause Active
                </h3>
                <p className="text-red-800 leading-relaxed">
                  All user interactions with the smart contract are temporarily
                  disabled. Users cannot create posts, join groups, or perform
                  any blockchain transactions until the contract is resumed.
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-orange-400/10"></div>
          </div>
        )}

        {/* Enhanced Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 p-6 transition-all duration-300 hover:shadow-xl hover:bg-white/90">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <FaUsers className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {contractStats.totalUsers}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  +{Math.floor(contractStats.totalUsers * 0.1)} this week
                </p>
              </div>
            </div>
          </div>

          {/* Total Posts */}
          <div className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 p-6 transition-all duration-300 hover:shadow-xl hover:bg-white/90">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <FaComments className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">
                  Total Posts
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {contractStats.totalPosts}
                </p>
                <p className="text-xs text-green-600 font-medium">
                  Active community
                </p>
              </div>
            </div>
          </div>

          {/* Total Groups */}
          <div className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 p-6 transition-all duration-300 hover:shadow-xl hover:bg-white/90">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <FaUsers className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">
                  Total Groups
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {contractStats.totalGroups}
                </p>
                <p className="text-xs text-purple-600 font-medium">
                  Communities
                </p>
              </div>
            </div>
          </div>

          {/* Contract Balance */}
          <div className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 p-6 transition-all duration-300 hover:shadow-xl hover:bg-white/90">
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <FaDollarSign className="h-7 w-7 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600">
                  Contract Balance
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {contractStats.contractBalance}
                </p>
                <p className="text-xs text-yellow-600 font-medium">
                  ETH Available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Contract Controls */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <FaServer className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Contract Controls
              </h3>
            </div>

            <div className="space-y-6">
              {/* Pause/Unpause Control */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 group hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {contractStats.isPaused ? (
                        <FaLock className="h-5 w-5 text-red-500" />
                      ) : (
                        <FaUnlock className="h-5 w-5 text-green-500" />
                      )}
                      <h4 className="text-lg font-bold text-gray-900">
                        {contractStats.isPaused
                          ? "Resume Operations"
                          : "Emergency Pause"}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {contractStats.isPaused
                        ? "Restore all contract functionality and allow user interactions"
                        : "Immediately halt all contract operations for maintenance or security"}
                    </p>
                  </div>
                  <button
                    onClick={
                      contractStats.isPaused
                        ? handleUnpauseContract
                        : handlePauseContract
                    }
                    disabled={actionLoading.pause || actionLoading.unpause}
                    className={`ml-6 inline-flex items-center px-6 py-3 font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100 ${contractStats.isPaused
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                      : "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700"
                      } disabled:opacity-50`}
                  >
                    {actionLoading.pause || actionLoading.unpause ? (
                      <LoadingSpinner
                        size="sm"
                        color="white"
                        className="mr-2"
                      />
                    ) : contractStats.isPaused ? (
                      <FaPlayCircle className="mr-2 h-5 w-5" />
                    ) : (
                      <FaPauseCircle className="mr-2 h-5 w-5" />
                    )}
                    {contractStats.isPaused ? "Resume" : "Pause"}
                  </button>
                </div>
              </div>

              {/* Emergency Withdrawal */}
              <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-200 group hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaBolt className="h-5 w-5 text-red-600" />
                      <h4 className="text-lg font-bold text-red-900">
                        Emergency Withdrawal
                      </h4>
                    </div>
                    <p className="text-sm text-red-800 leading-relaxed">
                      Withdraw all contract funds (
                      {contractStats.contractBalance} ETH) to admin wallet. Use
                      only in critical situations.
                    </p>
                  </div>
                  <button
                    onClick={handleEmergencyWithdraw}
                    disabled={
                      actionLoading.withdraw ||
                      parseFloat(contractStats.contractBalance) === 0
                    }
                    className="ml-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-2xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
                  >
                    {actionLoading.withdraw ? (
                      <LoadingSpinner
                        size="sm"
                        color="white"
                        className="mr-2"
                      />
                    ) : (
                      <FaDollarSign className="mr-2 h-5 w-5" />
                    )}
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Platform Analytics */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <FaChartLine className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Platform Analytics
              </h3>
            </div>

            <div className="space-y-6">
              {/* Engagement Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FaChartBar className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-blue-600 mb-1">
                    Avg Posts/User
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {contractStats.totalUsers > 0
                      ? (
                        contractStats.totalPosts / contractStats.totalUsers
                      ).toFixed(1)
                      : "0"}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                  <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <FaUsers className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-green-600 mb-1">
                    Groups/User
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {contractStats.totalUsers > 0
                      ? (
                        contractStats.totalGroups / contractStats.totalUsers
                      ).toFixed(2)
                      : "0"}
                  </p>
                </div>
              </div>

              {/* Enhanced Quick Actions */}
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                  <FaBolt className="h-4 w-4 text-yellow-500 mr-2" />
                  Quick Actions
                </h4>

                <button
                  onClick={fetchContractStats}
                  disabled={actionLoading.refresh}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      {actionLoading.refresh ? (
                        <LoadingSpinner size="sm" color="white" />
                      ) : (
                        <FaSync className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-800 group-hover:text-blue-600">
                      Refresh Statistics
                    </span>
                  </div>
                  <FaChartLine className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                </button>

                <button
                  onClick={() =>
                    window.open(
                      `${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`,
                      "_blank"
                    )
                  }
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 hover:from-green-50 hover:to-emerald-50 hover:border-green-200 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <FaGlobe className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-800 group-hover:text-green-600">
                      View on Block Explorer
                    </span>
                  </div>
                  <FaExternalLinkAlt className="h-4 w-4 text-gray-400 group-hover:text-green-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Manage Administrators Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                <FaUserPlus className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Manage Administrators
              </h3>
            </div>

            <div className="space-y-6">
              {/* Grant Admin Access */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
                <div className="flex items-center space-x-3 mb-4">
                  <FaUserPlus className="h-5 w-5 text-purple-600" />
                  <h4 className="text-lg font-bold text-gray-900">
                    Grant Admin Access
                  </h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Add a new administrator by entering their wallet address below
                </p>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newAdminAddress}
                    onChange={(e) => setNewAdminAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 px-4 py-3 bg-white border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-400"
                  />
                  <button
                    onClick={handleAddAdmin}
                    disabled={!newAdminAddress || actionLoading.addAdmin}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {actionLoading.addAdmin ? (
                      <FaSync className="h-4 w-4 animate-spin" />
                    ) : (
                      <FaUserPlus className="h-4 w-4" />
                    )}
                    <span>Grant</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Warning Footer */}
        <div className="relative bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border border-yellow-200/50 rounded-3xl p-8 shadow-lg overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FaExclamationTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-900 mb-3">
                  ⚡ Administrator Responsibilities & Guidelines
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-yellow-800">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FaStar className="h-3 w-3 text-yellow-600" />
                      <span>
                        Use pause functionality only during emergencies or
                        critical maintenance
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaStar className="h-3 w-3 text-yellow-600" />
                      <span>
                        Emergency withdrawal should only be used in critical
                        security situations
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <FaStar className="h-3 w-3 text-yellow-600" />
                      <span>
                        Monitor platform activity and ensure community
                        guidelines compliance
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaStar className="h-3 w-3 text-yellow-600" />
                      <span>
                        All admin actions are permanently recorded on the
                        blockchain
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-red-400/10"></div>
        </div>
      </div>
    </>
  );
}
