import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const MusicLibrary = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let token = searchParams.get('token');
    
    if (token) {
      // Save it and clear from URL
      localStorage.setItem('chithara_token', token);
      navigate('/library', { replace: true });
    } else {
      // Try to load existing
      token = localStorage.getItem('chithara_token');
    }

    if (token) {
      try {
        // Decode JWT payload (Header.Payload.Signature)
        const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const decodedJson = atob(payloadBase64);
        const decodedData = JSON.parse(decodedJson);
        setUser(decodedData);
      } catch (error) {
        console.error("Failed to parse token", error);
        localStorage.removeItem('chithara_token');
        navigate('/');
      }
    } else {
      // Not authenticated
      navigate('/');
    }
  }, [searchParams, navigate]);

  if (!user) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden p-8">
      <div className="max-w-4xl mx-auto mt-12 bg-[#111111] border border-white/5 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-emerald-400">Chithara Music Library</h1>
        
        <div className="flex items-center gap-6 p-6 bg-[#171717] rounded-xl border border-white/10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-300 flex items-center justify-center text-xl font-bold text-black uppercase shadow-lg shadow-emerald-500/20">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">{user.name}</h2>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>
        
        <div className="mt-8 text-gray-500 text-sm">
          <p>Additional library management features will be implemented here later.</p>
        </div>
      </div>
    </div>
  );
};

export default MusicLibrary;
