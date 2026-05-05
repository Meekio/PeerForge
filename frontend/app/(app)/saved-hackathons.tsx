import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

const MOCK_SAVED_HACKATHONS = [
  {
    id: '1',
    name: 'HackMIT 2026',
    date: 'May 15-17, 2026',
    location: 'MIT, Cambridge',
    prize: '$50,000',
    participants: '1,200+',
    tags: ['AI/ML', 'Web3', 'Hardware'],
    description: 'The largest student-run hackathon in the world.',
    deadline: 'April 30, 2026',
    registrationLink: 'https://hackmit.org',
  },
  {
    id: '3',
    name: 'CalHacks',
    date: 'July 20-22, 2026',
    location: 'UC Berkeley',
    prize: '$40,000',
    participants: '1,500+',
    tags: ['Open Track', 'Fintech', 'Climate'],
    description: 'The largest collegiate hackathon in the world.',
    deadline: 'June 30, 2026',
    registrationLink: 'https://calhacks.io',
  },
];

export default function SavedHackathonsScreen() {
  const router = useRouter();
  const [savedHackathons, setSavedHackathons] = useState(MOCK_SAVED_HACKATHONS);

  const handleRemove = (id: string) => {
    setSavedHackathons(savedHackathons.filter(h => h.id !== id));
  };

  const handleRegister = (link: string) => {
    Linking.openURL(link);
  };

  if (savedHackathons.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Saved Hackathons</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color="#666" />
          <Text style={styles.emptyTitle}>No saved hackathons</Text>
          <Text style={styles.emptySubtitle}>
            Browse hackathons and save the ones you're interested in
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(app)/hackathons')}
          >
            <Text style={styles.browseButtonText}>Browse Hackathons</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Hackathons</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {savedHackathons.map((hackathon) => (
          <View key={hackathon.id} style={styles.hackathonCard}>
            <View style={styles.cardHeader}>
              <View style={styles.hackathonIcon}>
                <Ionicons name="trophy" size={28} color="#f59e0b" />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{hackathon.name}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar" size={12} color="#999" />
                  <Text style={styles.date}>{hackathon.date}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="location" size={12} color="#999" />
                  <Text style={styles.location}>{hackathon.location}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(hackathon.id)}
              >
                <Ionicons name="close" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>{hackathon.description}</Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="cash" size={16} color="#10b981" />
                <Text style={styles.statText}>{hackathon.prize}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="people" size={16} color="#6366f1" />
                <Text style={styles.statText}>{hackathon.participants}</Text>
              </View>
            </View>

            <View style={styles.deadlineBox}>
              <Ionicons name="time" size={14} color="#f59e0b" />
              <Text style={styles.deadlineText}>
                Deadline: {hackathon.deadline}
              </Text>
            </View>

            <View style={styles.tagsRow}>
              {hackathon.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => handleRegister(hackathon.registrationLink)}
            >
              <Text style={styles.registerButtonText}>Register Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  hackathonCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  hackathonIcon: {
    width: 48,
    height: 48,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: '#999',
  },
  location: {
    fontSize: 11,
    color: '#999',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3d0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '600',
  },
  deadlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3d2a0a',
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  deadlineText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '600',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  registerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  browseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  spacer: {
    height: 20,
  },
});
