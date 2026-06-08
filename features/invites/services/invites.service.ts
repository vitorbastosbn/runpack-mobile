import { http } from '@shared/utils/http';

export interface InviteInfo {
  type: 'group' | 'session';
  targetId: string;
  targetName: string;
  invitedBy: { name: string; username: string };
  expiresAt: string;
}

export interface AcceptInviteResult {
  type: 'group' | 'session';
  targetId: string;
}

export const invitesService = {
  async getInviteInfo(token: string): Promise<InviteInfo> {
    const { data } = await http.get<InviteInfo>(`/invites/${token}`);
    return data;
  },

  async acceptInvite(token: string): Promise<AcceptInviteResult> {
    const { data } = await http.post<AcceptInviteResult>(`/invites/${token}/accept`);
    return data;
  },

  async createInvite(type: 'group' | 'session', targetId: string): Promise<{ token: string; url: string; expiresAt: string }> {
    const { data } = await http.post('/invites', { type, targetId });
    return data;
  },
};
