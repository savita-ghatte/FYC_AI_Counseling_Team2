import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, BrainCircuit, GraduationCap, MapPin, ArrowRight, Code } from 'lucide-react';
import { SciFiBackground } from './SciFiBackground';
import { useRef } from 'react';

export const Home = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax effects for UI elements
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Entrance animations
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemFadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 20 } }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050510] text-white selection:bg-cyan-500/30 overflow-x-hidden relative">
      {/* 3D WebGL Background Layer */}
      <SciFiBackground />

      {/* Main Content Layer - must have z-index above canvas */}
      <div className="relative z-10 w-full">
        
        {/* Navigation overlay (Optional if you have a global navbar, this just adds spacing) */}
        <div className="h-24 pointer-events-none" />

        {/* Hero Section */}
        <motion.section 
          style={{ y: yHero, opacity: opacityHero }}
          className="relative pt-12 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between"
        >
          {/* Left Column: Text Content */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="w-full md:w-3/5 text-left z-20"
          >
            <motion.div variants={itemFadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Sparkles className="w-4 h-4" />
              <span className="tracking-widest uppercase text-xs">System Initialization v2.0</span>
            </motion.div>
            
            <motion.h1 variants={itemFadeUp} className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 leading-[1.1]">
              <span className="block text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                Decode Your
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                Future.
              </span>
            </motion.h1>
            
            <motion.p variants={itemFadeUp} className="max-w-xl text-lg md:text-xl text-slate-300 mb-10 leading-relaxed font-light border-l-2 border-cyan-500/50 pl-6 bg-gradient-to-r from-cyan-500/10 to-transparent py-2">
              Navigate the complex engineering admission matrix. 
              Deploy data-driven predictions, intercept scholarship data, and access the 24/7 AI mainframe.
            </motion.p>

            <motion.div variants={itemFadeUp} className="flex flex-col sm:flex-row gap-6">
              <Link
                to="/login"
                className="relative px-8 py-4 bg-cyan-600/20 hover:bg-cyan-500/30 text-cyan-50 border border-cyan-400/50 hover:border-cyan-300 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 group backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Code className="w-5 h-5" />
                Initialize Uplink
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/colleges"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20 rounded-lg font-semibold text-lg transition-all backdrop-blur-md flex items-center justify-center"
              >
                Explore Nodes
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Right Column is left empty for the 3D Hologram to shine through */}
          <div className="hidden md:block w-2/5" />
        </motion.section>

        {/* Features Section */}
        <section className="relative py-32 z-20">
          {/* Subtle gradient overlay to separate sections visually without breaking the 3D background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050510]/80 to-[#050510] pointer-events-none" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500 mb-6">
                System Capabilities
              </h2>
              <p className="text-xl text-cyan-100/60 font-light">
                Advanced algorithms processing historical data to give you the ultimate tactical advantage.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="w-14 h-14 bg-blue-950/50 border border-blue-500/30 rounded-xl flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <BrainCircuit className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">AI Predictor</h3>
                <p className="text-slate-400 leading-relaxed font-light">
                  Input your parameters. Our neural network cross-references years of historical cutoff data to predict your admission probabilities across elite institutes.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="w-14 h-14 bg-cyan-950/50 border border-cyan-500/30 rounded-xl flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <MapPin className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">Node Discovery</h3>
                <p className="text-slate-400 leading-relaxed font-light">
                  Scan the institutional matrix. Filter thousands of colleges by location, infrastructure, and rankings. Monitor admission requirements in real-time.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="w-14 h-14 bg-purple-950/50 border border-purple-500/30 rounded-xl flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <GraduationCap className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-wide">Smart Identity</h3>
                <p className="text-slate-400 leading-relaxed font-light">
                  Compile your digital academic identity once. Automatically synchronize and match with eligible government and private scholarship opportunities.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
