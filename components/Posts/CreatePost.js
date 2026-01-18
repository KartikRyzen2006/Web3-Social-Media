import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useWalletClient } from "wagmi";
import {
  FaImage,
  FaVideo,
  FaTimes,
  FaUpload,
  FaSpinner,
  FaFileAlt,
  FaCloudUploadAlt,
  FaMagic,
  FaPaperPlane,
} from "react-icons/fa";
import { contractService } from "../../lib/contract";
import { pinataService } from "../../lib/pinata";
import { POST_TYPES, SUPPORTED_FILE_TYPES, LIMITS } from "../../lib/constants";
import { useUserProfile } from "../../contexts/UserProfileContext";
import toast from "react-hot-toast";
import { useTheme } from "../../contexts/ThemeContext";

const CreatePost = ({ onPostCreated, onCancel }) => {
  const { theme } = useTheme();
  const { data: walletClient } = useWalletClient();
  const { refreshProfile } = useUserProfile();
  const [postData, setPostData] = useState({
    description: "",
    postType: POST_TYPES.TEXT,
    file: null,
    ipfsUrl: "",
  });
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const isImage = SUPPORTED_FILE_TYPES.images.includes(file.type);
      const isVideo = SUPPORTED_FILE_TYPES.videos.includes(file.type);

      if (isImage) {
        setPostData((prev) => ({ ...prev, file, postType: POST_TYPES.IMAGE }));
      } else if (isVideo) {
        setPostData((prev) => ({ ...prev, file, postType: POST_TYPES.VIDEO }));
      } else {
        toast.error("Unsupported file type");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": SUPPORTED_FILE_TYPES.images,
      "video/*": SUPPORTED_FILE_TYPES.videos,
    },
    maxSize: LIMITS.maxFileSize,
    multiple: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPostData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveFile = () => {
    setPostData((prev) => ({
      ...prev,
      file: null,
      postType: POST_TYPES.TEXT,
      ipfsUrl: "",
    }));
  };

  const uploadToIPFS = async () => {
    if (!postData.file) return "";

    setUploading(true);
    try {
      const result = await pinataService.uploadFile(postData.file, {
        name: `post-${Date.now()}-${postData.file.name}`,
        keyvalues: {
          postType: postData.postType,
          fileType: postData.file.type,
        },
      });

      if (result.success) {
        return result.ipfsUrl;
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("IPFS upload error:", error);
      toast.error("Failed to upload file to IPFS");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postData.description.trim()) {
      toast.error("Please add a description");
      return;
    }

    if (postData.description.length > LIMITS.maxPostDescription) {
      toast.error(
        `Description must be less than ${LIMITS.maxPostDescription} characters`
      );
      return;
    }

    if (!walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    setCreating(true);

    try {
      let ipfsUrl = "";

      if (postData.file) {
        ipfsUrl = await uploadToIPFS();
      }

      const result = await contractService.createPost(
        walletClient,
        postData.postType,
        postData.description,
        ipfsUrl
      );

      if (result.success) {
        toast.success("Post created successfully!");

        await refreshProfile();

        onPostCreated();
        setPostData({
          description: "",
          postType: POST_TYPES.TEXT,
          file: null,
          ipfsUrl: "",
        });
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  const isSubmitDisabled =
    !postData.description.trim() || uploading || creating;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create New Post</h3>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>Share your thoughts with the decentralized world</p>
        </div>
        <button
          onClick={onCancel}
          className={`p-3 rounded-2xl transition-all duration-300 ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
        >
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="relative group/input">
            <textarea
              name="description"
              value={postData.description}
              onChange={handleInputChange}
              placeholder="What's on your mind? Share your thoughts with the community..."
              rows={5}
              maxLength={LIMITS.maxPostDescription}
              className={`w-full px-6 py-6 rounded-[2rem] border focus:ring-4 focus:ring-purple-500/20 resize-none transition-all duration-300 font-medium leading-relaxed ${theme === 'dark' ? 'bg-white/5 border-purple-500/30 text-white placeholder-white/30 hover:border-purple-500/50' : 'bg-gray-50/80 border-gray-200 text-gray-900 placeholder-gray-400 hover:bg-gray-100/50'}`}
            />
            <div className={`absolute bottom-4 right-4 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl border backdrop-blur-md transition-opacity duration-300 ${theme === 'dark' ? 'bg-black/60 border-purple-500/30 text-purple-400' : 'bg-white/60 border-gray-100 text-gray-500'}`}>
              {postData.description.length}/{LIMITS.maxPostDescription}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border-purple-500/20 text-purple-400' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
              {postData.postType === POST_TYPES.IMAGE && (
                <>
                  <FaImage className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Image Post
                  </span>
                </>
              )}
              {postData.postType === POST_TYPES.VIDEO && (
                <>
                  <FaVideo className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Video Post
                  </span>
                </>
              )}
              {postData.postType === POST_TYPES.TEXT && (
                <>
                  <FaFileAlt className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Text Post
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {!postData.file && (
          <div
            {...getRootProps()}
            className={`
              relative overflow-hidden border-2 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all duration-500 group
              ${isDragActive
                ? theme === 'dark' ? "border-purple-500 bg-purple-500/10 scale-102 shadow-2xl shadow-purple-500/20" : "border-purple-400 bg-purple-50/50 scale-102"
                : theme === 'dark' ? "border-purple-500/20 hover:border-purple-500/50 bg-white/5 hover:bg-white/10" : "border-gray-200 hover:border-purple-400 bg-white hover:bg-gray-50"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="relative z-10">
              <div
                className={`
                w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110
                ${isDragActive
                    ? theme === 'dark' ? "bg-gradient-to-br from-purple-600 to-cyan-500 cyber-glow" : "bg-gradient-to-br from-purple-500 to-indigo-500"
                    : theme === 'dark' ? "bg-[#1a1635] border border-purple-500/30" : "bg-gray-100 border border-gray-200"
                  }
              `}
              >
                <FaCloudUploadAlt className={`h-10 w-10 ${theme === 'dark' ? 'text-purple-400 group-hover:text-cyan-400' : 'text-gray-400 group-hover:text-purple-500'}`} />
              </div>

              {isDragActive ? (
                <div className="space-y-2">
                  <p className={`text-xl font-black ${theme === 'dark' ? 'text-cyan-400' : 'text-purple-600'}`}>
                    Release to Transmit
                  </p>
                  <p className="text-sm text-gray-500 font-medium tracking-tight">Integrating file into the network...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Add media to your broadcast
                  </p>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                    Drag & drop or{" "}
                    <span className="text-purple-500 font-black uppercase tracking-widest text-[10px]">
                      click to browse
                    </span>
                  </p>
                  <div className="flex items-center justify-center space-x-6 mt-6">
                    <div className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                      <FaImage className="h-3 w-3" />
                      <span>Images</span>
                    </div>
                    <div className={`w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-purple-500/30' : 'bg-gray-300'}`}></div>
                    <div className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                      <FaVideo className="h-3 w-3" />
                      <span>Videos</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {postData.file && (
          <div className={`relative border rounded-[2rem] p-6 shadow-2xl transition-all duration-500 hover:scale-[1.02] ${theme === 'dark' ? 'bg-[#1a1635]/80 border-purple-500/30 shadow-purple-500/10' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div
                  className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg
                  ${postData.postType === POST_TYPES.IMAGE
                      ? "bg-gradient-to-br from-cyan-500 to-blue-600"
                      : "bg-gradient-to-br from-purple-600 to-pink-600"
                    }
                `}
                >
                  {postData.postType === POST_TYPES.IMAGE ? (
                    <FaImage className="h-6 w-6 text-white" />
                  ) : (
                    <FaVideo className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-black truncate max-w-[150px] sm:max-w-xs ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {postData.file.name}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {(postData.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className={`p-2.5 rounded-xl transition-all duration-300 ${theme === 'dark' ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden group/preview">
              {postData.postType === POST_TYPES.IMAGE && (
                <img
                  src={URL.createObjectURL(postData.file)}
                  alt="Preview"
                  className={`w-full max-h-96 object-cover rounded-2xl transition-transform duration-700 group-hover/preview:scale-105 ${theme === 'dark' ? 'border border-purple-500/20' : ''}`}
                />
              )}

              {postData.postType === POST_TYPES.VIDEO && (
                <video
                  src={URL.createObjectURL(postData.file)}
                  controls
                  className={`w-full max-h-96 object-cover rounded-2xl ${theme === 'dark' ? 'border border-purple-500/20' : ''}`}
                />
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6">
          <button
            type="button"
            onClick={onCancel}
            className={`flex items-center space-x-2 px-8 py-4 text-sm font-black uppercase tracking-widest border rounded-[1.5rem] transition-all duration-300 transform hover:scale-105 ${theme === 'dark' ? 'bg-white/5 border-purple-500/30 text-gray-400 hover:text-white hover:bg-white/10' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'}`}
          >
            <FaTimes className="h-4 w-4" />
            <span>Cancel</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`flex items-center space-x-3 px-10 py-4 text-sm font-black uppercase tracking-widest text-white rounded-[1.5rem] transition-all duration-500 shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:shadow-purple-500/40' : 'bg-gradient-to-r from-purple-600 to-indigo-600'}`}
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin h-4 w-4" />
                <span>Uploading...</span>
              </>
            ) : creating ? (
              <>
                <FaSpinner className="animate-spin h-4 w-4" />
                <span>Broadcasting...</span>
              </>
            ) : (
              <>
                <FaPaperPlane className="h-4 w-4" />
                <span>Share Broadcast</span>
              </>
            )}
          </button>
        </div>

        {(uploading || creating) && (
          <div className={`border rounded-2xl p-6 transition-all duration-500 animate-pulse ${theme === 'dark' ? 'bg-white/5 border-purple-500/20' : 'bg-purple-50 border-purple-100'}`}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600 to-cyan-500' : 'bg-purple-600'}`}>
                <FaSpinner className="animate-spin h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-cyan-400' : 'text-purple-600'}`}>
                  {uploading ? "Uploading to Network..." : "Broadcasting Transaction..."}
                </p>
                <p className={`text-xs mt-1 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {uploading
                    ? "Securely storing your media on the decentralized web"
                    : "Synchronizing with the blockchain network"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
