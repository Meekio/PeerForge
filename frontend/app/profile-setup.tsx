import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

const SKILL_SUGGESTIONS = [
  'React',
  'Node.js',
  'Python',
  'TypeScript',
  'Machine Learning',
  'UI/UX Design',
  'Mobile Dev',
  'DevOps',
  'Data Science',
  'Web3',
];

const INTEREST_SUGGESTIONS = [
  'Hackathons',
  'Startups',
  'Open Source',
  'AI/ML',
  'Web Development',
  'Mobile Apps',
  'Gaming',
  'Blockchain',
];

const AVAILABILITY_OPTIONS = ['Weekends', 'Evenings', 'Full-time Hackathon'];

const LOOKING_FOR_OPTIONS = [
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'ML Engineer',
  'Data Scientist',
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [customInterest, setCustomInterest] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Load existing profile data when screen opens
  useEffect(() => {
    loadExistingProfile();
  }, [user?.email]);

  const loadExistingProfile = async () => {
    if (!user?.email) {
      setLoadingProfile(false);
      return;
    }

    try {
      const response = await api.getUserProfile(user.email);
      if (response.profile) {
        const profile = response.profile;
        setName(profile.name || '');
        setCollege(profile.college || '');
        setYear(profile.year?.toString() || '');
        setSkills(profile.skills || []);
        setInterests(profile.interests || []);
        setAvailability(profile.availability || []);
        setLookingFor(profile.lookingFor || []);
        setGithub(profile.github || '');
        setLinkedin(profile.linkedin || '');
        setBio(profile.bio || '');
        console.log('Loaded existing profile for editing');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const toggleTag = (tag: string, state: string[], setState: (s: string[]) => void) => {
    if (state.includes(tag)) {
      setState(state.filter((t) => t !== tag));
    } else {
      setState([...state, tag]);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests([...interests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const removeTag = (tag: string, state: string[], setState: (s: string[]) => void) => {
    setState(state.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    console.log('=== HANDLE SAVE CLICKED ===');
    console.log('Name:', name);
    console.log('College:', college);
    console.log('Year:', year);
    
    if (!name || !college || !year) {
      console.log('Missing required fields');
      alert('Please fill in basic information');
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        name,
        college,
        year: parseInt(year),
        skills,
        interests,
        availability,
        lookingFor,
        github,
        linkedin,
        bio,
      };

      console.log('Profile data to save:', profileData);
      console.log('User email:', user?.email);
      console.log('About to call saveProfile API...');
      
      const response = await api.saveProfile(profileData, user?.email || '');
      console.log('Save profile response:', response);
      
      if (response.success) {
        console.log('Profile saved successfully');
        await updateProfile(true);
        console.log('Profile marked as completed');
        router.replace('/(app)/discover');
      } else {
        console.error('Save failed:', response);
        alert('Failed to save profile: ' + (response.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Failed to save profile: ' + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loadingProfile ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>Help us find your perfect teammate</Text>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="College"
            placeholderTextColor="#666"
            value={college}
            onChangeText={setCollege}
          />
          <TextInput
            style={styles.input}
            placeholder="Year (1-4)"
            placeholderTextColor="#666"
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
          />
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.tagContainer}>
            {SKILL_SUGGESTIONS.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.tag,
                  skills.includes(skill) && styles.tagActive,
                ]}
                onPress={() => toggleTag(skill, skills, setSkills)}
              >
                <Text
                  style={[
                    styles.tagText,
                    skills.includes(skill) && styles.tagTextActive,
                  ]}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Custom Skills */}
          {skills.filter(s => !SKILL_SUGGESTIONS.includes(s)).length > 0 && (
            <View style={styles.customTagsContainer}>
              <Text style={styles.customTagsLabel}>Your Skills</Text>
              <View style={styles.tagContainer}>
                {skills.filter(s => !SKILL_SUGGESTIONS.includes(s)).map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    style={[styles.tag, styles.customTag]}
                    onPress={() => removeTag(skill, skills, setSkills)}
                  >
                    <Text style={[styles.tagText, styles.customTagText]}>{skill}</Text>
                    <Text style={styles.removeTagText}> ✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Add Custom Skill */}
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="Add your own skill..."
              placeholderTextColor="#666"
              value={customSkill}
              onChangeText={setCustomSkill}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={addCustomSkill}
              disabled={!customSkill.trim()}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.tagContainer}>
            {INTEREST_SUGGESTIONS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.tag,
                  interests.includes(interest) && styles.tagActive,
                ]}
                onPress={() => toggleTag(interest, interests, setInterests)}
              >
                <Text
                  style={[
                    styles.tagText,
                    interests.includes(interest) && styles.tagTextActive,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Availability</Text>
          <View style={styles.tagContainer}>
            {AVAILABILITY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.tag,
                  availability.includes(option) && styles.tagActive,
                ]}
                onPress={() => toggleTag(option, availability, setAvailability)}
              >
                <Text
                  style={[
                    styles.tagText,
                    availability.includes(option) && styles.tagTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Looking For */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking For</Text>
          <View style={styles.tagContainer}>
            {LOOKING_FOR_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.tag,
                  lookingFor.includes(option) && styles.tagActive,
                ]}
                onPress={() => toggleTag(option, lookingFor, setLookingFor)}
              >
                <Text
                  style={[
                    styles.tagText,
                    lookingFor.includes(option) && styles.tagTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Links</Text>
          <TextInput
            style={styles.input}
            placeholder="GitHub Profile URL"
            placeholderTextColor="#666"
            value={github}
            onChangeText={setGithub}
          />
          <TextInput
            style={styles.input}
            placeholder="LinkedIn Profile URL"
            placeholderTextColor="#666"
            value={linkedin}
            onChangeText={setLinkedin}
          />
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#666"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() => {
            console.log('=== SAVE BUTTON PRESSED ===');
            handleSave();
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Profile</Text>
          )}
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  bioInput: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  tagActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  tagText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  tagTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
  customTagsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  customTagsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 8,
  },
  customTag: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  customTagText: {
    color: '#fff',
  },
  removeTagText: {
    color: '#fff',
    marginLeft: 4,
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  addButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
