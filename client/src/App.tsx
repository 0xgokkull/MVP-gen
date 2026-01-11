import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Users, ArrowRight, CheckCircle, Clock, Lightbulb, Rocket, Zap, Target } from 'lucide-react';
import axios from 'axios';

// Interfaces for response data
interface MVPData {
  overview: any;
  existing_solutions: any;
  unique_selling_point: any;
  best_practices: any;
  implementation_steps: any;
  timeline_days: number;
  pitch_content: any;
  tasks: any[];
}

interface Teammate {
  name: string;
  email: string;
}

const App = () => {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MVPData | null>(null);
  const [team, setTeam] = useState<Teammate[]>([{ name: '', email: '' }]);
  const [emailStatus, setEmailStatus] = useState<string>('');

  const generateMVP = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/generate', { idea });
      setData(response.data);
    } catch (error) {
      console.error("Error generating MVP:", error);
      alert("Failed to generate MVP. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = (index: number, field: keyof Teammate, value: string) => {
    const newTeam = [...team];
    newTeam[index][field] = value;
    setTeam(newTeam);
  };

  const addTeammate = () => {
    setTeam([...team, { name: '', email: '' }]);
  };

  const assignCapabilities = () => {
    // Simple round-robin assignment for demo
    if (!data || !data.tasks) return [];
    
    return data.tasks.map((task: any, i) => {
      const teammate = team[i % team.length];
      const taskDescription = typeof task === 'string' 
        ? task 
        : (task.task || task.description || JSON.stringify(task));
      return { ...teammate, task: taskDescription };
    });
  };

  const sendAssignments = async () => {
    const assignments = assignCapabilities();
    const validAssignments = assignments.filter(a => a.email && a.name);
    
    if (validAssignments.length === 0) {
      alert("Please add at least one teammate with name and email.");
      return;
    }

    setEmailStatus('sending');
    try {
      await axios.post('http://localhost:5001/api/send-assignments', {
        assignments: validAssignments,
        projectTitle: idea
      });
      setEmailStatus('sent');
    } catch (error) {
      console.error(error);
      setEmailStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 font-sans p-6 md:p-12 overflow-x-hidden relative">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <header className="max-w-6xl mx-auto mb-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">MVP Gen</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {!data && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Turn your <span className="gradient-text">spark</span> into a <br/>
              <span className="text-white">blazing reality.</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
              Describe your idea in a pinch. We'll generate the blueprint, strategy, and even assign tasks to your team.
            </p>

            <div className="w-full max-w-3xl relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <div className="relative flex glass-panel rounded-2xl p-2 items-center">
                <input 
                  type="text" 
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="e.g. A social network for house plants..."
                  className="w-full bg-transparent border-none outline-none text-xl p-4 text-white placeholder-slate-500"
                  onKeyDown={(e) => e.key === 'Enter' && generateMVP()}
                />
                <button 
                  onClick={generateMVP}
                  className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-white/10"
                >
                  Generate <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="w-24 h-24 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-medium text-slate-300 animate-pulse">Consulting the digital oracle...</h2>
          </div>
        )}

        {data && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
             <div className="text-center mb-16">
              <div className="text-4xl font-bold mb-4">
                {typeof data.overview === 'string' 
                  ? data.overview 
                  : (data.overview.title || data.overview.description || "Project Overview")}
              </div>
              {typeof data.overview === 'object' && data.overview.description && data.overview.header && (
                 <p className="text-slate-400 mb-4 max-w-2xl mx-auto">{data.overview.description}</p>
              )}
              <div className="flex gap-4 justify-center text-slate-400">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>~{data.timeline_days} Days Build</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Existing Solutions" icon={<Users className="text-blue-400" />}>
                {data.existing_solutions}
              </Card>
              <Card title="Unique Selling Point" icon={<Zap className="text-yellow-400" />}>
                {data.unique_selling_point}
              </Card>
              <Card title="How to Make it Best" icon={<Target className="text-red-400" />}>
                {data.best_practices}
              </Card>
              <Card title="Implementation Steps" icon={<Rocket className="text-purple-400" />}>
                {data.implementation_steps}
              </Card>
            </div>

            <div className="glass-panel p-8 rounded-3xl border-indigo-500/20">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Lightbulb className="w-6 h-6 text-yellow-500" /> 
                Pitch Content
              </h3>
              {typeof data.pitch_content === 'string' ? (
                <p className="text-lg leading-relaxed text-slate-300 italic">"{data.pitch_content}"</p>
              ) : (
                <div className="space-y-4">
                   {data.pitch_content.title && <h4 className="text-xl font-bold text-white">{data.pitch_content.title}</h4>}
                   {data.pitch_content.tagline && <p className="text-lg text-indigo-300 italic">"{data.pitch_content.tagline}"</p>}
                   {data.pitch_content.key_points && Array.isArray(data.pitch_content.key_points) && (
                     <ul className="list-disc list-inside space-y-2">
                       {data.pitch_content.key_points.map((point: any, idx: number) => (
                         <li key={idx} className="text-slate-400">{typeof point === 'string' ? point : JSON.stringify(point)}</li>
                       ))}
                     </ul>
                   )}
                   {!data.pitch_content.title && !data.pitch_content.tagline && (
                      <pre className="whitespace-pre-wrap text-slate-400 font-sans">{JSON.stringify(data.pitch_content, null, 2)}</pre>
                   )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-12">
              <h3 className="text-3xl font-bold mb-8 text-center">Team Assignment</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-slate-300 mb-4">Add Project Teammates</h4>
                  {team.map((member, idx) => (
                    <div key={idx} className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="Name"
                        value={member.name}
                        onChange={(e) => handleTeamChange(idx, 'name', e.target.value)}
                        className="glass-input flex-1 px-4 py-3 rounded-xl text-white placeholder-slate-600"
                      />
                      <input 
                        type="email" 
                        placeholder="Email"
                        value={member.email}
                        onChange={(e) => handleTeamChange(idx, 'email', e.target.value)}
                        className="glass-input flex-1 px-4 py-3 rounded-xl text-white placeholder-slate-600"
                      />
                    </div>
                  ))}
                  <button 
                    onClick={addTeammate}
                    className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-2"
                  >
                    + Add another teammate
                  </button>
                </div>

                <div className="glass-panel p-8 rounded-2xl">
                  <h4 className="text-xl font-semibold text-slate-300 mb-6">Task Distribution Preview</h4>
                  <ul className="space-y-4 mb-8">
                     {assignCapabilities().slice(0, 5).map((assign, i) => (
                       <li key={i} className="text-sm text-slate-400 flex gap-3 items-start">
                         <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-xs font-bold text-slate-500">
                           {i + 1}
                         </div>
                         <span>
                           <strong className="text-indigo-300">{assign.name || 'Unhired'}</strong>: {assign.task}
                         </span>
                       </li>
                     ))}
                     {data.tasks.length > 5 && <li className="text-slate-600 italic">...and {data.tasks.length - 5} more tasks</li>}
                  </ul>

                  <button 
                    onClick={sendAssignments}
                    disabled={emailStatus === 'sending' || emailStatus === 'sent'}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                      ${emailStatus === 'sent' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-white text-slate-900 hover:bg-slate-200'
                      }`}
                  >
                    {emailStatus === 'sending' && <span className="animate-spin">⌛</span>}
                    {emailStatus === 'sent' && <CheckCircle className="w-5 h-5" />}
                    {emailStatus === 'sent' ? 'Assignments Sent!' : 'Split Work & Send Emails'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

// Flexible interface since AI structure varies
interface MVPData {
  overview: any;
  existing_solutions: any;
  unique_selling_point: any;
  best_practices: any;
  implementation_steps: any;
  timeline_days: number;
  pitch_content: string;
  tasks: string[];
}

// ... (keep middle content same, just updating interface and Card below)

const Card = ({ title, icon, children }: { title: string, icon: any, children: any }) => {
  const renderContent = (content: any): React.ReactNode => {
    if (typeof content === 'string' || typeof content === 'number') return content;
    
    if (Array.isArray(content)) {
      return (
        <ul className="list-disc list-inside space-y-2 mt-2">
          {content.map((item, i) => (
            <li key={i} className="text-slate-300">
              {renderContent(item)}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof content === 'object' && content !== null) {
      return (
        <div className="space-y-3 mt-2">
          {Object.entries(content).map(([key, value]) => (
            <div key={key} className="pl-3 border-l-2 border-slate-700/50">
              <span className="text-indigo-400 font-semibold uppercase text-xs tracking-wider mb-1 block">
                {key.replace(/_/g, ' ')}
              </span>
              <div className="text-slate-300">
                {renderContent(value)}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    return JSON.stringify(content);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl hover:border-indigo-500/30 transition-colors">
      <div className="flex items-center gap-3 mb-4 border-b border-slate-800/50 pb-4">
        <div className="p-2 rounded-lg bg-slate-800/50">
          {icon}
        </div>
        <h3 className="font-semibold text-lg text-slate-200">{title}</h3>
      </div>
      <div className="text-slate-400 leading-relaxed text-sm whitespace-pre-wrap">
        {renderContent(children)}
      </div>
    </div>
  );
};

export default App;
