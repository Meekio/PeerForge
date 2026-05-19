import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const MOCK_HACKATHONS = [
  {
    id: '1',
    name: 'HackMIT 2026',
    date: 'May 15-17, 2026',
    location: 'MIT, Cambridge',
    prize: '$50,000',
    participants: '1,200+',
    tags: ['AI/ML', 'Web3', 'Hardware'],
  },
  {
    id: '2',
    name: 'TreeHacks',
    date: 'June 5-7, 2026',
    location: 'Stanford University',
    prize: '$30,000',
    participants: '800+',
    tags: ['Social Good', 'Health', 'Education'],
  },
  {
    id: '3',
    name: 'CalHacks',
    date: 'July 20-22, 2026',
    location: 'UC Berkeley',
    prize: '$40,000',
    participants: '1,500+',
    tags: ['Open Track', 'Fintech', 'Climate'],
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleHackathonPress = (hackathon: typeof MOCK_HACKATHONS[0]) => {
    // TODO: Navigate to hackathon details or open registration
    console.log('Hackathon pressed:', hackathon.name);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.name}>{user?.email?.split('@')[0]}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/(app)/discover')}
          >
            <Ionicons name="flame" size={24} color="#6366f1" />
            <Text style={styles.statLabel}>Discover</Text>
            <Text style={styles.statValue}>Find teammates</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => router.push('/(app)/matches')}
          >
            <Ionicons name="heart" size={24} color="#ef4444" />
            <Text style={styles.statLabel}>Matches</Text>
            <Text style={styles.statValue}>Your connections</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(app)/teams')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#1e1b4b' }]}>
              <Ionicons name="people" size={28} color="#6366f1" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Teams</Text>
              <Text style={styles.actionSubtitle}>Manage your teams & collaborate</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(app)/profile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#0a3d2a' }]}>
              <Ionicons name="person" size={28} color="#10b981" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View Profile</Text>
              <Text style={styles.actionSubtitle}>See your profile details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(app)/hackathons')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#3d2a0a' }]}>
              <Ionicons name="trophy" size={28} color="#f59e0b" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Browse Hackathons</Text>
              <Text style={styles.actionSubtitle}>Find your next competition</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Upcoming Hackathons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Hackathons</Text>
          
          {MOCK_HACKATHONS.map((hackathon) => (
            <TouchableOpacity
              key={hackathon.id}
              style={styles.hackathonCard}
              onPress={() => handleHackathonPress(hackathon)}
            >
              <View style={styles.hackathonHeader}>
                <View style={styles.hackathonIcon}>
                  <Ionicons name="trophy" size={24} color="#f59e0b" />
                </View>
                <View style={styles.hackathonInfo}>
                  <Text style={styles.hackathonName}>{hackathon.name}</Text>
                  <View style={styles.hackathonMeta}>
                    <Ionicons name="calendar" size={12} color="#999" />
                    <Text style={styles.hackathonDate}>{hackathon.date}</Text>
                  </View>
                  <View style={styles.hackathonMeta}>
                    <Ionicons name="location" size={12} color="#999" />
                    <Text style={styles.hackathonLocation}>{hackathon.location}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.hackathonDetails}>
                <View style={styles.hackathonStat}>
                  <Ionicons name="cash" size={16} color="#10b981" />
                  <Text style={styles.hackathonStatText}>{hackathon.prize}</Text>
                </View>
                <View style={styles.hackathonStat}>
                  <Ionicons name="people" size={16} color="#6366f1" />
                  <Text style={styles.hackathonStatText}>{hackathon.participants}</Text>
                </View>
              </View>

              <View style={styles.hackathonTags}>
                {hackathon.tags.map((tag) => (
                  <View key={tag} style={styles.hackathonTag}>
                    <Text style={styles.hackathonTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About PeerForge</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              PeerForge helps you find the perfect teammates for your projects and hackathons. Connect with like-minded developers and creators.
            </Text>
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  hackathonCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  hackathonHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  hackathonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hackathonInfo: {
    flex: 1,
    gap: 4,
  },
  hackathonName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  hackathonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hackathonDate: {
    fontSize: 12,
    color: '#999',
  },
  hackathonLocation: {
    fontSize: 12,
    color: '#999',
  },
  hackathonDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  hackathonStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hackathonStatText: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '600',
  },
  hackathonTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  hackathonTag: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hackathonTagText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  spacer: {
    height: 20,
  },
});
