import React, { useState } from 'react';
import PixelBlast from '../components/PixelBlast';

const LandingPage = () => {
  const [isMockStrategy, setIsMockStrategy] = useState(false);
  const [showMockLogin, setShowMockLogin] = useState(false);
  const [showStrategyConfirm, setShowStrategyConfirm] = useState(false);

  const handleGoogleLogin = () => {
    if (isMockStrategy) {
      setShowMockLogin(true);
      return;
    }
    // Redirect to Django Google OAuth endpoint
    window.location.href = 'http://localhost:8000/api/auth/google/'; 
  };

  const toggleStrategy = () => {
    if (!isMockStrategy) {
      setShowStrategyConfirm(true);
    } else {
      setIsMockStrategy(false);
    }
  };

  const confirmStrategySwitch = () => {
    setIsMockStrategy(true);
    setShowStrategyConfirm(false);
  };

  const mockLogin = async (email) => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/mock-login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        // Redirect just like Google callback would
        window.location.href = `http://localhost:7999/library?token=${data.token}`;
      } else {
        alert('Mock login failed. Ensure backend is running.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error during mock login.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center w-full px-4 pointer-events-none">
        <nav className="flex items-center justify-between w-full max-w-5xl px-5 py-2.5 bg-[#171717]/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] pointer-events-auto transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {/* Music Logo */}
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            <span className="font-extrabold text-white text-[19px] tracking-tight">Chithara</span>
            
            {/* Secret Strategy Toggle */}
            <span 
              onClick={toggleStrategy}
              className={`ml-2 text-[10px] font-mono cursor-pointer px-1.5 py-0.5 rounded ${isMockStrategy ? 'bg-amber-500/20 text-amber-400' : 'text-white/20 hover:text-white/40'}`}
              title="Click to toggle Generation Strategy"
            >
              Strategy: {isMockStrategy ? 'MOCK' : 'SUNO'}
            </span>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6 text-[13px] text-gray-400 font-medium">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#about" className="hover:text-white transition-colors">About</a>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="bg-white text-black px-4 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-colors text-[13px]"
            >
              Sign up
            </button>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[85vh] flex flex-col items-center justify-center border-b border-white/5">
        {/* PixelBlast Background */}
        <div className="absolute inset-0 z-0">
          <PixelBlast
            variant="square"
            pixelSize={5}
            color="#10b981"
            patternScale={2.5}
            patternDensity={0.8}
            pixelSizeJitter={0.1}
            enableRipples={true}
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            speed={0.4}
            edgeFade={0.3}
            transparent={true}
            noiseAmount={0.02}
          />
        </div>

        {/* Vertical Gradient Mask to make text pop more against pixels */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 mt-16 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-[#161616]/80 backdrop-blur-sm mb-8 scale-90 sm:scale-100">
            <span className="bg-white text-black px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide">NEW</span>
            <span className="text-sm font-medium text-gray-300">Just shipped AI Music v1.0</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tight text-white mb-8 leading-[1.05]">
            Bring your imagination to<br />life! Generate music.
          </h1>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <button
              onClick={handleGoogleLogin}
              className="bg-white text-black px-8 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2 text-lg shadow-[0_0_30px_rgba(255,255,255,0.15)]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Login with Google
            </button>
            <a href="#about" className="bg-[#1a1a1a] text-white border border-white/10 px-8 py-3.5 rounded-xl font-bold hover:bg-[#252525] transition-colors text-lg">
              Learn more
            </a>
          </div>
        </div>

        {/* Mock Login Modal */}
        {showMockLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-white/10 p-8 rounded-2xl shadow-2xl max-w-sm w-full relative">
              <button 
                onClick={() => setShowMockLogin(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <h3 className="text-2xl font-bold text-white mb-2">Mock Login</h3>
              <p className="text-gray-400 text-sm mb-6">Select a test account to bypass Google OAuth and access the Mock Strategy generator.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => mockLogin('special1@chitharamock.com')}
                  className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 py-3 rounded-xl font-bold hover:bg-emerald-500/20 transition-colors"
                >
                  Login as special1@chitharamock.com
                </button>
                <button 
                  onClick={() => mockLogin('special2@chitharamock.com')}
                  className="w-full bg-blue-500/10 border border-blue-500/30 text-blue-400 py-3 rounded-xl font-bold hover:bg-blue-500/20 transition-colors"
                >
                  Login as special2@chitharamock.com
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Mock Strategy Confirmation Modal */}
        {showStrategyConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111] border border-amber-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] max-w-sm w-full relative">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Switch Strategy?</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                You are about to switch to the <strong className="text-amber-500">Mock Generation Strategy</strong>. This mode will bypass the real Suno API and use dummy data from the database. It is intended for testing and grading purposes only.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowStrategyConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmStrategySwitch}
                  className="flex-1 bg-amber-500 text-black px-4 py-2.5 rounded-xl font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
                >
                  Confirm Switch
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* About Section */}
      <section id="about" className="max-w-6xl mx-auto px-6 py-24 border-b border-white/5">
        <h2 className="text-3xl font-bold mb-10">About Chithara</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Making music shouldn't require decades of theory or an expensive studio. We built Chithara to bridge the gap between that sound in your head and the final track in your hands.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              Whether you're a content creator looking for the perfect background score, or just someone feeling inspired, simply type what you want to hear. The AI handles the orchestration and mixing—you just focus on the vibe.
            </p>
          </div>
          <div className="h-64 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-black border border-white/5 flex items-center justify-center p-8 relative overflow-hidden">
            {/* Small decorative PixelBlast for the about section */}
            <div className="absolute inset-0 opacity-30">
              <PixelBlast
                variant="circle"
                pixelSize={8}
                color="#10b981"
                patternScale={4}
                patternDensity={0.5}
                speed={0.2}
                transparent={true}
              />
            </div>
            <div className="relative z-10 font-bold text-2xl tracking-tighter text-emerald-500/80">
              Your Imagination + AI
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 mb-12">
        <h2 className="text-3xl font-bold mb-12">Core Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-[#111111] border border-white/5 hover:border-emerald-500/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Generation</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Instantly generate music from custom text inputs. Turn your prompts into expressive, emotional melodies seamlessly.</p>
          </div>

          <div className="p-8 rounded-2xl bg-[#111111] border border-white/5 hover:border-emerald-500/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Music Preview</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Listen to your generated soundtracks right within the browser utilizing our customized, high-quality audio player.</p>
          </div>

          <div className="p-8 rounded-2xl bg-[#111111] border border-white/5 hover:border-emerald-500/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Library Management</h3>
            <p className="text-gray-400 text-sm leading-relaxed">Organize your creations into a personal library. Download tracks locally, or share them via controlled access links.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-white/5 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Chithara AI Music Generator. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
