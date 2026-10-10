import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { generatePlanFromSyllabus } from '../services/geminiService';
import { savePlan } from '../services/firebase';
import { PlanSettings, Plan } from '../types';

const INITIAL_SETTINGS: PlanSettings = {
  hoursPerWeek: 10,
  availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  intensity: 'medium',
  handsOnVsReading: 50,
};

export const CreatePlan: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [syllabus, setSyllabus] = useState('');
  const [title, setTitle] = useState('');
  const [settings, setSettings] = useState<PlanSettings>(INITIAL_SETTINGS);

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const generatedData = await generatePlanFromSyllabus(syllabus, settings, title);
      
      const newPlan: Plan = {
        ...generatedData as Plan,
        id: crypto.randomUUID(),
        userId: user.uid,
        createdAt: new Date().toISOString(),
      };

      await savePlan(newPlan);
      navigate(`/plan/${newPlan.id}`);
    } catch (error) {
      alert("Failed to generate plan. Please try again or check your API key.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Learning Plan</h1>
        <p className="text-gray-500">Turn your syllabus into an actionable schedule with AI.</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 
              ${step >= s ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300 text-gray-400'}`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold">1. Paste Syllabus</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Title</label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Advanced Bug Bounty Hunter"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Syllabus Content</label>
              <textarea
                value={syllabus}
                onChange={e => setSyllabus(e.target.value)}
                placeholder="Paste course outline, topics, or module list here..."
                className="w-full h-64 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
              />
            </div>
            <div className="flex justify-end">
              <button 
                disabled={!syllabus || !title}
                onClick={() => setStep(2)}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold">2. Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hours per Week</label>
                <input 
                  type="number" 
                  value={settings.hoursPerWeek}
                  onChange={e => setSettings({...settings, hoursPerWeek: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg p-3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
                <select 
                  value={settings.intensity}
                  onChange={e => setSettings({...settings, intensity: e.target.value as any})}
                  className="w-full border border-gray-300 rounded-lg p-3"
                >
                  <option value="low">Low (Casual)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="high">High (Bootcamp style)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      settings.availableDays.includes(day)
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                 <label className="text-sm font-medium text-gray-700">Hands-on vs Reading</label>
                 <span className="text-sm text-gray-500">{settings.handsOnVsReading}% Hands-on</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={settings.handsOnVsReading}
                onChange={e => setSettings({...settings, handsOnVsReading: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Mostly Theory</span>
                <span>Balanced</span>
                <span>Mostly Practice</span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => setStep(1)}
                className="text-gray-600 font-medium hover:text-gray-900"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700"
              >
                Review & Generate
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center animate-fade-in">
             {!loading ? (
               <>
                 <div className="py-8">
                   <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Build Your Plan?</h3>
                   <p className="text-gray-500">
                     We will generate a {settings.hoursPerWeek}h/week plan for "{title}" based on your schedule.
                   </p>
                 </div>
                 <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit Settings
                    </button>
                    <button 
                      onClick={handleGenerate}
                      className="px-8 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 shadow-lg shadow-primary-500/30"
                    >
                      ✨ Generate with AI
                    </button>
                 </div>
               </>
             ) : (
               <div className="py-16 flex flex-col items-center justify-center">
                 <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                 <h4 className="text-lg font-semibold text-gray-900">Crafting your curriculum...</h4>
                 <p className="text-sm text-gray-500 mt-2">This usually takes about 10-15 seconds.</p>
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
};
