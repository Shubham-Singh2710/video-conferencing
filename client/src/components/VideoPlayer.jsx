import React, { useRef, useEffect } from 'react';
import { MicOff } from 'lucide-react';

const VideoPlayer = ({ stream, isLocal, name, isMuted }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
          console.error("AutoPlay was prevented or failed:", err);
      });
    }
  }, [stream]);

  return (
    <div className="video-wrapper">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={isLocal ? '' : 'remote-video'}
      />
      <div className="video-label">
        {name || 'Participant'}
        {isMuted && <MicOff className="video-state-icon" size={16} />}
      </div>
    </div>
  );
};

export default VideoPlayer;
