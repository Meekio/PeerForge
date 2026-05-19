const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const TIMEOUT = 10000; // 10 second timeout
const VERIFY_TIMEOUT = 60000; // 60 second timeout for ID verification (OCR takes time)

const fetchWithTimeout = async (url: string, options: any, timeout: number = TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timeout - backend may be offline');
    }
    throw err;
  }
};

export const api = {
  async login(email: string, password: string) {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response:', data);
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Login failed');
      }
      return data;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  },

  async signup(email: string, password: string) {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await fetchWithTimeout(`${API_URL}/auth/signup`, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Signup response status:', response.status);
      const data = await response.json();
      console.log('Signup response:', data);
      
      if (!response.ok) throw new Error('Signup failed');
      return data;
    } catch (err) {
      console.error('Signup error:', err);
      throw err;
    }
  },

  async verifyId(frontFile: { uri: string; name: string }, backFile: { uri: string; name: string } | null, email: string) {
    try {
      const formData = new FormData();
      
      if (!backFile) {
        formData.append('file', {
          uri: frontFile.uri,
          name: frontFile.name,
          type: 'application/pdf',
        } as any);
      } else {
        formData.append('file', {
          uri: frontFile.uri,
          name: frontFile.name,
          type: 'image/jpeg',
        } as any);
      }
      
      formData.append('email', email);

      console.log('Sending verification request to:', `${API_URL}/verify`);
      console.log('Email:', email);

      // Use longer timeout for OCR processing
      const response = await fetchWithTimeout(`${API_URL}/verify`, {
        method: 'POST',
        body: formData,
      }, VERIFY_TIMEOUT);
      
      console.log('Verify response status:', response.status);
      const data = await response.json();
      console.log('Verify response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      return data;
    } catch (err: any) {
      console.error('Verify error:', err);
      throw err;
    }
  },

  async saveProfile(profileData: any, email: string) {
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('college', profileData.college);
      formData.append('year', profileData.year.toString());
      formData.append('skills', profileData.skills.join(','));
      formData.append('interests', profileData.interests.join(','));
      formData.append('availability', profileData.availability.join(','));
      formData.append('lookingFor', profileData.lookingFor.join(','));
      formData.append('github', profileData.github || '');
      formData.append('linkedin', profileData.linkedin || '');
      formData.append('bio', profileData.bio || '');
      formData.append('email', email);

      console.log('=== SAVE PROFILE API CALL ===');
      console.log('URL:', `${API_URL}/profile`);
      console.log('Email:', email);
      console.log('Name:', profileData.name);
      console.log('Skills:', profileData.skills);
      
      const response = await fetchWithTimeout(`${API_URL}/profile`, {
        method: 'POST',
        body: formData,
      });

      console.log('Save profile response status:', response.status);
      const data = await response.json();
      console.log('Save profile response:', data);

      if (!response.ok) throw new Error('Profile save failed');
      return data;
    } catch (err) {
      console.error('Save profile error:', err);
      throw err;
    }
  },

  async getProfiles(email: string) {
    try {
      console.log('Getting profiles from:', `${API_URL}/discover?email=${email}`);
      const response = await fetchWithTimeout(`${API_URL}/discover?email=${encodeURIComponent(email)}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch profiles');
      return response.json();
    } catch (err) {
      console.error('Get profiles error:', err);
      throw err;
    }
  },

  async getUserProfile(email: string) {
    try {
      console.log('Getting user profile from:', `${API_URL}/profile?email=${email}`);
      const response = await fetchWithTimeout(`${API_URL}/profile?email=${encodeURIComponent(email)}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch user profile');
      return response.json();
    } catch (err) {
      console.error('Get user profile error:', err);
      throw err;
    }
  },

  async recordSwipe(targetId: string, interested: boolean, email: string) {
    try {
      const formData = new FormData();
      formData.append('targetId', targetId);
      formData.append('interested', interested.toString());
      formData.append('email', email);

      console.log('Recording swipe to:', `${API_URL}/swipe`);
      const response = await fetchWithTimeout(`${API_URL}/swipe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Swipe failed');
      return response.json();
    } catch (err) {
      console.error('Record swipe error:', err);
      throw err;
    }
  },

  async getMatches(email: string) {
    try {
      console.log('Getting matches from:', `${API_URL}/matches?email=${email}`);
      const response = await fetchWithTimeout(`${API_URL}/matches?email=${encodeURIComponent(email)}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch matches');
      return response.json();
    } catch (err) {
      console.error('Get matches error:', err);
      throw err;
    }
  },

  async unmatch(matchId: string, email: string) {
    try {
      console.log('Unmatching from:', `${API_URL}/matches/${matchId}?email=${email}`);
      const response = await fetchWithTimeout(`${API_URL}/matches/${matchId}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Unmatch failed');
      return response.json();
    } catch (err) {
      console.error('Unmatch error:', err);
      throw err;
    }
  },

  async deleteAccount(email: string) {
    try {
      console.log('Deleting account:', `${API_URL}/account?email=${email}`);
      const response = await fetchWithTimeout(`${API_URL}/account?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Account deletion failed');
      return response.json();
    } catch (err) {
      console.error('Delete account error:', err);
      throw err;
    }
  },

  // ============ TEAM MANAGEMENT ============

  async createTeam(name: string, description: string, purpose: string, email: string) {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('purpose', purpose);
      formData.append('email', email);

      console.log('Creating team:', `${API_URL}/teams`);
      const response = await fetchWithTimeout(`${API_URL}/teams`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Team creation failed');
      return response.json();
    } catch (err) {
      console.error('Create team error:', err);
      throw err;
    }
  },

  async getUserTeams(email: string) {
    try {
      console.log('Getting user teams from:', `${API_URL}/teams?email=${email}`);
      const response = await fetchWithTimeout(`${API_URL}/teams?email=${encodeURIComponent(email)}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch teams');
      return response.json();
    } catch (err) {
      console.error('Get teams error:', err);
      throw err;
    }
  },

  async getTeamDetails(teamId: string, email: string) {
    try {
      console.log('Getting team details from:', `${API_URL}/teams/${teamId}?email=${email}`);
      const response = await fetchWithTimeout(`${API_URL}/teams/${teamId}?email=${encodeURIComponent(email)}`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch team details');
      return response.json();
    } catch (err) {
      console.error('Get team details error:', err);
      throw err;
    }
  },

  async joinTeam(inviteCode: string, email: string) {
    try {
      const formData = new FormData();
      formData.append('inviteCode', inviteCode);
      formData.append('email', email);

      console.log('Joining team:', `${API_URL}/teams/join`);
      const response = await fetchWithTimeout(`${API_URL}/teams/join`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join team');
      }
      return response.json();
    } catch (err) {
      console.error('Join team error:', err);
      throw err;
    }
  },

  async leaveTeam(teamId: string, email: string) {
    try {
      const formData = new FormData();
      formData.append('email', email);

      console.log('Leaving team:', `${API_URL}/teams/${teamId}/leave`);
      const response = await fetchWithTimeout(`${API_URL}/teams/${teamId}/leave`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to leave team');
      }
      return response.json();
    } catch (err) {
      console.error('Leave team error:', err);
      throw err;
    }
  },

  async removeTeamMember(teamId: string, userId: string, email: string) {
    try {
      console.log('Removing team member:', `${API_URL}/teams/${teamId}/members/${userId}?email=${email}`);
      const response = await fetchWithTimeout(`${API_URL}/teams/${teamId}/members/${userId}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove member');
      }
      return response.json();
    } catch (err) {
      console.error('Remove member error:', err);
      throw err;
    }
  },

  async deleteTeam(teamId: string, email: string) {
    try {
      console.log('Deleting team:', `${API_URL}/teams/${teamId}?email=${email}`);
      const response = await fetchWithTimeout(`${API_URL}/teams/${teamId}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete team');
      }
      return response.json();
    } catch (err) {
      console.error('Delete team error:', err);
      throw err;
    }
  },
};
