import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';

interface UserProfile {
  id?: string;
  name: string;
  college: string;
  year: number | string;
  skills: string[];
  interests: string[];
  availability?: string[];
  lookingFor?: string[];
  bio: string;
  github?: string;
  linkedin?: string;
  verified: boolean;
  email?: string;
}

const MOCK_PROFILE: UserProfile = {
  name: 'Your Name',
  college: 'Your College',
  year: '3',
  skills: ['React', 'Node.js', 'TypeScript'],
  interests: ['Startups', 'AI/ML'],
  bio: 'Passionate developer looking for teammates',
  github: 'https://github.com/yourprofile',
  linkedin: 'https://linkedin.com/in/yourprofile',
  verified: true,
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [user?.email])
  );

  const loadProfile = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Loading profile for:', user.email);
      const response = await api.getUserProfile(user.email);
      console.log('Profile response:', response);

      if (response.profile) {
        const userProfile = response.profile;
        console.log('Found user profile:', userProfile);
        setProfile({
          name: userProfile.name,
          college: userProfile.college,
          year: userProfile.year,
          skills: userProfile.skills || [],
          interests: userProfile.interests || [],
          availability: userProfile.availability || [],
          lookingFor: userProfile.lookingFor || [],
          bio: userProfile.bio,
          github: userProfile.github,
          linkedin: userProfile.linkedin,
          verified: userProfile.verified || true,
          email: userProfile.email,
        });
      } else {
        console.log('No profile found');
        setProfile(MOCK_PROFILE);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setProfile(MOCK_PROFILE);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLink = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your data including profile, matches, and swipes will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?.email) {
                Alert.alert('Error', 'No user email found');
                return;
              }

              console.log('Deleting account for:', user.email);
              const response = await api.deleteAccount(user.email);
              
              if (response.success) {
                console.log('Account deleted successfully');
                Alert.alert(
                  'Account Deleted',
                  'Your account has been permanently deleted.',
                  [
                    {
                      text: 'OK',
                      onPress: async () => {
                        await logout();
                        router.replace('/(auth)/login');
                      },
                    },
                  ]
                );
              } else {
                Alert.alert('Error', response.error || 'Failed to delete account');
              }
            } catch (err: any) {
              console.error('Delete account error:', err);
              Alert.alert('Error', err.message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile-setup');
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="pencil" size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile.name}</Text>
                {profile.verified && (
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                )}
              </View>
              <Text style={styles.college}>{profile.college}</Text>
              <Text style={styles.year}>Year {profile.year}</Text>
            </View>
          </View>

          <View style={styles.bioSection}>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>

          {/* Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.tagRow}>
              {profile.skills.map((skill) => (
                <View key={skill} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.tagRow}>
              {profile.interests.map((interest) => (
                <View key={interest} style={styles.interestTag}>
                  <Text style={styles.interestTagText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Social Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Links</Text>
            <View style={styles.linkRow}>
              {profile.linkedin && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => handleOpenLink(profile.linkedin)}
                >
                  <Ionicons name="logo-linkedin" size={20} color="#0a66c2" />
                  <Text style={styles.linkButtonText}>LinkedIn</Text>
                </TouchableOpacity>
              )}

              {profile.github && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => handleOpenLink(profile.github)}
                >
                  <Ionicons name="logo-github" size={20} color="#fff" />
                  <Text style={styles.linkButtonText}>GitHub</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Verification Status */}
          <View style={styles.verificationBox}>
            <View style={styles.verificationContent}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <View>
                <Text style={styles.verificationTitle}>Verified Student</Text>
                <Text style={styles.verificationSubtitle}>
                  Your student ID has been verified
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={18} color="#6366f1" />
            <Text style={styles.secondaryButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, styles.dangerButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={18} color="#ef4444" />
            <Text style={[styles.secondaryButtonText, styles.dangerButtonText]}>
              Logout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash" size={18} color="#dc2626" />
            <Text style={[styles.secondaryButtonText, styles.deleteButtonText]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>

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
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  profileCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    gap: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  college: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  year: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  bioSection: {
    paddingVertical: 8,
  },
  bio: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  interestTag: {
    backgroundColor: '#333',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  interestTagText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '500',
  },
  linkRow: {
    flexDirection: 'row',
    gap: 8,
  },
  linkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  linkButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  verificationBox: {
    backgroundColor: '#0a3d2a',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verificationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  verificationSubtitle: {
    fontSize: 11,
    color: '#0d8659',
    marginTop: 2,
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    borderColor: '#ef4444',
  },
  dangerButtonText: {
    color: '#ef4444',
  },
  deleteButton: {
    borderColor: '#dc2626',
    backgroundColor: '#1a0a0a',
  },
  deleteButtonText: {
    color: '#dc2626',
  },
  spacer: {
    height: 20,
  },
});
