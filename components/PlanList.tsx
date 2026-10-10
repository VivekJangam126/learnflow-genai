import React, { useEffect, useState } from 'react';
import { Plan } from '../types';
import { getUserPlans } from '../services/firebase';
import { useAuth } from '../App';
import { useNavigate } from 'react-router-dom';

export const PlanList: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getUserPlans(user.uid).then(data => {
        setPlans(data);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your plans...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Plans</h2>
        <button
          onClick={() => navigate('/create')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
        >
          + Create New
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">You haven't created any learning plans yet.</p>
          <button
            onClick={() => navigate('/create')}
            className="text-primary-600 hover:underline font-medium"
          >
            Get started with AI →
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => navigate(`/plan/${plan.id}`)}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 line-clamp-2">
                  {plan.title}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{plan.totalWeeks} Weeks</span>
                  <span>{plan.stats.progress}% Done</span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${plan.stats.progress}%` }}
                  />
                </div>
                
                <div className="pt-2 flex items-center text-xs text-gray-400">
                  Created {new Date(plan.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
