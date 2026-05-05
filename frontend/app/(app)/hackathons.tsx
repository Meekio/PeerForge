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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Hackathon {
  id: string;
  name: string;
  date: string;
  location: string;
  prize: string;
  participants: string;
  tags: string[];
  description: string;
  deadline: string;
}

const MOCK_HACKATHONS: Hackathon[] = [
  {
    id: '1',
    name: 'HackMIT 2026',
    date: 'May 15-17, 2026',
    location: 'MIT, Cambridge',
    prize: '$50,000',
    participants: '1,200+',
    tags: ['AI/ML', 'Web3', 'Hardware'],
    description: 'The largest student-run hackathon in the world. Build something amazing in 36 hours.',
    deadline: 'April 30, 2026',
  },
  {
    id: '2',
    name: 'TreeHacks',
    date: 'June 5-7, 2026',
    location: 'Stanford University',
    prize: '$30,000',
    participants: '800+',
    tags: ['Social Good', 'Health', 'Education'],
    description: 'Stanford\'s premier hackathon focused on creating positive social impact.',
    deadline: 'May 15, 2026',
  },
  {
    id: '3',
    name: 'CalHacks',
    date: 'July 20-22, 2026',
    location: 'UC Berkeley',
    prize: '$40,000',
    participants: '1,500+',
    tags: ['Open Track', 'Fintech', 'Climate'],
    description: 'The largest collegiate hackathon in the world. All skill levels welcome.',
    deadline: 'June 30, 2026',
  },
  {
    id: '4',
    name: 'PennApps',
    date: 'August 10-12, 2026',
    location: 'University of Pennsylvania',
    prize: '$35,000',
    participants: '1,000+',
    tags: ['Mobile', 'IoT', 'Gaming'],
    description: 'The nation\'s first student-run college hackathon. Build, learn, and connect.',
    deadline: 'July 20, 2026',
  },
  {
    id: '5',
    name: 'HackTheNorth',
    date: 'September 15-17, 2026',
    location: 'University of Waterloo',
    prize: '$60,000',
    participants: '1,500+',
    tags: ['AI', 'Blockchain', 'Sustainability'],
    description: 'Canada\'s biggest hackathon. Join hackers from around the world.',
    deadline: 'August 25, 2026',
  },
];

export default function HackathonsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [hackathons, setHackathons] = useState(MOCK_HACKATHONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [interestedHackathons, setInterestedHackathons] = useState<string[]>([]);
  const position = useRef(new Animated.ValueXY()).current;

  // Reset position when card changes
  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [currentIndex]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentHackathon = hackathons[currentIndex];
    
    Animated.timing(position, {
      toValue: {
        x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
        y: 0,
      },
      duration: 300,
      useNativeDriver: false,
    }).start(async () => {
      if (direction === 'right') {
        console.log('Interested in hackathon:', currentHackathon.name);
        setInterestedHackathons([...interestedHackathons, currentHackathon.id]);
        // TODO: Save to backend
      } else {
        console.log('Skipped hackathon:', currentHackathon.name);
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

  if (currentIndex >= hackathons.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={64} color="#6366f1" />
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>
            You've reviewed all available hackathons
          </Text>
          <Text style={styles.interestedCount}>
            {interestedHackathons.length} hackathons saved
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentHackathon = hackathons[currentIndex];
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
        <Text style={styles.title}>Hackathons</Text>
        <TouchableOpacity 
          style={styles.savedBadge}
          onPress={() => router.push('/(app)/saved-hackathons')}
        >
          <Ionicons name="bookmark" size={16} color="#6366f1" />
          <Text style={styles.savedCount}>{interestedHackathons.length}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View
          style={[styles.card, animatedCardStyle]}
          {...panResponder.panHandlers}
        >
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.cardHeader}>
              <View style={styles.hackathonIcon}>
                <Ionicons name="trophy" size={32} color="#f59e0b" />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{currentHackathon.name}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar" size={14} color="#999" />
                  <Text style={styles.date}>{currentHackathon.date}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="location" size={14} color="#999" />
                  <Text style={styles.location}>{currentHackathon.location}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text style={styles.description}>{currentHackathon.description}</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsSection}>
              <View style={styles.statBox}>
                <Ionicons name="cash" size={20} color="#10b981" />
                <Text style={styles.statLabel}>Prize Pool</Text>
                <Text style={styles.statValue}>{currentHackathon.prize}</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="people" size={20} color="#6366f1" />
                <Text style={styles.statLabel}>Participants</Text>
                <Text style={styles.statValue}>{currentHackathon.participants}</Text>
              </View>
            </View>

            {/* Deadline */}
            <View style={styles.deadlineBox}>
              <Ionicons name="time" size={16} color="#f59e0b" />
              <Text style={styles.deadlineText}>
                Registration closes: {currentHackathon.deadline}
              </Text>
            </View>

            {/* Tags */}
            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>Tracks</Text>
              <View style={styles.tagRow}>
                {currentHackathon.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
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
          <Ionicons name="bookmark" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {hackathons.length}
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
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  savedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
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
    gap: 12,
  },
  hackathonIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 13,
    color: '#999',
  },
  location: {
    fontSize: 13,
    color: '#999',
  },
  descriptionSection: {
    paddingVertical: 8,
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  deadlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3d2a0a',
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  deadlineText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
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
  tag: {
    backgroundColor: '#6366f1',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: '#fff',
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
  interestedCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    marginTop: 8,
  },
});
