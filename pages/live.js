import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { FaShield } from "react-icons/fa6";
import { useTheme } from "../contexts/ThemeContext";

// Components
import LiveHeader from "../components/Live/LiveHeader";
import StreamInput from "../components/Live/StreamInput";
import VideoPlayer from "../components/Live/VideoPlayer";
import StatsPanel from "../components/Live/StatsPanel";
import LiveChat from "../components/Live/LiveChat";
import ChannelList from "../components/Live/ChannelList";

const YouTubeLiveEmbed = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Wallet
  const { address } = useAccount();

  // State management
  const [videoUrl, setVideoUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [streamQuality, setStreamQuality] = useState("HD");
  const [showControls, setShowControls] = useState(true);

  // New State for Chat & Auth
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [hasLiked, setHasLiked] = useState(false);
  const [isStreamer, setIsStreamer] = useState(false);
  const [activeStream, setActiveStream] = useState(null);

  // Refs
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const hasJoined = useRef(false);
  const chatBottomRef = useRef(null);

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Handle URL input change
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);

    const videoId = extractVideoId(url);
    if (videoId) {
      setEmbedUrl(
        `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
      );
    } else {
      setEmbedUrl("");
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Initial Join (Increment View) & Polling
  useEffect(() => {
    if (!embedUrl) return;

    const registerView = async () => {
      if (hasJoined.current === embedUrl) return;

      try {
        const res = await fetch('/api/live/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'view' }),
        });
        const data = await res.json();
        if (data.success) {
          hasJoined.current = embedUrl;
          setViewCount(data.views);
        }
      } catch (error) {
        console.error("Failed to register view", error);
      }
    };

    registerView();

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/live/stats');
        const data = await res.json();

        if (data.views !== undefined) {
          setViewCount(data.views);
          setLikeCount(data.likes);
          if (data.chatMessages) {
            setChatMessages(prev => {
              if (JSON.stringify(prev) === JSON.stringify(data.chatMessages)) return prev;
              return data.chatMessages;
            });
          }

          if (address && data.likedUsers && data.likedUsers.includes(address)) {
            setHasLiked(true);
          }

          if (data.currentStream && data.currentStream.streamerAddress) {
            setIsStreamer(address === data.currentStream.streamerAddress);
          }
          if (data.currentStream) setActiveStream(data.currentStream);
        }

        if (data.currentStream && data.currentStream.isLive) {
          const remoteVideoId = extractVideoId(data.currentStream.url);
          const currentVideoId = extractVideoId(videoUrl);

          if (address !== data.currentStream.streamerAddress) {
            if (remoteVideoId && remoteVideoId !== currentVideoId) {
              setVideoUrl(data.currentStream.url);
              setEmbedUrl(`https://www.youtube.com/embed/${remoteVideoId}?autoplay=1&rel=0&modestbranding=1`);
              setIsLive(true);
            }
          }
        } else if (data.currentStream && !data.currentStream.isLive && isLive) {
          if (!isStreamer) {
            setIsLive(false);
            setEmbedUrl("");
          } else {
            console.log("Server lost stream state. Restoring...");
            fetch('/api/live/stats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'start_stream',
                url: videoUrl,
                title: "Live Stream",
                userAddress: address
              }),
            }).catch(console.error);
          }
        }

      } catch (error) {
        console.error("Failed to sync stats", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [embedUrl, videoUrl, address, isLive, isStreamer]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const toggleLiveMode = async () => {
    if (!address) {
      alert("Please connect your wallet to go live!");
      return;
    }

    if (isLive && !isStreamer) {
      alert("Only the streamer can end this broadcast!");
      return;
    }

    const newStatus = !isLive;

    if (newStatus) {
      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        alert("Please enter a valid YouTube URL first!");
        return;
      }

      setEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
      setIsLive(true);
      setIsStreamer(true);

      try {
        const res = await fetch('/api/live/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'start_stream',
            url: videoUrl,
            title: "Live Stream",
            userAddress: address
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to start");
      } catch (e) {
        console.error(e);
        alert("Failed to go live: " + e.message);
        setIsLive(false);
        setIsStreamer(false);
        setEmbedUrl("");
      }
    } else {
      setIsLive(false);
      setEmbedUrl("");
      try {
        await fetch('/api/live/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'end_stream',
            userAddress: address
          }),
        });
        setIsStreamer(false);
      } catch (e) { console.error(e); }
    }
  };

  const handleLike = async () => {
    if (hasLiked) return;
    if (!address) {
      alert("Please connect wallet to like!");
      return;
    }

    setLikeCount(prev => prev + 1);
    setHasLiked(true);
    try {
      await fetch('/api/live/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like',
          userAddress: address
        }),
      });
    } catch (error) {
      console.error("Failed to like", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = newMessage;
    setNewMessage("");

    try {
      await fetch('/api/live/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          message: msg,
          userAddress: address
        }),
      });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className={`max-w-6xl mx-auto transition-all duration-700 rounded-[2.5rem] shadow-2xl border overflow-hidden ${isDark ? "bg-[#0d0b1c]/60 border-white/5 backdrop-blur-2xl" : "bg-white/80 backdrop-blur-xl border-white/20"
      }`}>
      <LiveHeader isLive={isLive} theme={theme} />

      <StreamInput
        videoUrl={videoUrl}
        onUrlChange={handleUrlChange}
        onToggleLive={toggleLiveMode}
        isLive={isLive}
        theme={theme}
      />

      <VideoPlayer
        embedUrl={embedUrl}
        containerRef={containerRef}
        iframeRef={iframeRef}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        showControls={showControls}
        setShowControls={setShowControls}
        viewCount={viewCount}
        likeCount={likeCount}
        handleLike={handleLike}
        isLive={isLive}
        streamQuality={streamQuality}
        formatNumber={formatNumber}
        theme={theme}
        onToggleLive={toggleLiveMode}
        isStreamer={isStreamer}
      />

      {embedUrl && (
        <StatsPanel
          viewCount={viewCount}
          likeCount={likeCount}
          streamQuality={streamQuality}
          formatNumber={formatNumber}
          theme={theme}
        />
      )}

      {embedUrl && (
        <LiveChat
          chatMessages={chatMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          address={address}
          chatBottomRef={chatBottomRef}
          theme={theme}
        />
      )}

      <ChannelList
        activeStream={activeStream}
        isLive={isLive}
        isStreamer={isStreamer}
        videoUrl={videoUrl}
        onWatchStream={(stream) => {
          const videoId = extractVideoId(stream.url);
          if (videoId) {
            setVideoUrl(stream.url);
            setEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
            setIsLive(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        address={address}
        viewCount={viewCount}
        streamQuality={streamQuality}
        extractVideoId={extractVideoId}
        theme={theme}
      />

      {/* Footer */}
      <div className={`px-8 py-4 text-center border-t transition-all duration-500 ${isDark ? "bg-black/40 border-white/5" : "bg-gray-50/80 border-gray-100"
        }`}>
        <p className={`text-[9px] font-black uppercase tracking-[0.3em] flex items-center justify-center space-x-3 ${isDark ? "text-gray-600" : "text-gray-400"
          }`}>
          <FaShield className="h-3 w-3" />
          <span>
            SECURE_NEURAL_UPLINK • ENHANCED_METRICS_ACTIVE • v2.0.4-LOCKED
          </span>
        </p>
      </div>
    </div>
  );
};

export default YouTubeLiveEmbed;
