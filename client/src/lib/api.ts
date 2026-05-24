import axios from "axios";

// Configure axios instance with relative API path
export const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

export interface User {
  openId: string;
  email: string | null;
  name: string | null;
  role: "user" | "admin";
  adminId?: number;
}

export interface IssueSection {
  id?: number;
  sectionType: string;
  title: string;
  content: string | null;
  orderIndex?: number;
  sponsorId?: number | null;
  aiGenerated?: boolean;
}

export interface Issue {
  id: number;
  adminId: number;
  title: string;
  slug: string;
  previewText: string | null;
  status: "draft" | "scheduled" | "sending" | "sent" | "archived";
  issueNumber: number;
  issueDate: string | null;
  sentAt: string | null;
  coverImageUrl: string | null;
  readingTimeMinutes: number;
  totalRecipients: number;
  sections?: IssueSection[];
  createdAt: string;
  updatedAt: string;
}

export interface Subscriber {
  id: number;
  email: string;
  fullName: string | null;
  status: "pending" | "active" | "unsubscribed" | "bounced" | "complained";
  referralCode: string;
  referralCount: number;
  createdAt: string;
}

export interface Sponsor {
  id: number;
  companyName: string;
  contactName: string | null;
  contactEmail: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  status: "prospect" | "active" | "paused" | "inactive";
  industry: string | null;
  totalSpendPkr: string | number;
  notes: string | null;
}

// API methods
export const apiService = {
  auth: {
    getMe: async (): Promise<User | null> => {
      const response = await api.get<User | null>("/api/auth/me");
      return response.data;
    },
    logout: async (): Promise<{ success: boolean }> => {
      const response = await api.post<{ success: boolean }>("/api/auth/logout");
      return response.data;
    },
  },
  public: {
    subscribe: async (payload: { email: string; fullName?: string; referralCode?: string }): Promise<{ success: boolean; message: string }> => {
      const response = await api.post<{ success: boolean; message: string }>("/api/public/subscribe", payload);
      return response.data;
    },
    confirm: async (token: string): Promise<{ success: boolean; message: string }> => {
      const response = await api.get<{ success: boolean; message: string }>(`/api/public/confirm?token=${token}`);
      return response.data;
    },
    unsubscribe: async (email: string): Promise<{ success: boolean; message: string }> => {
      const response = await api.post<{ success: boolean; message: string }>(`/api/public/unsubscribe?email=${email}`);
      return response.data;
    },
    getLatestIssues: async (limit: number = 6): Promise<Issue[]> => {
      const response = await api.get<Issue[]>(`/api/public/issues?limit=${limit}`);
      return response.data;
    },
    getIssueBySlug: async (slug: string): Promise<Issue> => {
      const response = await api.get<Issue>(`/api/public/issues/${slug}`);
      return response.data;
    },
    getAnalytics: async (): Promise<{ totalSubscribers: number; activeSubscribers: number; totalIssuesSent: number }> => {
      const response = await api.get<{ totalSubscribers: number; activeSubscribers: number; totalIssuesSent: number }>("/api/public/analytics");
      return response.data;
    },
  },
  admin: {
    getDashboard: async (): Promise<{
      totalSubscribers: number;
      activeSubscribers: number;
      totalIssuesSent: number;
      recentIssues: Issue[];
      topReferrers: Array<{
        id: number;
        email: string;
        fullName: string | null;
        referralCount: number;
        status: string;
      }>;
    }> => {
      const response = await api.get("/api/admin/dashboard");
      return response.data;
    },
    getIssues: async (): Promise<Issue[]> => {
      const response = await api.get<Issue[]>("/api/admin/issues");
      return response.data;
    },
    getIssue: async (id: number): Promise<Issue> => {
      const response = await api.get<Issue>(`/api/admin/issues/${id}`);
      return response.data;
    },
    createIssue: async (payload: Partial<Issue> & { sections?: IssueSection[] }): Promise<Issue> => {
      const response = await api.post<Issue>("/api/admin/issues", payload);
      return response.data;
    },
    updateIssue: async (id: number, payload: Partial<Issue> & { sections?: IssueSection[] }): Promise<Issue> => {
      const response = await api.put<Issue>(`/api/admin/issues/${id}`, payload);
      return response.data;
    },
    sendIssue: async (id: number): Promise<{ success: boolean; message: string }> => {
      const response = await api.post<{ success: boolean; message: string }>(`/api/admin/issues/${id}/send`);
      return response.data;
    },
    getSubscribers: async (): Promise<Subscriber[]> => {
      const response = await api.get<Subscriber[]>("/api/admin/subscribers");
      return response.data;
    },
    getSubscriberGrowth: async (days: number = 30): Promise<Array<{ date: string; count: number }>> => {
      const response = await api.get<Array<{ date: string; count: number }>>(`/api/admin/subscribers/growth?days=${days}`);
      return response.data;
    },
    generateFullIssue: async (payload: { issueFocus?: string; tone?: string; targetAudience?: string }): Promise<{ success: boolean; content: string }> => {
      const response = await api.post<{ success: boolean; content: string }>("/api/admin/ai/generate-issue", payload);
      return response.data;
    },
    generateSubjectLines: async (payload: { issueTitle: string; previewText: string }): Promise<{ success: boolean; subjectLines: string[] }> => {
      const response = await api.post<{ success: boolean; subjectLines: string[] }>("/api/admin/ai/generate-subjects", payload);
      return response.data;
    },
    getSponsors: async (): Promise<Sponsor[]> => {
      const response = await api.get<Sponsor[]>("/api/admin/sponsors");
      return response.data;
    },
    createSponsor: async (payload: Omit<Sponsor, "id" | "totalSpendPkr">): Promise<Sponsor> => {
      const response = await api.post<Sponsor>("/api/admin/sponsors", payload);
      return response.data;
    },
    updateSponsor: async (id: number, payload: Partial<Sponsor>): Promise<Sponsor> => {
      const response = await api.put<Sponsor>(`/api/admin/sponsors/${id}`, payload);
      return response.data;
    },
    deleteSponsor: async (id: number): Promise<{ success: boolean; message: string }> => {
      const response = await api.delete<{ success: boolean; message: string }>(`/api/admin/sponsors/${id}`);
      return response.data;
    },
    deleteSubscriber: async (id: number): Promise<{ success: boolean; message: string }> => {
      const response = await api.delete<{ success: boolean; message: string }>(`/api/admin/subscribers/${id}`);
      return response.data;
    },
    updateSubscriber: async (id: number, payload: { status?: string; fullName?: string; email?: string }): Promise<{ success: boolean; message: string }> => {
      const response = await api.put<{ success: boolean; message: string }>(`/api/admin/subscribers/${id}`, payload);
      return response.data;
    },
    deleteIssue: async (id: number): Promise<{ success: boolean; message: string }> => {
      const response = await api.delete<{ success: boolean; message: string }>(`/api/admin/issues/${id}`);
      return response.data;
    },
    updateSettings: async (payload: { name?: string; email?: string; avatarUrl?: string }): Promise<{ success: boolean; message: string }> => {
      const response = await api.put<{ success: boolean; message: string }>("/api/admin/settings", payload);
      return response.data;
    },
    getReferralLeaderboard: async (): Promise<Subscriber[]> => {
      const response = await api.get<Subscriber[]>("/api/admin/referral-leaderboard");
      return response.data;
    },
  },
};
