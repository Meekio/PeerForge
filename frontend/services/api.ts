const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const TIMEOUT = 2000; // 2 second timeout

const fetchWithTimeout = async (url: string, options: any) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

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

      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        body: formData,
      });
      
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
      
      const response = await fetch(`${API_URL}/profile`, {
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
      const response = await fetch(`${API_URL}/discover?email=${encodeURIComponent(email)}`);
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
      const response = await fetch(`${API_URL}/profile?email=${encodeURIComponent(email)}`);
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
      const response = await fetch(`${API_URL}/swipe`, {
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
      const response = await fetch(`${API_URL}/matches?email=${encodeURIComponent(email)}`);
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
      const response = await fetch(`${API_URL}/matches/${matchId}?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Unmatch failed');
      return response.json();
    } catch (err) {
      console.error('Unmatch error:', err);
      throw err;
    }
  },
};
