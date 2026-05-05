import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

interface Match {
  id: string;
  name: string;
  college: string;
  skills: string[];
  matchedAt: string;
  github?: string;
  linkedin?: string;
}

const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    name: 'Alex Chen',
    college: 'MIT',
    skills: ['React', 'Node.js'],
    matchedAt: '2 hours ago',
    github: 'https://github.com/alexchen',
    linkedin: 'https://linkedin.com/in/alexchen',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    college: 'Stanford',
    skills: ['UI/UX Design', 'Figma'],
    matchedAt: '1 day ago',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
  },
];

export default function MatchesScreen() {
  const { user } = useAuth();
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const response = await api.getMatches(user.email);
      if (response.matches) {
        setMatches(response.matches);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
      // Fall back to mock data
      setMatches(MOCK_MATCHES);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLink = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleUnmatch = (matchId: string, matchName: string) => {
    Alert.alert(
      'Unmatch',
      `Are you sure you want to unmatch with ${matchName}?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Unmatch',
          onPress: async () => {
            try {
              await api.unmatch(matchId, user?.email || '');
              setMatches(matches.filter((m) => m.id !== matchId));
            } catch (err) {
              Alert.alert('Error', 'Failed to unmatch');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderMatchCard = ({ item }: { item: Match }) => (
    <View style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{item.name}</Text>
          <Text style={styles.matchCollege}>{item.college}</Text>
          <Text style={styles.matchedAt}>Matched {item.matchedAt}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleUnmatch(item.id, item.name)}
          style={styles.unmatchButton}
        >
          <Ionicons name="close-circle" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.skillsContainer}>
        {item.skills.map((skill) => (
          <View key={skill} style={styles.skillBadge}>
            <Text style={styles.skillBadgeText}>{skill}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        {item.linkedin && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenLink(item.linkedin)}
          >
            <Ionicons name="open" size={16} color="#0a66c2" />
            <Text style={styles.actionButtonText}>LinkedIn</Text>
          </TouchableOpacity>
        )}

        {item.github && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenLink(item.github)}
          >
            <Ionicons name="open" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>GitHub</Text>
          </TouchableOpacity>
        )}

        {!item.github && (
          <View style={[styles.actionButton, styles.actionButtonDisabled]}>
            <Ionicons name="lock-closed" size={16} color="#666" />
            <Text style={[styles.actionButtonText, styles.actionButtonTextDisabled]}>
              GitHub Hidden
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (matches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Matches</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color="#6366f1" />
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptySubtitle}>
            Start swiping to find your perfect teammate
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.matchCount}>{matches.length}</Text>
      </View>

      <FlatList
        data={matches}
        renderItem={renderMatchCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  matchCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  matchCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  matchCollege: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  matchedAt: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  skillBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  actionButtonDisabled: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtonTextDisabled: {
    color: '#666',
  },
  unmatchButton: {
    padding: 8,
    marginRight: -8,
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
