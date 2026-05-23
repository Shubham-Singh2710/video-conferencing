import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageCircle, Camera, MonitorUp } from 'lucide-react';

const VideoControls = ({ 
  isAudioOn, 
  isVideoOn, 
  toggleAudio, 
  toggleVideo, 
  onLeave,
  toggleChat,
  isChatOpen,
  onCapturePhoto,
  onToggleScreenShare,
  isScreenSharing
}) => {
  return (
    <div className="controls-bar glass-panel fade-in">
      <button 
        className={`btn btn-icon btn-control ${!isAudioOn ? 'off' : ''}`}
        onClick={toggleAudio}
        title={isAudioOn ? "Mute" : "Unmute"}
      >
        {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      <button 
        className={`btn btn-icon btn-control ${!isVideoOn ? 'off' : ''}`}
        onClick={toggleVideo}
        title={isVideoOn ? "Turn off camera" : "Turn on camera"}
      >
        {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
      </button>

      <button 
        className="btn btn-icon btn-control"
        onClick={onCapturePhoto}
        title="Capture Photo"
      >
        <Camera size={20} />
      </button>

      <button 
        className={`btn btn-icon btn-control ${isScreenSharing ? 'active' : ''}`}
        onClick={onToggleScreenShare}
        title="Share Screen"
        style={{ background: isScreenSharing ? 'var(--primary)' : '' }}
      >
        <MonitorUp size={20} />
      </button>

      <button 
        className={`btn btn-icon btn-control ${isChatOpen ? 'active' : ''}`}
        onClick={toggleChat}
        title="Chat"
        style={{ background: isChatOpen ? 'var(--primary)' : '' }}
      >
        <MessageCircle size={20} />
      </button>

      <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 10px' }}></div>

      <button 
        className="btn btn-icon btn-danger"
        onClick={onLeave}
        title="Leave Meeting"
      >
        <PhoneOff size={20} />
      </button>
    </div>
  );
};

export default VideoControls;
