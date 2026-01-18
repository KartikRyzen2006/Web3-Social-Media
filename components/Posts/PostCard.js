import { useState, useEffect } from "react";
import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import { useTheme } from "../../contexts/ThemeContext";

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp * 1000);
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
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaEllipsisH,
  FaEdit,
  FaTrash,
  FaUserCircle,
  FaImage,
  FaVideo,
  FaSpinner,
  FaGlobe,
  FaCheck,
  FaCopy,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { contractService } from "../../lib/contract";
import { pinataService } from "../../lib/pinata";
import { POST_TYPES } from "../../lib/constants";
import toast from "react-hot-toast";
import Link from "next/link";

const PostCard = ({ post, currentUser, onPostUpdate }) => {
  const { theme } = useTheme();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  if (!post || !post.author || post.postID === undefined || post.postID === null) {
    return null;
  }

  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [comments, setComments] = useState([]);
  const [commentProfiles, setCommentProfiles] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(
    post?.postDescription || ""
  );
  const [authorProfile, setAuthorProfile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState({
    like: false,
    comment: false,
    edit: false,
    delete: false,
  });
  const [loadingComments, setLoadingComments] = useState(false);

  // Fetch author profile and like status
  useEffect(() => {
    const fetchData = async () => {
      if (publicClient && post?.author) {
        try {
          // Fetch author profile
          const profile = await contractService.getProfile(
            publicClient,
            post.author
          );
          setAuthorProfile(profile);

          // Check if current user liked this post
          if (address) {
            const liked = await contractService.checkIfLiked(
              publicClient,
              post.postID,
              address
            );
            setIsLiked(liked);
          }
        } catch (error) {
          console.error("Error fetching post data:", error);
        }
      }
    };

    fetchData();
  }, [publicClient, post?.author, address, post?.postID]);

  // Fetch comments when showing comments section
  useEffect(() => {
    const fetchComments = async () => {
      if (showComments && publicClient && post?.postID) {
        try {
          setLoadingComments(true);
          const postComments = await contractService.getPostComments(
            publicClient,
            post.postID
          );
          setComments(postComments);

          // Fetch profiles for commenters
          const uniqueAuthors = [...new Set(postComments.map((c) => c.author))].filter(Boolean);
          const profiles = {};
          await Promise.all(
            uniqueAuthors.map(async (author) => {
              try {
                const profile = await contractService.getProfile(
                  publicClient,
                  author
                );
                profiles[author] = profile;
              } catch (err) {
                console.error(`Error fetching profile for ${author}:`, err);
              }
            })
          );
          setCommentProfiles(profiles);
        } catch (error) {
          console.error("Error fetching comments:", error);
        } finally {
          setLoadingComments(false);
        }
      }
    };

    fetchComments();
  }, [showComments, publicClient, post?.postID]);

  const handleLike = async () => {
    if (!walletClient || loading.like) return;

    setLoading((prev) => ({ ...prev, like: true }));

    try {
      const result = isLiked
        ? await contractService.unlikePost(walletClient, post.postID)
        : await contractService.likePost(walletClient, post.postID);

      if (result.success) {
        setIsLiked(!isLiked);
        setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading((prev) => ({ ...prev, like: false }));
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!walletClient || !newComment.trim() || loading.comment) return;

    setLoading((prev) => ({ ...prev, comment: true }));

    try {
      const isReply = !!replyTo;
      const parentIndex = replyTo ? replyTo.index : 0;

      const result = await contractService.addComment(
        walletClient,
        newComment.trim(),
        post.postID,
        isReply,
        parentIndex
      );

      if (result.success) {
        setNewComment("");
        setReplyTo(null);
        setCommentCount((prev) => prev + 1);
        // Refresh comments list
        const updatedComments = await contractService.getPostComments(
          publicClient,
          post.postID
        );
        setComments(updatedComments);

        // Update profiles mapping
        const uniqueAuthors = [
          ...new Set(updatedComments.map((c) => c.author)),
        ].filter((a) => a && !commentProfiles[a]);

        if (uniqueAuthors.length > 0) {
          const newProfiles = { ...commentProfiles };
          await Promise.all(
            uniqueAuthors.map(async (author) => {
              try {
                const profile = await contractService.getProfile(
                  publicClient,
                  author
                );
                newProfiles[author] = profile;
              } catch (err) {
                console.error(`Error fetching profile for ${author}:`, err);
              }
            })
          );
          setCommentProfiles(newProfiles);
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading((prev) => ({ ...prev, comment: false }));
    }
  };

  const handleEdit = async () => {
    if (!walletClient || !editDescription.trim() || loading.edit) return;

    setLoading((prev) => ({ ...prev, edit: true }));

    try {
      const result = await contractService.editPost(
        walletClient,
        post.postID,
        editDescription.trim()
      );

      if (result.success) {
        setIsEditing(false);
        onPostUpdate && onPostUpdate();
        toast.success("Post updated successfully!");
      }
    } catch (error) {
      console.error("Error editing post:", error);
    } finally {
      setLoading((prev) => ({ ...prev, edit: false }));
    }
  };

  const handleDelete = async () => {
    if (!walletClient || loading.delete) return;

    if (!confirm("Are you sure you want to delete this post?")) return;

    setLoading((prev) => ({ ...prev, delete: true }));

    try {
      const result = await contractService.deletePost(
        walletClient,
        post.postID
      );

      if (result.success) {
        // Wait for transaction to be mined for better sync
        if (publicClient && result.hash) {
          toast.loading("Updating network records...", { duration: 2000 });
          await publicClient.waitForTransactionReceipt({ hash: result.hash });
        }
        onPostUpdate && onPostUpdate();
        toast.success("Post deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleShare = async () => {
    const url = window.location.origin + `/post/${post.postID}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy link");
    }
  };

  const isOwner =
    currentUser &&
    post?.author &&
    post.author.toLowerCase() === currentUser.toLowerCase();
  const timeAgo = formatTimeAgo(post?.timeCreated || 0);

  return (
    <div className="glass-panel overflow-hidden transition-all duration-500 hover:shadow-2xl group/card">
      {/* Post Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/profile/${post.author}`}>
              <div className="relative group cursor-pointer">
                <div className={`h-12 w-12 bg-gradient-to-br ${theme === 'dark' ? 'from-purple-600 to-cyan-500 shadow-purple-500/20' : 'from-purple-500 to-indigo-500 shadow-purple-500/10'} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {authorProfile?.name ? (
                    <span className="text-white font-black text-xl">
                      {authorProfile.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <FaUserCircle className="h-8 w-8 text-white" />
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 ${theme === 'dark' ? 'bg-green-400 border-[#0d0b1c]' : 'bg-green-500 border-white'}`}></div>
              </div>
            </Link>
            <div>
              <Link href={`/profile/${post.author}`}>
                <h3 className={`font-black tracking-tight hover:text-cyan-400 cursor-pointer transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {authorProfile?.name ||
                    `${post.author?.slice(0, 6)}...${post.author?.slice(-4)}`}
                </h3>
              </Link>
              <div className={`flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white/40' : 'text-gray-500'}`}>
                <span>{timeAgo}</span>
                <span className="opacity-30">•</span>
                <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-purple-500/20 text-cyan-400 border border-purple-500/30' : 'bg-purple-100 text-purple-600'}`}>
                  {post.postType === POST_TYPES.IMAGE && <FaImage className="h-2.5 w-2.5" />}
                  {post.postType === POST_TYPES.VIDEO && <FaVideo className="h-2.5 w-2.5" />}
                  {post.postType === POST_TYPES.TEXT && <FaGlobe className="h-2.5 w-2.5" />}
                  <span>{post.postType || "text"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-4">
          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className={`w-full p-4 rounded-2xl border focus:ring-4 focus:ring-purple-500/20 resize-none transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border-purple-500/30 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                rows={4}
                placeholder="Edit your post..."
              />
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleEdit}
                  disabled={loading.edit || !editDescription.trim()}
                  className={`flex items-center space-x-2 px-6 py-3 font-bold rounded-2xl disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white' : 'bg-purple-600 text-white'}`}
                >
                  {loading.edit ? <FaSpinner className="animate-spin h-4 w-4" /> : <FaSave className="h-4 w-4" />}
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditDescription(post?.postDescription || "");
                  }}
                  className={`flex items-center space-x-2 px-6 py-3 font-bold rounded-2xl transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <FaTimes className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <p className={`whitespace-pre-wrap leading-relaxed text-lg font-medium tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {post?.postDescription || ""}
            </p>
          )}
        </div>
      </div>

      {/* Media Content */}
      {post.postURL && (
        <div className="relative group/media my-4">
          {post.postType === POST_TYPES.IMAGE && (
            <div className={`relative overflow-hidden ${theme === 'dark' ? 'bg-[#0d0b1c]' : 'bg-gray-100'}`}>
              <img
                src={pinataService.getIpfsUrl(post.postURL)}
                alt="Post content"
                className="w-full max-h-[32rem] object-cover transition-transform duration-700 group-hover/card:scale-[1.02]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-500"></div>
            </div>
          )}
          {post.postType === POST_TYPES.VIDEO && (
            <div className={`rounded-3xl overflow-hidden mx-6 mb-6 ${theme === 'dark' ? 'bg-black/40 cyber-border' : 'bg-gray-900 shadow-xl'}`}>
              <video
                src={pinataService.getIpfsUrl(post.postURL)}
                controls
                className="w-full max-h-[32rem]"
                preload="metadata"
              />
            </div>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className={`px-6 py-4 border-t ${theme === 'dark' ? 'border-purple-500/10' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={loading.like || !address}
              className={`group flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold transition-all duration-300 ${isLiked
                ? theme === 'dark' ? 'text-cyan-400 bg-cyan-400/10' : 'text-red-600 bg-red-50'
                : theme === 'dark' ? 'text-gray-400 hover:text-cyan-400 hover:bg-white/5' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                } disabled:opacity-50`}
            >
              {loading.like ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : isLiked ? (
                <FaHeart className={`h-5 w-5 group-hover:scale-125 transition-transform ${theme === 'dark' ? 'cyber-glow' : ''}`} />
              ) : (
                <FaRegHeart className="h-5 w-5 group-hover:scale-125 transition-transform" />
              )}
              <span className="text-sm">{likes}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`group flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold transition-all duration-300 ${showComments
                ? theme === 'dark' ? 'text-purple-400 bg-purple-400/10' : 'text-purple-600 bg-purple-50'
                : theme === 'dark' ? 'text-gray-400 hover:text-purple-400 hover:bg-white/5' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
            >
              <FaComment className="h-5 w-5 group-hover:scale-125 transition-transform" />
              <span className="text-sm">{commentCount}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className={`group flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold transition-all duration-300 ${copied
                ? theme === 'dark' ? 'text-green-400 bg-green-400/10' : 'text-green-600 bg-green-50'
                : theme === 'dark' ? 'text-gray-400 hover:text-green-400 hover:bg-white/5' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
            >
              {copied ? (
                <FaCheck className="h-5 w-5" />
              ) : (
                <FaShare className="h-5 w-5 group-hover:scale-125 transition-transform" />
              )}
              <span className="text-sm">{copied ? "Copied!" : "Share"}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {isOwner && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`group p-3 rounded-2xl transition-all duration-300 ${theme === 'dark' ? 'text-gray-400 hover:text-cyan-400 hover:bg-white/5' : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'}`}
                  title="Edit Post"
                >
                  <FaEdit className="h-5 w-5 group-hover:scale-125 transition-transform" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading.delete}
                  className={`group p-3 rounded-2xl transition-all duration-300 ${theme === 'dark' ? 'text-gray-400 hover:text-red-500 hover:bg-white/5' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}
                  title="Delete Post"
                >
                  {loading.delete ? (
                    <FaSpinner className="animate-spin h-5 w-5" />
                  ) : (
                    <FaTrash className="h-5 w-5 group-hover:scale-125 transition-transform" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className={`border-t transition-all duration-500 ${theme === 'dark' ? 'border-purple-500/10 bg-black/20' : 'border-gray-100 bg-gray-50/50'}`}>
          {/* Reply To Badge */}
          {replyTo && (
            <div className={`px-6 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'bg-purple-500/20 text-cyan-400 border-b border-purple-500/10' : 'bg-purple-50 text-purple-600 border-b border-purple-100'}`}>
              <span className="flex items-center">
                <FaShare className="mr-2 scale-x-[-1]" />
                Replying to @{replyTo.authorName}
              </span>
              <button
                onClick={() => setReplyTo(null)}
                className="hover:text-red-500 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* Add Comment */}
          {address && (
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-purple-500/10' : 'border-gray-100'}`}>
              <div className="flex space-x-4">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${theme === 'dark' ? 'bg-white/5 cyber-border' : 'bg-gray-100 border border-gray-200'}`}>
                  <FaUserCircle className={`h-6 w-6 ${theme === 'dark' ? 'text-purple-400' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 flex space-x-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment(e)}
                    placeholder="Write a thoughtful comment..."
                    className={`flex-1 px-5 py-3 rounded-2xl border focus:ring-4 focus:ring-purple-500/20 text-sm transition-all duration-300 ${theme === 'dark' ? 'bg-white/5 border-purple-500/30 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                  <button
                    onClick={handleComment}
                    disabled={loading.comment || !newComment.trim()}
                    className={`px-8 py-3 font-bold rounded-2xl disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white' : 'bg-purple-600 text-white'}`}
                  >
                    {loading.comment ? <FaSpinner className="animate-spin h-4 w-4" /> : "Post"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="p-6 space-y-4 max-h-96 overflow-y-auto sidebar-scroll">
            {loadingComments ? (
              <div className="flex justify-center py-12">
                <FaSpinner className="animate-spin h-8 w-8 text-cyan-500" />
              </div>
            ) : commentCount > 0 ? (
              comments.map((comment, index) => (
                <div
                  key={index}
                  className={`flex space-x-3 p-5 rounded-[1.5rem] border transition-all duration-300 hover:scale-[1.01] ${theme === 'dark' ? 'bg-white/5 border-purple-500/10' : 'bg-white border-gray-100 shadow-sm'} ${comment.isReply ? 'ml-8 bg-black/5 dark:bg-white/5' : ''}`}
                >
                  <Link href={`/profile/${comment.author}`}>
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 cursor-pointer ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-gray-100'}`}>
                      {commentProfiles[comment.author]?.name ? (
                        <span className="text-purple-400 font-bold text-xs uppercase">
                          {commentProfiles[comment.author].name.charAt(0)}
                        </span>
                      ) : (
                        <FaUserCircle className={`h-5 w-5 ${theme === 'dark' ? 'text-purple-400' : 'text-gray-400'}`} />
                      )}
                    </div>
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Link href={`/profile/${comment.author}`}>
                        <span className={`text-xs font-black cursor-pointer hover:text-cyan-400 transition-colors ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {commentProfiles[comment.author]?.name ||
                            `${comment.author.slice(0, 6)}...${comment.author.slice(-4)}`}
                        </span>
                      </Link>
                      <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                        {formatTimeAgo(comment.timeCreated)}
                      </span>
                    </div>

                    {comment.isReply && (
                      <div className="text-[9px] text-cyan-400 font-black uppercase mb-1 flex items-center">
                        <FaShare className="mr-1 scale-x-[-1] h-2 w-2" />
                        Replying to @{
                          commentProfiles[comments[comment.parentCommentIndex]?.author]?.name ||
                          (comments[comment.parentCommentIndex]?.author ?
                            `${comments[comment.parentCommentIndex].author.slice(0, 6)}...${comments[comment.parentCommentIndex].author.slice(-4)}` :
                            `#${Number(comment.parentCommentIndex) + 1}`)
                        }
                      </div>
                    )}

                    <p className={`text-sm leading-relaxed font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {comment.text}
                    </p>

                    <button
                      onClick={() => {
                        setReplyTo({
                          index,
                          authorAddress: comment.author,
                          authorName: commentProfiles[comment.author]?.name || comment.author.slice(0, 6)
                        });
                        document.querySelector(`input[placeholder="Write a thoughtful comment..."]`)?.focus();
                      }}
                      className="mt-3 text-[9px] font-black uppercase text-gray-500 hover:text-cyan-400 transition-colors flex items-center space-x-1"
                    >
                      <FaShare className="scale-x-[-1] h-2.5 w-2.5" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl ${theme === 'dark' ? 'bg-white/5 cyber-border' : 'bg-gray-100 border border-gray-200'}`}>
                  <FaComment className={`h-10 w-10 ${theme === 'dark' ? 'text-purple-400/40' : 'text-gray-300'}`} />
                </div>
                <h4 className={`text-lg font-black mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>No comments yet</h4>
                <p className="text-sm text-gray-500 font-medium">
                  Be the first to share your thoughts!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default PostCard;
