import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAccount, useWalletClient } from "wagmi";
import Head from "next/head";
import {
  FaUser,
  FaSpinner,
  FaRocket,
  FaCheck,
  FaTimes,
  FaStar,
  FaGlobe,
  FaHeart,
  FaUsers,
  FaLightbulb,
} from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import { contractService } from "../../lib/contract";
import { useUserProfile } from "../../contexts/UserProfileContext";
import { LIMITS } from "../../lib/constants";
import toast from "react-hot-toast";

export default function ProfileSetup() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { userProfile, refreshProfile } = useUserProfile();

  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const validateUsername = (name) => {
    if (!name.trim()) {
      return "Username is required";
    }

    if (name.length < 3) {
      return "Username must be at least 3 characters long";
    }

    if (name.length > LIMITS.maxUsernameLength) {
      return `Username must be less than ${LIMITS.maxUsernameLength} characters`;
    }

    // Check for valid characters (letters, numbers, underscores, hyphens)
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(name)) {
      return "Username can only contain letters, numbers, underscores, and hyphens";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const validationError = validateUsername(trimmedUsername);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsCreating(true);

    try {
      const result = await contractService.createProfile(
        walletClient,
        trimmedUsername
      );

      if (result.success) {
        toast.success("Profile created successfully!");
        await refreshProfile();
        router.push("/");
      } else {
        toast.error(result.error || "Failed to create profile. Please try again.");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    // Remove spaces and convert to lowercase for consistency
    const cleanedValue = value.replace(/\s+/g, "").toLowerCase();
    setUsername(cleanedValue);
  };

  if (!isConnected) {
    return null; // Will redirect
  }

  const validationError = validateUsername(username);
  const isUsernameValid = username.length >= 3 && !validationError;

  return (
    <>
      <Head>
        <title>Setup Profile - Liberty Social</title>
        <meta name="description" content="Create your profile on Liberty Social" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8">
          {/* Enhanced Header */}
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-200">
                <FaRocket className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <FaStar className="h-4 w-4 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Create Your Profile
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
              Join the decentralized social revolution and choose your unique
              identity
            </p>

            {/* Benefits Bar */}
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <FaGlobe className="h-4 w-4 text-blue-500" />
                <span>Decentralized</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaShield className="h-4 w-4 text-green-500" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaUsers className="h-4 w-4 text-purple-500" />
                <span>Community</span>
              </div>
            </div>
          </div>

          {/* Enhanced Profile Setup Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
            <div onSubmit={handleSubmit} className="space-y-8">
              {/* Enhanced Connected Wallet Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <FaCheck className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-green-900 mb-1">
                      Wallet Connected Successfully
                    </p>
                    <p className="text-sm text-green-700 font-mono bg-green-100/80 px-3 py-1 rounded-xl inline-block">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Enhanced Username Input */}
              <div className="space-y-4">
                <label
                  htmlFor="username"
                  className="block text-lg font-semibold text-gray-800"
                >
                  Choose Your Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-lg font-medium">@</span>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Enter your unique username"
                    maxLength={LIMITS.maxUsernameLength}
                    className="w-full pl-12 pr-20 py-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg placeholder-gray-400"
                    disabled={isCreating}
                  />
                  <div className="absolute inset-y-0 right-0 pr-6 flex items-center space-x-2">
                    {username && (
                      <div className="flex items-center">
                        {isUsernameValid ? (
                          <FaCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <FaTimes className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                      {username.length}/{LIMITS.maxUsernameLength}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                </div>

                {/* Enhanced Username Guidelines */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FaLightbulb className="h-5 w-5 text-blue-500" />
                    <h3 className="text-base font-semibold text-blue-900">
                      Username Guidelines
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div
                      className={`flex items-center space-x-2 p-2 rounded-lg ${username.length >= 3 &&
                        username.length <= LIMITS.maxUsernameLength
                        ? "bg-green-100/80 text-green-800"
                        : "bg-gray-100/80 text-gray-600"
                        }`}
                    >
                      {username.length >= 3 &&
                        username.length <= LIMITS.maxUsernameLength ? (
                        <FaCheck className="h-3 w-3" />
                      ) : (
                        <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
                      )}
                      <span>3-{LIMITS.maxUsernameLength} characters long</span>
                    </div>
                    <div
                      className={`flex items-center space-x-2 p-2 rounded-lg ${username && /^[a-zA-Z0-9_-]*$/.test(username)
                        ? "bg-green-100/80 text-green-800"
                        : "bg-gray-100/80 text-gray-600"
                        }`}
                    >
                      {username && /^[a-zA-Z0-9_-]*$/.test(username) ? (
                        <FaCheck className="h-3 w-3" />
                      ) : (
                        <div className="w-3 h-3 border border-gray-400 rounded-full"></div>
                      )}
                      <span>Letters, numbers, _, -</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-yellow-100/80 text-yellow-800">
                      <FaStar className="h-3 w-3" />
                      <span>Must be unique</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Enhanced Username Preview */}
              {username && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-2xl p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-xl font-bold">
                        {username.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700 mb-1">
                        Preview:
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        @{username}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Create Profile Button */}
              <button
                onClick={handleSubmit}
                disabled={isCreating || !username.trim() || validationError}
                className="group relative w-full flex justify-center items-center py-4 px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white text-lg font-semibold rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:hover:scale-100"
              >
                {isCreating ? (
                  <div className="flex items-center space-x-3">
                    <FaSpinner className="animate-spin h-5 w-5" />
                    <span>Creating Your Profile...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <FaRocket className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    <span>Launch My Profile</span>
                  </div>
                )}
              </button>

              {/* Progress indicator when creating */}
              {isCreating && (
                <div className="bg-blue-50 border border-blue-200/50 rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <FaSpinner className="animate-spin h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Creating your profile on the blockchain...
                      </p>
                      <p className="text-xs text-blue-700">
                        This may take a few moments to process
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Additional Information */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-start space-x-3">
                  <FaShield className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <p className="font-semibold text-gray-900 mb-2">
                      Important Information:
                    </p>
                    <ul className="space-y-1">
                      <li>
                        • Your profile is permanently stored on the blockchain
                      </li>

                      <li>• All profile data is publicly visible</li>
                      <li>
                        • By creating a profile, you agree to our terms of
                        service
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Help Section */}
          <div className="text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
              <p className="text-sm text-gray-600 mb-4">
                Need help getting started?
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm">
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  <FaUsers className="h-4 w-4" />
                  <span>Join Community</span>
                </button>
                <button className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 font-medium transition-colors">
                  <FaHeart className="h-4 w-4" />
                  <span>Contact Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
