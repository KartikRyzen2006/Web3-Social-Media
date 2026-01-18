import { useState } from "react";
import { useWalletClient } from "wagmi";
import {
  FaTimes,
  FaSpinner,
  FaUsers,
  FaLock,
  FaInfoCircle,
  FaStar,
  FaRocket,
  FaCheck,
} from "react-icons/fa";
import { contractService } from "../../lib/contract";
import { LIMITS } from "../../lib/constants";
import toast from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const { theme } = useTheme();
  const { data: walletClient } = useWalletClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Group name is required");
      return false;
    }

    if (formData.name.length > LIMITS.maxGroupName) {
      toast.error(
        `Group name must be less than ${LIMITS.maxGroupName} characters`
      );
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Group description is required");
      return false;
    }

    if (formData.description.length > 500) {
      toast.error("Description must be less than 500 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsCreating(true);

    try {
      const result = await contractService.createGroup(
        walletClient,
        formData.name.trim(),
        formData.description.trim()
      );

      if (result.success) {
        toast.success("Group created successfully!");
        onGroupCreated();
      }
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.description.trim();

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className={`fixed inset-0 transition-opacity duration-500 backdrop-blur-md ${theme === 'dark' ? 'bg-black/60' : 'bg-gray-500/30'}`}
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className={`inline-block align-bottom rounded-[2.5rem] text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border animate-in zoom-in-95 duration-300 ${theme === 'dark' ? 'bg-[#121026] border-purple-500/20 cyber-glow' : 'bg-white border-gray-100'}`}>
          {/* Header */}
          <div className={`relative px-10 pt-10 pb-6 border-b ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-gray-50 bg-gray-50/30'}`}>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-6">
                <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl ${theme === 'dark' ? 'bg-purple-600/20 cyber-border cyber-glow-sm' : 'bg-purple-600 shadow-purple-200'}`}>
                  <FaUsers className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Deploy New Node
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Initialize community protocol</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-3 rounded-2xl transition-all duration-300 ${theme === 'dark' ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-10 py-10 space-y-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                  Protocol Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    maxLength={LIMITS.maxGroupName}
                    placeholder="Enter node identifier..."
                    className={`w-full px-8 py-5 rounded-[1.5rem] border text-sm font-bold transition-all duration-500 placeholder:font-medium focus:outline-none focus:ring-0 ${theme === 'dark' ? 'bg-white/5 border-purple-500/20 text-white placeholder:text-gray-600 focus:border-cyan-400/50' : 'bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:bg-white'}`}
                    disabled={isCreating}
                  />
                  <div className={`absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black tracking-widest ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                    {formData.name.length}/{LIMITS.maxGroupName}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
                  Mission Summary
                </label>
                <div className="relative group">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    maxLength={500}
                    placeholder="Describe the node objective and community directives..."
                    className={`w-full px-8 py-5 rounded-[1.5rem] border text-sm font-bold transition-all duration-500 placeholder:font-medium focus:outline-none focus:ring-0 resize-none ${theme === 'dark' ? 'bg-white/5 border-purple-500/20 text-white placeholder:text-gray-600 focus:border-cyan-400/50' : 'bg-gray-50 border-gray-100 text-gray-900 placeholder:text-gray-400 focus:border-purple-600 focus:bg-white'}`}
                    disabled={isCreating}
                  />
                  <div className={`absolute right-6 bottom-5 text-[9px] font-black tracking-widest ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                    {formData.description.length}/500
                  </div>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className={`rounded-3xl p-8 border space-y-6 ${theme === 'dark' ? 'bg-purple-600/5 border-purple-500/10' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center space-x-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-100'}`}>
                  <FaInfoCircle className={`h-5 w-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <h4 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Deployment Protocols</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: FaCheck, text: "Auto-Leadership", detail: "Creator is first node", color: "text-green-400" },
                  { icon: FaLock, text: "Persistence", detail: "Blockchain permanent", color: "text-blue-400" },
                  { icon: FaUsers, text: "Community", detail: "Standards enforced", color: "text-purple-400" },
                  { icon: FaStar, text: "Access", detail: "Verified access only", color: "text-yellow-400" }
                ].map((item, idx) => (
                  <div key={idx} className={`flex items-center space-x-4 p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100'}`}>
                    <item.icon className={`h-4 w-4 flex-shrink-0 ${item.color}`} />
                    <div className="min-w-0">
                      <p className={`text-[10px] font-black uppercase truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>{item.text}</p>
                      <p className="text-[8px] font-bold text-gray-500 truncate">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`px-10 py-8 flex flex-col sm:flex-row-reverse gap-4 border-t ${theme === 'dark' ? 'border-white/5 bg-white/5' : 'border-gray-50'}`}>
            <button
              onClick={handleSubmit}
              disabled={isCreating || !isFormValid}
              className={`flex-1 inline-flex items-center justify-center px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white rounded-2xl transition-all duration-500 shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 cyber-glow-sm' : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-300'}`}
            >
              {isCreating ? (
                <>
                  <FaSpinner className="animate-spin h-4 w-4 mr-4" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <FaRocket className="h-4 w-4 mr-4" />
                  Initialize Node
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className={`flex-1 px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm'}`}
            >
              Abort Mission
            </button>
          </div>

          {isCreating && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
              <div className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
