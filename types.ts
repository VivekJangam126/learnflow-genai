export interface Task {
  id: string;
  title: string;
  type: 'reading' | 'lab' | 'video' | 'notes' | 'review';
  estMinutes: number;
  status: 'not_started' | 'in_progress' | 'done';
  description?: string;
  resources?: { label: string; url: string }[];
  completedAt?: string; // ISO String
}

export interface Week {
  id: string;
  weekNumber: number;
  theme: string;
  targetHours: number;
  tasks: Task[];
  isExpanded?: boolean; // UI State
}

export interface PlanSettings {
  hoursPerWeek: number;
  availableDays: string[];
  intensity: 'low' | 'medium' | 'high';
  handsOnVsReading: number; // 0-100
  deadline?: string;
}

export interface Plan {
  id: string;
  userId: string;
  title: string;
  courseType?: string;
  createdAt: string; // ISO String
  totalWeeks: number;
  settings: PlanSettings;
  weeks: Week[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    progress: number; // 0-100
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: {
    timezone: string;
    hoursPerDayDefault: number;
    preferredDays: string[];
  };
}
