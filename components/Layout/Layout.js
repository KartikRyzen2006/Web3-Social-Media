import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { contractService } from "../../lib/contract";
import { UserProfileProvider } from "../../contexts/UserProfileContext";
import { useTheme } from "../../contexts/ThemeContext";

const Layout = ({ children }) => {
  const { theme } = useTheme();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUserProfile = async () => {
    if (!address || !isConnected || !publicClient) return;

    setIsLoading(true);
    try {
      const profile = await contractService.getProfile(publicClient, address);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  useEffect(() => {
    fetchUserProfile();
  }, [address, isConnected, publicClient]);

  return (
    <UserProfileProvider value={{ userProfile, refreshProfile, isLoading }}>
      <div className={`min-h-screen theme-bg main-content font-sans overflow-x-hidden`}>
        {/* Dynamic Overlay based on theme */}
        <div className={`fixed inset-0 pointer-events-none transition-opacity duration-700 ${theme === 'dark' ? 'bg-black/40 opacity-100' : 'bg-white/10 opacity-100'
          }`} />
        {/* Mobile backdrop overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userProfile={userProfile}
          isConnected={isConnected}
        />

        {/* Main container */}
        <div className="flex">
          {/* Sidebar */}
          <div
            className={`
            fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:z-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          >
            <Sidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              userProfile={userProfile}
              isConnected={isConnected}
            />
          </div>

          {/* Main content area */}
          <main className="flex-1 min-w-0">
            {/* Content wrapper with responsive padding */}
            <div className="relative">
              {/* Top spacing for fixed header */}
              <div className="h-16 lg:h-20"></div>

              {/* Main content */}
              <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
                {children}
              </div>
            </div>
          </main>
        </div>

        {/* Mobile bottom navigation - optional */}
        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
          <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2">
            <div className="flex justify-around items-center">
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5v-5z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserProfileProvider>
  );
};

export default Layout;
