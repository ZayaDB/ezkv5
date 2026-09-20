export interface AdminStats {
  period: string;
  totals: {
    users: number;
    mentors: number;
    mentees: number;
    sessions: number;
  };
  periodStats: {
    newUsers: number;
    newMentors: number;
    newMentees: number;
    newSessions: number;
  };
  roleStats: {
    mentee: number;
    mentor: number;
    admin: number;
  };
  monthlySignups: Array<{ year: number; month: number; count: number }>;
  sessionStatus: {
    upcoming: number;
    completed: number;
    cancelled: number;
  };
}

export type StatsPeriod = "all" | "day" | "month" | "year";
