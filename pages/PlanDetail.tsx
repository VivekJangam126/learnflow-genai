import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPlanById, updatePlanProgress } from '../services/firebase';
import { Plan, Task, Week } from '../types';
import { AIAssistant } from '../components/AIAssistant';

export const PlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPlan(id);
    }
  }, [id]);

  const loadPlan = async (planId: string) => {
    const data = await getPlanById(planId);
    if (data) {
      setPlan(data);
      // Expand current week based on completion, or first week
      const currentWeek = data.weeks.find(w => w.tasks.some(t => t.status !== 'done')) || data.weeks[0];
      setExpandedWeekId(currentWeek?.id);
    }
    setLoading(false);
  };

  const handleTaskToggle = async (weekIndex: number, taskIndex: number) => {
    if (!plan) return;

    const newPlan = { ...plan };
    const task = newPlan.weeks[weekIndex].tasks[taskIndex];
    
    // Toggle status
    const newStatus = task.status === 'done' ? 'not_started' : 'done';
    task.status = newStatus;
    if (newStatus === 'done') task.completedAt = new Date().toISOString();
    else delete task.completedAt;

    // Recalculate stats
    const allTasks = newPlan.weeks.flatMap(w => w.tasks);
    const completedCount = allTasks.filter(t => t.status === 'done').length;
    
    newPlan.stats.completedTasks = completedCount;
    newPlan.stats.progress = Math.round((completedCount / newPlan.stats.totalTasks) * 100);

    setPlan(newPlan); // Optimistic update
    await updatePlanProgress(plan.id, { 
      weeks: newPlan.weeks,
      stats: newPlan.stats 
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading plan...</div>;
  if (!plan) return <div className="p-8 text-center text-red-500">Plan not found.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content: Weeks & Tasks */}
      <div className="flex-1 space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{plan.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span>{plan.totalWeeks} Weeks</span>
            <span>•</span>
            <span>{plan.stats.completedTasks} / {plan.stats.totalTasks} Tasks</span>
          </div>
          
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-primary-600">
                  {plan.stats.progress}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-100">
              <div style={{ width: `${plan.stats.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"></div>
            </div>
          </div>
        </div>

        {/* Today's Widget (Simple Suggestion) */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-md">
          <h3 className="font-semibold text-lg mb-1">🎯 Focus for Today</h3>
          <p className="text-indigo-100 text-sm mb-4">
            Based on your progress, here is what you should tackle next:
          </p>
          {(() => {
             const nextTask = plan.weeks
               .flatMap(w => w.tasks)
               .find(t => t.status !== 'done');
             
             return nextTask ? (
               <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 flex items-center justify-between">
                 <div>
                   <span className="text-xs font-bold uppercase tracking-wider opacity-70 block mb-1">{nextTask.type} • {nextTask.estMinutes} min</span>
                   <span className="font-medium">{nextTask.title}</span>
                 </div>
                 <button className="px-3 py-1 bg-white text-indigo-600 text-xs font-bold rounded shadow-sm hover:bg-gray-50">
                   Start
                 </button>
               </div>
             ) : (
               <div className="text-indigo-100 italic">All tasks completed! Great job.</div>
             );
          })()}
        </div>

        {/* Weeks List */}
        <div className="space-y-4">
          {plan.weeks.map((week, wIndex) => {
            const isExpanded = expandedWeekId === week.id;
            const completedInWeek = week.tasks.filter(t => t.status === 'done').length;
            const totalInWeek = week.tasks.length;
            const weekProgress = Math.round((completedInWeek / totalInWeek) * 100) || 0;

            return (
              <div key={week.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200">
                <div 
                  onClick={() => setExpandedWeekId(isExpanded ? null : week.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${isExpanded ? 'bg-gray-50 border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                       weekProgress === 100 ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-600'
                     }`}>
                       W{week.weekNumber}
                     </div>
                     <div>
                       <h4 className="font-semibold text-gray-900">{week.theme}</h4>
                       <p className="text-xs text-gray-500">{week.targetHours} hours • {weekProgress}% Complete</p>
                     </div>
                  </div>
                  <div className="text-gray-400 transform transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-3 bg-white">
                    {week.tasks.map((task, tIndex) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 group">
                        <div className="pt-0.5">
                          <input 
                            type="checkbox"
                            checked={task.status === 'done'}
                            onChange={() => handleTaskToggle(wIndex, tIndex)}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300 cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {task.title}
                          </div>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-medium border
                              ${task.type === 'lab' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                task.type === 'reading' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                              {task.type}
                            </span>
                            <span className="text-[10px] text-gray-400 py-0.5 flex items-center">
                              ⏱ {task.estMinutes}m
                            </span>
                            {task.resources && task.resources.length > 0 && (
                              <a 
                                href={task.resources[0].url} 
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-primary-600 hover:underline py-0.5 flex items-center gap-1"
                              >
                                🔗 Resource
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar: AI Assistant */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-8">
           <AIAssistant plan={plan} />
        </div>
      </div>
    </div>
  );
};
