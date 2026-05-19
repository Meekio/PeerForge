import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';

interface Team {
  id: string;
  name: string;
  description: string;
  purpose: string;
  role: string;
  memberCount: number;
  inviteCode?: string;
  joinedAt: string;
}

interface TeamMember {
  userId: string;
  name: string;
  email: string;
  college: string;
  role: string;
  skills: string[];
  interests: string[];
  joinedAt: string;
}

interface TeamDetails extends Team {
  members: TeamMember[];
  userRole: string;
}

export default function TeamsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showTeamDetailsModal, setShowTeamDetailsModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamDetails | null>(null);
  const [loadingTeamDetails, setLoadingTeamDetails] = useState(false);

  // Create team form
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamPurpose, setTeamPurpose] = useState('');

  // Join team form
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await api.getUserTeams(user?.email || '');
      if (response.teams) {
        setTeams(response.teams);
      }
    } catch (error: any) {
      console.error('Load teams error:', error);
      Alert.alert('Error', 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    try {
      const response = await api.createTeam(
        teamName,
        teamDescription,
        teamPurpose,
        user?.email || ''
      );

      if (response.success) {
        Alert.alert(
          'Team Created!',
          `Invite code: ${response.team.inviteCode}\n\nShare this code with others to invite them.`,
          [{ text: 'OK', onPress: () => {
            setShowCreateModal(false);
            setTeamName('');
            setTeamDescription('');
            setTeamPurpose('');
            loadTeams();
          }}]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create team');
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      const response = await api.joinTeam(inviteCode.toUpperCase(), user?.email || '');
      if (response.success) {
        Alert.alert('Success', `You joined ${response.team.name}!`);
        setShowJoinModal(false);
        setInviteCode('');
        loadTeams();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join team');
    }
  };

  const handleTeamPress = async (team: Team) => {
    try {
      setLoadingTeamDetails(true);
      setShowTeamDetailsModal(true);
      const response = await api.getTeamDetails(team.id, user?.email || '');
      if (response.team) {
        setSelectedTeam(response.team);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load team details');
      setShowTeamDetailsModal(false);
    } finally {
      setLoadingTeamDetails(false);
    }
  };

  const handleLeaveTeam = async (teamId: string) => {
    Alert.alert(
      'Leave Team',
      'Are you sure you want to leave this team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.leaveTeam(teamId, user?.email || '');
              Alert.alert('Success', 'You left the team');
              setShowTeamDetailsModal(false);
              setSelectedTeam(null);
              loadTeams();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to leave team');
            }
          },
        },
      ]
    );
  };

  const handleRemoveMember = async (teamId: string, userId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Remove ${memberName} from the team?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.removeTeamMember(teamId, userId, user?.email || '');
              Alert.alert('Success', 'Member removed');
              // Reload team details
              handleTeamPress({ ...selectedTeam!, id: teamId } as Team);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const handleDeleteTeam = async (teamId: string) => {
    Alert.alert(
      'Delete Team',
      'Are you sure? This will permanently delete the team for all members.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteTeam(teamId, user?.email || '');
              Alert.alert('Success', 'Team deleted');
              setShowTeamDetailsModal(false);
              setSelectedTeam(null);
              loadTeams();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete team');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading teams...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Teams</Text>
          <Text style={styles.subtitle}>
            Manage your teams and collaborate with others
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#6366f1' }]}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Create Team</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981' }]}
            onPress={() => setShowJoinModal(true)}
          >
            <Ionicons name="enter" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Join Team</Text>
          </TouchableOpacity>
        </View>

        {/* Teams List */}
        {teams.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#666" />
            <Text style={styles.emptyStateTitle}>No Teams Yet</Text>
            <Text style={styles.emptyStateText}>
              Create a team or join one using an invite code
            </Text>
          </View>
        ) : (
          <View style={styles.teamsList}>
            {teams.map((team) => (
              <TouchableOpacity
                key={team.id}
                style={styles.teamCard}
                onPress={() => handleTeamPress(team)}
              >
                <View style={styles.teamHeader}>
                  <View style={styles.teamIcon}>
                    <Ionicons name="people" size={24} color="#6366f1" />
                  </View>
                  <View style={styles.teamInfo}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    {team.description && (
                      <Text style={styles.teamDescription} numberOfLines={2}>
                        {team.description}
                      </Text>
                    )}
                  </View>
                  {team.role === 'admin' && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                  )}
                </View>

                <View style={styles.teamFooter}>
                  <View style={styles.teamStat}>
                    <Ionicons name="people" size={14} color="#999" />
                    <Text style={styles.teamStatText}>
                      {team.memberCount} {team.memberCount === 1 ? 'member' : 'members'}
                    </Text>
                  </View>
                  {team.purpose && (
                    <View style={styles.teamPurpose}>
                      <Text style={styles.teamPurposeText}>{team.purpose}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Create Team Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Team</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Team Name *"
              placeholderTextColor="#666"
              value={teamName}
              onChangeText={setTeamName}
            />

            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor="#666"
              value={teamDescription}
              onChangeText={setTeamDescription}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Purpose (e.g., Hackathon, Project)"
              placeholderTextColor="#666"
              value={teamPurpose}
              onChangeText={setTeamPurpose}
            />

            <TouchableOpacity style={styles.modalButton} onPress={handleCreateTeam}>
              <Text style={styles.modalButtonText}>Create Team</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Join Team Modal */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join Team</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Enter the invite code shared by the team admin
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Invite Code"
              placeholderTextColor="#666"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
            />

            <TouchableOpacity style={styles.modalButton} onPress={handleJoinTeam}>
              <Text style={styles.modalButtonText}>Join Team</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Team Details Modal */}
      <Modal
        visible={showTeamDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTeamDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Team Details</Text>
              <TouchableOpacity onPress={() => setShowTeamDetailsModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {loadingTeamDetails ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366f1" />
              </View>
            ) : selectedTeam ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.teamDetailsHeader}>
                  <Text style={styles.teamDetailsName}>{selectedTeam.name}</Text>
                  {selectedTeam.description && (
                    <Text style={styles.teamDetailsDescription}>
                      {selectedTeam.description}
                    </Text>
                  )}
                  {selectedTeam.purpose && (
                    <View style={styles.teamDetailsPurpose}>
                      <Text style={styles.teamDetailsPurposeText}>
                        {selectedTeam.purpose}
                      </Text>
                    </View>
                  )}
                </View>

                {selectedTeam.inviteCode && (
                  <View style={styles.inviteCodeSection}>
                    <Text style={styles.inviteCodeLabel}>Invite Code:</Text>
                    <Text style={styles.inviteCode}>{selectedTeam.inviteCode}</Text>
                    <Text style={styles.inviteCodeHint}>
                      Share this code with others to invite them
                    </Text>
                  </View>
                )}

                <Text style={styles.membersTitle}>
                  Members ({selectedTeam.members.length})
                </Text>

                {selectedTeam.members.map((member) => (
                  <View key={member.userId} style={styles.memberCard}>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberCollege}>{member.college}</Text>
                      {member.skills.length > 0 && (
                        <View style={styles.memberSkills}>
                          {member.skills.slice(0, 3).map((skill, idx) => (
                            <View key={idx} style={styles.skillTag}>
                              <Text style={styles.skillTagText}>{skill}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                    <View style={styles.memberActions}>
                      {member.role === 'admin' && (
                        <View style={styles.adminBadge}>
                          <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                      )}
                      {selectedTeam.userRole === 'admin' &&
                        member.userId !== user?.id &&
                        member.role !== 'admin' && (
                          <TouchableOpacity
                            onPress={() =>
                              handleRemoveMember(
                                selectedTeam.id,
                                member.userId,
                                member.name
                              )
                            }
                          >
                            <Ionicons name="remove-circle" size={24} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                    </View>
                  </View>
                ))}

                <View style={styles.teamActions}>
                  <TouchableOpacity
                    style={[styles.teamActionButton, { backgroundColor: '#ef4444' }]}
                    onPress={() => handleLeaveTeam(selectedTeam.id)}
                  >
                    <Ionicons name="exit" size={20} color="#fff" />
                    <Text style={styles.teamActionButtonText}>Leave Team</Text>
                  </TouchableOpacity>

                  {selectedTeam.userRole === 'admin' && (
                    <TouchableOpacity
                      style={[styles.teamActionButton, { backgroundColor: '#dc2626' }]}
                      onPress={() => handleDeleteTeam(selectedTeam.id)}
                    >
                      <Ionicons name="trash" size={20} color="#fff" />
                      <Text style={styles.teamActionButtonText}>Delete Team</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  teamsList: {
    gap: 12,
  },
  teamCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  teamHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  teamIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  teamDescription: {
    fontSize: 12,
    color: '#999',
  },
  adminBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  teamFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  teamStatText: {
    fontSize: 12,
    color: '#999',
  },
  teamPurpose: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  teamPurposeText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  spacer: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  modalDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  teamDetailsHeader: {
    marginBottom: 20,
  },
  teamDetailsName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  teamDetailsDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
  },
  teamDetailsPurpose: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  teamDetailsPurposeText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  inviteCodeSection: {
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366f1',
    letterSpacing: 2,
    marginBottom: 4,
  },
  inviteCodeHint: {
    fontSize: 11,
    color: '#666',
  },
  membersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  memberCard: {
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  memberCollege: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  memberSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillTag: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  skillTagText: {
    fontSize: 10,
    color: '#999',
  },
  memberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamActions: {
    marginTop: 20,
    gap: 12,
  },
  teamActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  teamActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
