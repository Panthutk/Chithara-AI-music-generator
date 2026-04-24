import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';

const GenerationPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('Classical');
  const [vocalGender, setVocalGender] = useState('m');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    let token = localStorage.getItem('chithara_token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const decodedJson = atob(payloadBase64);
        const decodedData = JSON.parse(decodedJson);
        setUser(decodedData);

        // Verify session backend
        fetch('http://localhost:8000/api/auth/verify-session/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })
        .then(res => res.json())
        .then(data => {
          if (data.valid === false) {
             localStorage.removeItem('chithara_token');
             navigate('/');
          }
        }).catch(console.error);

      } catch (error) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/api/generate-music/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.userId, // JWT payload uses userId
          prompt: prompt,
          title: title,
          style: style,
          negative: 'none', // Set permanently as requested
          vocalGender: vocalGender
        }),
      });

      if (response.ok) {
        navigate('/library');
      } else {
        const errData = await response.json();
        setErrorMessage('Generation failed: ' + (errData.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An error occurred submitting the generation request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#050505] text-white font-sans overflow-y-auto">
      {/* Top Navbar */}
      <nav className="h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 flex items-center px-6 sticky top-0 z-50">
        <button 
          onClick={() => navigate('/library')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowBackIcon className="w-5 h-5" />
          <span className="font-medium text-sm">Back to Library</span>
        </button>
      </nav>

      {/* Main Form Area */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10 text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <GraphicEqIcon className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Create New Track</h1>
          <p className="text-gray-400 text-lg">Describe the music you want to hear, and our AI will bring it to life.</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/5 p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium relative z-10">
              {errorMessage}
            </div>
          )}

          <div className="space-y-6 relative z-10">
            {/* Title field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Track Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Neon Midnight Drive"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>

            {/* Prompt field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Music Description (Prompt)</label>
              <textarea
                required
                rows="4"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A high energy synthwave track with heavy bass drops and a retro futuristic feel..."
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
              ></textarea>
            </div>

            {/* Style and Gender Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Style / Genre</label>
                <input
                  type="text"
                  required
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  placeholder="e.g. Classical, Synthwave, Pop"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Vocal Gender</label>
                <div className="grid grid-cols-3 gap-3 h-[50px]">
                  <button
                    type="button"
                    onClick={() => setVocalGender('m')}
                    className={`rounded-xl border flex items-center justify-center text-sm font-semibold transition-colors ${
                      vocalGender === 'm' 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setVocalGender('f')}
                    className={`rounded-xl border flex items-center justify-center text-sm font-semibold transition-colors ${
                      vocalGender === 'f' 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    Female
                  </button>
                  <button
                    type="button"
                    onClick={() => setVocalGender('none')}
                    className={`rounded-xl border flex items-center justify-center text-sm font-semibold transition-colors ${
                      vocalGender === 'none' 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'bg-[#1a1a1a] border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    No Singer
                  </button>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="pt-6 border-t border-white/5 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-black py-4 rounded-xl font-bold text-lg hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <AutoAwesomeIcon className="w-5 h-5" />
                    Generate Soundtrack
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
};

export default GenerationPage;
