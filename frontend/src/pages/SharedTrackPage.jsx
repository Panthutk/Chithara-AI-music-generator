import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AudioPlayer from '../components/AudioPlayer';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

const SharedTrackPage = () => {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('chithara_token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const decodedJson = atob(payloadBase64);
        const decodedData = JSON.parse(decodedJson);
        setUser(decodedData);
      } catch (error) {
        // Invalid token
      }
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTrack = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/tracks/${trackId}/`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Track not found.');
          } else {
            setError('Failed to load track.');
          }
          setLoading(false);
          return;
        }

        const data = await res.json();
        
        // Authorization check
        if (data.visibility !== 'PUBLIC' && data.user !== user.userId) {
          setError('This track is private.');
        } else {
          setTrack(data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrack();
  }, [trackId, user]);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#050505] text-white flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <GraphicEqIcon className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Listen to Shared Track</h1>
        <p className="text-gray-400 mb-8 max-w-md text-center">You must be logged in to listen to tracks shared by other users.</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-8 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4">Oops!</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <button onClick={() => navigate('/library')} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors">
          Go to My Library
        </button>
      </div>
    );
  }

  if (!track) {
    return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#050505] text-white flex flex-col items-center justify-center p-6 pb-32">
      <div className="w-full max-w-xl">
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="w-48 h-48 bg-[#222] rounded-2xl overflow-hidden mb-8 shadow-2xl relative z-10 border border-white/5">
            {track.image_url ? (
              <img src={track.image_url} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-900/20">
                <GraphicEqIcon className="w-16 h-16 text-emerald-500/50" />
              </div>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2 relative z-10">{track.title || "Untitled Track"}</h1>
          <p className="text-emerald-400 font-medium mb-6 relative z-10">by {track.user_name || "Unknown Artist"}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10 mt-4">
            <button 
              onClick={() => navigate('/library')} 
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors border border-white/10"
            >
              Back to Library
            </button>
          </div>
        </div>
      </div>
      
      {/* Audio Player at bottom */}
      <AudioPlayer 
        currentTrack={track} 
        onPlayNext={() => {}} 
        onPlayPrevious={() => {}} 
        hasNext={false}
        hasPrev={false}
      />
    </div>
  );
};

export default SharedTrackPage;
