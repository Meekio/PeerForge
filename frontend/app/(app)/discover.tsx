import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Profile {
  id: string;
  name: string;
  college: string;
  skills: string[];
  interests: string[];
  bio: string;
  verified: boolean;
  image?: string;
}

const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Alex Chen',
    college: 'MIT',
    skills: ['React', 'Node.js', 'TypeScript'],
    interests: ['Startups', 'AI/ML'],
    bio: 'Building the future, one line of code at a time',
    verified: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    college: 'Stanford',
    skills: ['UI/UX Design', 'Figma', 'Web Design'],
    interests: ['Design Systems', 'Startups'],
    bio: 'Designer passionate about user experience',
    verified: true,
  },
  {
    id: '3',
    name: 'Raj Patel',
    college: 'Berkeley',
    skills: ['Python', 'Machine Learning', 'Data Science'],
    interests: ['AI/ML', 'Open Source'],
    bio: 'ML engineer exploring new frontiers',
    verified: true,
  },
];

export default function DiscoverScreen() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    loadProfiles();
  }, [user]);

  // Reset position when card changes
  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [currentIndex]);

  const loadProfiles = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const response = await api.getProfiles(user.email);
      if (response.profiles && response.profiles.length > 0) {
        setProfiles(response.profiles);
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
      // Fall back to mock data
      setProfiles(MOCK_PROFILES);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentProfile = profiles[currentIndex];
    
    Animated.timing(position, {
      toValue: {
        x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
        y: 0,
      },
      duration: 300,
      useNativeDriver: false,
    }).start(async () => {
      if (direction === 'right') {
        console.log('Interested in:', currentProfile.name);
        try {
          const response = await api.recordSwipe(currentProfile.userId || currentProfile.id, true, user?.email || '');
          console.log('Swipe response:', response);
          if (response.matched) {
            console.log('🎉 MATCH!', response.matchedWith);
          }
        } catch (err) {
          console.error('Failed to record swipe:', err);
        }
      } else {
        console.log('Skipped:', currentProfile.name);
        try {
          await api.recordSwipe(currentProfile.userId || currentProfile.id, false, user?.email || '');
        } catch (err) {
          console.error('Failed to record swipe:', err);
        }
      }
      
      setCurrentIndex(currentIndex + 1);
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      position.setValue({
        x: gestureState.dx,
        y: gestureState.dy,
      });
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 120) {
        handleSwipe('right');
      } else if (gestureState.dx < -120) {
        handleSwipe('left');
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const handleSkip = () => {
    handleSwipe('left');
  };

  const handleInterested = () => {
    handleSwipe('right');
  };

  if (currentIndex >= profiles.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={64} color="#6366f1" />
          <Text style={styles.emptyTitle}>No more profiles</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for more teammates
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentProfile = profiles[currentIndex];
  const animatedCardStyle = {
    transform: [
      {
        translateX: position.x,
      },
      {
        rotate: position.x.interpolate({
          inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
          outputRange: ['-30deg', '0deg', '30deg'],
          extrapolate: 'clamp',
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="funnel" size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View
          style={[styles.card, animatedCardStyle]}
          {...panResponder.panHandlers}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{currentProfile.name}</Text>
                  {currentProfile.verified && (
                    <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  )}
                </View>
                <Text style={styles.college}>{currentProfile.college}</Text>
              </View>
            </View>

            <View style={styles.bioSection}>
              <Text style={styles.bio}>{currentProfile.bio}</Text>
            </View>

            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>Skills</Text>
              <View style={styles.tagRow}>
                {currentProfile.skills.map((skill) => (
                  <View key={skill} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>Interests</Text>
              <View style={styles.tagRow}>
                {currentProfile.interests.map((interest) => (
                  <View key={interest} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Ionicons name="close" size={24} color="#ef4444" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.interestedButton} onPress={handleInterested}>
          <Ionicons name="heart" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {profiles.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  filterButton: {
    padding: 8,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    gap: 16,
  },
  cardHeader: {
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
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  college: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  bioSection: {
    paddingVertical: 8,
  },
  bio: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  tagsSection: {
    gap: 8,
  },
  tagsLabel: {
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  skipButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3d0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestedButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  progressText: {
    color: '#666',
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
  },
});
