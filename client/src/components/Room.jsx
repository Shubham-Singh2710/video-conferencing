import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import VideoControls from './VideoControls';
import Chat from './Chat';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
};

const Room = ({ socket, user, onLeave }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // userId -> MediaStream
  const [messages, setMessages] = useState([]);
  
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peersRef = useRef({}); // userId -> RTCPeerConnection
  const localStreamRef = useRef(null); 

  useEffect(() => {
    if (!socket || !user) {
      if (!user) navigate('/login');
      return;
    }

    // Get User Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        localStreamRef.current = stream;
        
        socket.emit('join-room', roomId);

        // Setup Socket Listeners
        socket.on('all-users', (users) => {
          users.forEach(userId => {
            const peer = createPeer(userId, socket.id, stream);
            peersRef.current[userId] = peer;
          });
        });

        socket.on('user-connected', (userId) => {
          const peer = createPeer(userId, socket.id, stream);
          peersRef.current[userId] = peer;
        });

        socket.on('offer', handleReceiveOffer);
        socket.on('answer', handleReceiveAnswer);
        socket.on('ice-candidate', handleReceiveIceCandidate);
        
        socket.on('user-disconnected', (userId) => {
          if (peersRef.current[userId]) {
            peersRef.current[userId].close();
            delete peersRef.current[userId];
            setRemoteStreams(prev => {
              const copy = { ...prev };
              delete copy[userId];
              return copy;
            });
          }
        });

        socket.on('chat-message', (payload) => {
          setMessages(prev => [...prev, { 
            text: payload.text, 
            fileUrl: payload.fileUrl,
            fileName: payload.fileName,
            fileType: payload.fileType,
            sender: payload.senderName || `User-${payload.senderId.substring(0,4)}`, 
            isSelf: false 
          }]);
        });
      })
      .catch((err) => {
        console.error('Failed to get local stream', err);
        alert('Could not access camera/microphone');
      });

    return () => {
      // Cleanup UI scope limits
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.keys(peersRef.current).forEach(userId => {
        peersRef.current[userId].close();
      });
      if (socket) {
        socket.off('all-users');
        socket.off('user-connected');
        socket.off('offer');
        socket.off('answer');
        socket.off('ice-candidate');
        socket.off('user-disconnected');
        socket.off('chat-message');
      }
    };
    // eslint-disable-next-line
  }, [roomId, socket, user]);

  // Peer Connection Logic
  const createPeer = (userToSignal, callerID, stream) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);
    
    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: userToSignal,
          candidate: event.candidate
        });
      }
    };

    peer.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [userToSignal]: event.streams[0]
      }));
    };

    peer.createOffer()
      .then(offer => {
        return peer.setLocalDescription(offer);
      })
      .then(() => {
        socket.emit('offer', {
          target: userToSignal,
          caller: callerID,
          offer: peer.localDescription
        });
      })
      .catch(err => console.error('Error creating offer', err));

    return peer;
  };

  const addPeer = (incomingSignal, callerID, stream) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    stream.getTracks().forEach(track => {
      peer.addTrack(track, stream);
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          target: callerID,
          candidate: event.candidate
        });
      }
    };

    peer.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [callerID]: event.streams[0]
      }));
    };

    peer.setRemoteDescription(new RTCSessionDescription(incomingSignal))
      .then(() => peer.createAnswer())
      .then(answer => {
        return peer.setLocalDescription(answer);
      })
      .then(() => {
        socket.emit('answer', {
          target: callerID,
          answer: peer.localDescription
        });
      })
      .catch(err => console.error('Error creating answer', err));

    return peer;
  };

  const handleReceiveOffer = ({ caller, offer }) => {
    const peer = addPeer(offer, caller, localStreamRef.current);
    peersRef.current[caller] = peer;
  };

  const handleReceiveAnswer = ({ target, answer }) => {
    const peer = peersRef.current[target];
    if (peer) {
      peer.setRemoteDescription(new RTCSessionDescription(answer))
        .catch(err => console.error('Error setting remote description from answer', err));
    }
  };

  const handleReceiveIceCandidate = ({ sender, candidate }) => {
    const peer = peersRef.current[sender];
    if (peer && candidate) {
      peer.addIceCandidate(new RTCIceCandidate(candidate))
        .catch(err => console.error('Error adding ice candidate', err));
    }
  };

  // Controls Logic
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const sendChatMessage = (payload) => {
    const fullPayload = {
      roomId,
      text: payload.text,
      fileUrl: payload.fileUrl,
      fileName: payload.fileName,
      fileType: payload.fileType,
      senderName: user.username
    };
    socket.emit('chat-message', fullPayload);
    setMessages(prev => [...prev, { ...fullPayload, sender: user.username, isSelf: true }]);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCapturePhoto = () => {
    if (!localStreamRef.current) return;
    const video = document.createElement('video');
    video.srcObject = localStreamRef.current;
    video.muted = true;
    video.playsInline = true;
    
    video.onloadedmetadata = () => {
        video.play().then(() => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const base64Img = canvas.toDataURL('image/jpeg', 0.8);
          setPhotoPreview(base64Img);
          
          video.pause();
          video.srcObject = null;
        }).catch(err => console.error("Error capturing frame", err));
    };
  };

  const revertToWebcam = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = userStream.getVideoTracks()[0];
      
      Object.values(peersRef.current).forEach(peer => {
        const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack).catch(err => console.error("Replace track err", err));
        }
      });

      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      const newLocalStream = new MediaStream();
      newLocalStream.addTrack(videoTrack);
      if (audioTrack) newLocalStream.addTrack(audioTrack);
      
      localStreamRef.current = newLocalStream;
      setLocalStream(newLocalStream);
      setIsScreenSharing(false);
    } catch (error) {
      console.error("Failed to revert to webcam", error);
    }
  };

  const handleScreenShareToggle = async () => {
    if (isScreenSharing) {
      revertToWebcam();
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        Object.values(peersRef.current).forEach(peer => {
          const sender = peer.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack).catch(err => console.error(err));
          }
        });

        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        const newLocalStream = new MediaStream();
        newLocalStream.addTrack(screenTrack);
        if (audioTrack) newLocalStream.addTrack(audioTrack);

        localStreamRef.current = newLocalStream;
        setLocalStream(newLocalStream);
        setIsScreenSharing(true);

        screenTrack.onended = () => {
          revertToWebcam();
        };
      } catch (err) {
        console.error("Screen sharing failed", err);
      }
    }
  };

  const sendPhoto = () => {
    if (!photoPreview) return;
    const fullPayload = {
      roomId,
      text: `Captured a live photo 📸`,
      fileUrl: photoPreview,
      fileName: `webcam_snap_${Date.now()}.jpg`,
      fileType: 'image/jpeg',
      senderName: user.username
    };
    socket.emit('chat-message', fullPayload);
    setMessages(prev => [...prev, { ...fullPayload, sender: user.username, isSelf: true }]);
    setPhotoPreview(null);
    setIsChatOpen(true);
  };

  const streamCount = 1 + Object.keys(remoteStreams).length;

  return (
    <div className="room-layout fade-in">
      {/* Room Header Overlay */}
      <div className="room-header glass-panel fade-in">
        <div className="room-id-display">
          <span>Room Code: <strong>{roomId}</strong></span>
          <button className="btn btn-icon btn-control" style={{ width: '32px', height: '32px' }} onClick={copyRoomId} title="Copy Room ID">
            {copied ? <Check size={16} color="var(--primary)" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Video Grid Area */}
      <div className="video-area">
        <div className="video-grid" data-count={streamCount}>
          <VideoPlayer 
            stream={localStream} 
            isLocal={true} 
            name={`${user?.username || 'You'} (You)`} 
            isMuted={!isAudioOn}
          />
          {Object.entries(remoteStreams).map(([peerId, stream]) => (
            <VideoPlayer 
              key={peerId} 
              stream={stream} 
              isLocal={false} 
              name={`User-${peerId.substring(0,4)}`} 
              isMuted={false}
            />
          ))}
        </div>

        <VideoControls 
          isAudioOn={isAudioOn}
          isVideoOn={isVideoOn}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          onLeave={() => navigate('/dashboard')}
          toggleChat={() => setIsChatOpen(!isChatOpen)}
          isChatOpen={isChatOpen}
          onCapturePhoto={handleCapturePhoto}
          onToggleScreenShare={handleScreenShareToggle}
          isScreenSharing={isScreenSharing}
        />
      </div>

      {/* Chat Sidebar Area */}
      <Chat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        messages={messages} 
        sendMessage={sendChatMessage} 
      />

      {/* Photo Preview Modal */}
      {photoPreview && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', 
          justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel fade-in" style={{ padding: '20px', textAlign: 'center', maxWidth: '90%', width: '600px' }}>
            <h3 style={{ marginBottom: '15px' }}>Send Photo?</h3>
            <img src={photoPreview} alt="Capture preview" style={{ width: '100%', borderRadius: '10px', marginBottom: '20px' }} />
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="btn btn-control" onClick={() => setPhotoPreview(null)} style={{ background: 'rgba(255,255,255,0.1)' }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={sendPhoto}>
                Send to Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
