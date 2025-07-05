import React, { useState, useEffect, useRef } from "react";

const ImageSlider = () => {
  // Media items for the collage
  const mediaItems = [
    { type: "image", src: "/slide1.jpeg", caption: "Kids Cricket Match" },
    { type: "image", src: "/slide2.jpeg", caption: "Kids Cricket Match" },
    { type: "video", src: "/slide_vdo1.mp4", caption: "Kids Cricket Match" },
    { type: "image", src: "/slide3.jpeg", caption: "Kids Cricket Match" },
    { type: "image", src: "/slide4.jpeg", caption: "Kids Cricket Match" },
    { type: "image", src: "/slide6.jpeg", caption: "Kids Cricket Match" },
    { type: "video", src: "/slide_vdo2.mp4", caption: "Kids Cricket Match" },
    { type: "image", src: "/slide5.jpeg", caption: "Kids Kids Cricket Match" },
    { type: "video", src: "/slide_vdo3.mp4", caption: "Kids Cricket Match" },
    { type: "image", src: "/slide7.jpeg", caption: "Kids Cricket Match" },
    { type: "image", src: "/slide8.jpeg", caption: "Kids Cricket Match" },
    { type: "video", src: "/slide_vdo4.mp4", caption: "Kids Cricket Match" },
    { type: "image", src: "/slide9.jpeg", caption: "Kids Cricket Match" },
    { type: "image", src: "/slide10.jpeg", caption: "Kids Cricket Match" },
    { type: "image", src: "/slide11.jpeg", caption: "Kids Cricket Match" },
    { type: "image", src: "/slide12.jpeg", caption: "Kids Cricket Match" },
    { type: "image", src: "/slide13.jpeg", caption: "Kids Cricket Match" },
  ];

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const [visibleItems, setVisibleItems] = useState([]);
  const loopTimerRef = useRef(null);
  const reshuffleTimerRef = useRef(null);
  const ytPlayer1Ref = useRef(null);
  const ytPlayer2Ref = useRef(null);
  const yt1 = useRef(null);
  const yt2 = useRef(null);

  // Generate random tile sizes for collage effect
  const generateTileSize = () => {
    // Creates random spans for height and width to create unsorted tile effect
    const heights = [1, 1, 1, 2]; // More frequently 1 to avoid overly large tiles
    const widths = [1, 1, 1, 2];

    return {
      height: heights[Math.floor(Math.random() * heights.length)],
      width: widths[Math.floor(Math.random() * widths.length)],
    };
  };

  // Prepare items with random sizes and positions
  const prepareItems = () => {
    return mediaItems.map((item, index) => ({
      ...item,
      id: index,
      size: generateTileSize(),
      order: Math.random(), // Random order for unsorted appearance
    }));
  };

  // Handle window resize for responsive layout
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize and handle looping functionality
  useEffect(() => {
    // Initial setup of items
    setVisibleItems(prepareItems());

    // Set up the looping functionality

    // Reshuffle items periodically for visual interest
    reshuffleTimerRef.current = setInterval(() => {
      setVisibleItems((items) => {
        return items.map((item) => ({
          ...item,
          size: generateTileSize(),
          order: Math.random(),
        }));
      });
    }, 10000); // Reshuffle every 10 seconds

    // Every 3 seconds, swap out an item to create looping effect
    loopTimerRef.current = setInterval(() => {
      setVisibleItems((items) => {
        // Make a copy of items
        const newItems = [...items];

        // Randomly select an item to replace
        const randomIndex = Math.floor(Math.random() * newItems.length);

        // Get current displayed source paths to avoid duplicates
        const currentSources = newItems.map((item) => item.src);

        // Filter available media items to avoid duplicates
        const availableItems = mediaItems.filter(
          (item) =>
            !currentSources.includes(item.src) ||
            item.src === newItems[randomIndex].src
        );

        // If no unique items left, use the original item being replaced
        const itemPool =
          availableItems.length > 0 ? availableItems : [newItems[randomIndex]];

        // Choose a random item from the available pool
        const randomMediaItem =
          itemPool[Math.floor(Math.random() * itemPool.length)];

        // Create new item with fresh random properties
        newItems[randomIndex] = {
          ...randomMediaItem,
          id: newItems[randomIndex].id, // Keep same ID for React key stability
          size: generateTileSize(),
          order: Math.random(),
        };

        return newItems;
      });
    }, 3000); // Swap an item every 3 seconds

    // Cleanup on unmount
    return () => {
      if (loopTimerRef.current) clearInterval(loopTimerRef.current);
      if (reshuffleTimerRef.current) clearInterval(reshuffleTimerRef.current);
    };
  }, []);

  // YouTube Iframe API setup
  useEffect(() => {
    if (typeof window === "undefined") return;
    function requestPlayerFullscreen(playerRef) {
      // Find the iframe inside the player div
      const iframe =
        playerRef.current && playerRef.current.querySelector("iframe");
      if (iframe) {
        if (iframe.requestFullscreen) iframe.requestFullscreen();
        else if (iframe.webkitRequestFullscreen)
          iframe.webkitRequestFullscreen();
        else if (iframe.mozRequestFullScreen) iframe.mozRequestFullScreen();
        else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
      }
    }
    function onYouTubeIframeAPIReady() {
      yt1.current = new window.YT.Player(ytPlayer1Ref.current, {
        videoId: "VbozgPTn7SR05TOT",
        playerVars: {
          modestbranding: 1,
          rel: 0,
          controls: 1,
          showinfo: 0,
          autoplay: 1,
        },
        events: {
          onReady: (event) => {
            event.target.playVideo();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING && yt2.current) {
              yt2.current.pauseVideo();
              requestPlayerFullscreen(ytPlayer1Ref);
            }
          },
        },
      });
      yt2.current = new window.YT.Player(ytPlayer2Ref.current, {
        videoId: "FwfBldmzrZBi5qVh",
        playerVars: {
          modestbranding: 1,
          rel: 0,
          controls: 1,
          showinfo: 0,
          autoplay: 0,
        },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING && yt1.current) {
              yt1.current.pauseVideo();
              requestPlayerFullscreen(ytPlayer2Ref);
            }
          },
        },
      });
    }
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    } else {
      onYouTubeIframeAPIReady();
    }
  }, []);

  // Get column count based on screen width
  const getColumnCount = () => {
    const { width } = windowSize;
    if (width < 480) return 2; // Mobile phones
    if (width < 768) return 3; // Tablets
    if (width < 1024) return 4; // Small laptops
    return 5; // Larger screens
  };

  return (
    <div className="tiles-wrapper">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          justifyContent: "center",
          marginBottom: 32,
        }}
      >
        <div
          ref={ytPlayer1Ref}
          className="youtube-embed"
          style={{ width: "100%", maxWidth: 560, height: 315 }}
          // The iframe created by the API will inherit allowFullScreen and allow attributes
        ></div>
        <div
          ref={ytPlayer2Ref}
          className="youtube-embed"
          style={{ width: "100%", maxWidth: 560, height: 315 }}
        ></div>
      </div>

      <div className="tiles-controls">
        <p className="event-title">Kids Event</p>
      </div>

      <div className="tiles-grid">
        {visibleItems
          .sort((a, b) => a.order - b.order)
          .map((item) => (
            <div
              key={item.id}
              className="tile-item"
              style={{
                gridRow: `span ${item.size.height}`,
                gridColumn: `span ${item.size.width}`,
              }}
            >
              {item.type === "image" ? (
                <div className="tile-image-container">
                  <img
                    src={item.src}
                    alt={item.caption || `Tile ${item.id}`}
                    className="tile-image"
                  />
                  <div className="tile-caption">
                    <span>{item.caption}</span>
                  </div>
                </div>
              ) : (
                <div className="tile-video-container">
                  <video muted loop playsInline autoPlay className="tile-video">
                    <source src={item.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="tile-caption">
                    <span>{item.caption}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      <style jsx>{`
        .event-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-light);
          margin: 0;
          padding: 0.8rem 2.5rem;
          background: linear-gradient(
            45deg,
            var(--primary-dark),
            var(--primary),
            var(--primary-light)
          );
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
          text-transform: uppercase;
          letter-spacing: 2px;
          position: relative;
          display: inline-block;
          transition: all 0.3s ease;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.2);
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
        }

        .event-title:before {
          content: "";
          position: absolute;
          top: -5px;
          left: -5px;
          right: -5px;
          bottom: -5px;
          background: linear-gradient(
            45deg,
            var(--primary-dark),
            var(--primary),
            var(--primary-light)
          );
          z-index: -1;
          border-radius: 20px;
          filter: blur(12px);
          opacity: 0.7;
          animation: pulse 2.5s infinite alternate;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.6;
          }
        }

        @media (max-width: 768px) {
          .event-title {
            font-size: 1.6rem;
            padding: 0.6rem 1.8rem;
            border-radius: 12px;
            letter-spacing: 1.5px;
          }
        }

        @media (max-width: 480px) {
          .event-title {
            font-size: 1.3rem;
            padding: 0.5rem 1.4rem;
            border-radius: 10px;
            letter-spacing: 1px;
          }
        }

        .tiles-wrapper {
          position: relative;
          width: 100%;
          max-width: 1200px;
          margin: 2rem auto;
          overflow: hidden;
        }

        .tiles-controls {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .loop-toggle {
          background-color: #f0f0f0;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .loop-toggle.active {
          background-color: #3498db;
          color: white;
        }

        .tiles-grid {
          display: grid;
          grid-template-columns: repeat(${getColumnCount()}, 1fr);
          height: 1200px;
          gap: 10px;
          grid-auto-flow: dense;
        }

        .tile-item {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.5s ease, opacity 0.5s ease;
          min-height: 100px;
          animation: fadeIn 0.5s ease-in-out;
        }

        .tile-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          z-index: 1;
        }

        .tile-image-container,
        .tile-video-container {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 100px;
          overflow: hidden;
        }

        .tile-image,
        .tile-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.3s ease;
        }

        .tile-item:hover .tile-image,
        .tile-item:hover .tile-video {
          transform: scale(1.05);
        }

        .tile-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          padding: 15px 10px 10px;
          color: white;
          font-size: 14px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .tile-item:hover .tile-caption {
          opacity: 1;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.9);
          }
        }

        @media (max-width: 1024px) {
          .tiles-wrapper {
            margin: 1.5rem auto;
            padding: 0 15px;
          }
        }

        @media (max-width: 768px) {
          .tiles-wrapper {
            margin: 1rem auto;
          }

          .tile-item {
            border-radius: 6px;
          }

          .tile-caption {
            padding: 10px 8px 8px;
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .tiles-wrapper {
            margin: 0.75rem auto;
            padding: 0 10px;
          }

          .tile-item {
            min-height: 80px;
          }

          .loop-toggle {
            padding: 6px 12px;
            font-size: 12px;
          }
        }

        .youtube-embed {
          position: relative;
          width: 100%;
          max-width: 560px;
          height: 315px;
          overflow: hidden;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          border: 3px solid #3498db;
          background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }

        .youtube-embed:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 32px 0 rgba(52, 152, 219, 0.25), 0 0 0 4px #85c1e9;
          border-color: #217dbb;
        }

        .youtube-embed iframe {
          width: 100%;
          height: 100%;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          border: 3px solid #3498db;
          background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .youtube-embed iframe:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 32px 0 rgba(52, 152, 219, 0.25), 0 0 0 4px #85c1e9;
          border-color: #217dbb;
        }
      `}</style>
    </div>
  );
};

export default ImageSlider;
