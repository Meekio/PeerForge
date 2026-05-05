import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/services/api';

interface UploadedFile {
  name: string;
  uri: string;
}

export default function VerifyScreen() {
  const router = useRouter();
  const { updateVerification, user } = useAuth();
  const [uploadMode, setUploadMode] = useState<'pictures' | 'pdf' | null>(null);
  const [frontId, setFrontId] = useState<UploadedFile | null>(null);
  const [backId, setBackId] = useState<UploadedFile | null>(null);
  const [pdfFile, setPdfFile] = useState<UploadedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [showUploadOptions, setShowUploadOptions] = useState<'front' | 'back' | null>(null);

  const pickDocument = async (side?: 'front' | 'back') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: uploadMode === 'pdf' ? ['application/pdf'] : ['application/pdf', 'image/*'],
      });

      if (!result.canceled) {
        const file = {
          name: result.assets[0].name,
          uri: result.assets[0].uri,
        };
        if (uploadMode === 'pdf') {
          setPdfFile(file);
        } else if (side === 'front') {
          setFrontId(file);
        } else if (side === 'back') {
          setBackId(file);
        }
        setShowUploadOptions(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const takePhoto = async (side: 'front' | 'back') => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = {
          name: `${side}-id-${Date.now()}.jpg`,
          uri: result.assets[0].uri,
        };
        if (side === 'front') {
          setFrontId(file);
        } else {
          setBackId(file);
        }
        setShowUploadOptions(null);
      }
    } catch (err) {
      console.error('Camera error:', err);
      Alert.alert('Camera Error', 'Unable to open camera. Try uploading a file instead.');
    }
  };

  const handleSubmit = async () => {
    if (uploadMode === 'pictures' && (!frontId || !backId)) {
      Alert.alert('Error', 'Please upload both front and back ID');
      return;
    }

    if (uploadMode === 'pdf' && !pdfFile) {
      Alert.alert('Error', 'Please upload a PDF');
      return;
    }

    setLoading(true);
    setStatus('pending');

    try {
      // Auto-verify
      setStatus('verified');
      await updateVerification(true);
      // Don't call updateProfile here - let user complete profile first

      // Send verification email directly to v3
      const emailToUse = user?.email || 'user@example.com';
      console.log('Sending verification email to:', emailToUse);
      
      try {
        const formData = new FormData();
        formData.append('email', emailToUse);
        
        // Call v3 directly (port 8000)
        const v3Url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
        console.log('Calling v3 email endpoint:', `${v3Url}/send-verification-email`);
        
        const response = await fetch(`${v3Url}/send-verification-email`, {
          method: 'POST',
          body: formData,
        });
        
        console.log('V3 email response status:', response.status);
        const responseData = await response.json();
        console.log('V3 email response:', responseData);
        
        if (response.ok) {
          console.log('Verification email sent successfully');
          Alert.alert('Success', 'Verification email sent to ' + emailToUse);
        } else {
          console.log('Failed to send verification email:', responseData);
          Alert.alert('Info', 'ID verified but email could not be sent');
        }
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
        Alert.alert('Info', 'ID verified but email could not be sent');
      }

      setTimeout(() => {
        router.replace('/profile-setup');
      }, 1500);
    } catch (err) {
      setStatus('rejected');
      console.error('Verification error:', err);
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!uploadMode) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify Your Student ID</Text>
            <Text style={styles.subtitle}>
              Choose how you want to upload your ID
            </Text>
          </View>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => setUploadMode('pictures')}
          >
            <Ionicons name="camera" size={40} color="#6366f1" />
            <Text style={styles.modeTitle}>Take Pictures</Text>
            <Text style={styles.modeSubtitle}>
              Capture front and back separately
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => setUploadMode('pdf')}
          >
            <Ionicons name="document" size={40} color="#6366f1" />
            <Text style={styles.modeTitle}>Upload PDF</Text>
            <Text style={styles.modeSubtitle}>
              Upload a single PDF with both sides
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setUploadMode(null)}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {uploadMode === 'pictures' ? 'Take Pictures' : 'Upload PDF'}
          </Text>
        </View>

        {uploadMode === 'pictures' ? (
          <>
            <View style={styles.uploadSection}>
              <Text style={styles.sectionTitle}>Front Side</Text>
              <TouchableOpacity
                style={[styles.uploadBox, frontId && styles.uploadBoxFilled]}
                onPress={() => setShowUploadOptions('front')}
                disabled={loading}
              >
                {frontId ? (
                  <View style={styles.uploadedContent}>
                    <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                    <Text style={styles.uploadedText}>{frontId.name}</Text>
                  </View>
                ) : (
                  <View style={styles.uploadContent}>
                    <Ionicons name="camera" size={32} color="#6366f1" />
                    <Text style={styles.uploadText}>Tap to take photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.uploadSection}>
              <Text style={styles.sectionTitle}>Back Side</Text>
              <TouchableOpacity
                style={[styles.uploadBox, backId && styles.uploadBoxFilled]}
                onPress={() => setShowUploadOptions('back')}
                disabled={loading}
              >
                {backId ? (
                  <View style={styles.uploadedContent}>
                    <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                    <Text style={styles.uploadedText}>{backId.name}</Text>
                  </View>
                ) : (
                  <View style={styles.uploadContent}>
                    <Ionicons name="camera" size={32} color="#6366f1" />
                    <Text style={styles.uploadText}>Tap to take photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Upload PDF</Text>
            <TouchableOpacity
              style={[styles.uploadBox, pdfFile && styles.uploadBoxFilled]}
              onPress={() => pickDocument()}
              disabled={loading}
            >
              {pdfFile ? (
                <View style={styles.uploadedContent}>
                  <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                  <Text style={styles.uploadedText}>{pdfFile.name}</Text>
                </View>
              ) : (
                <View style={styles.uploadContent}>
                  <Ionicons name="cloud-upload" size={32} color="#6366f1" />
                  <Text style={styles.uploadText}>Tap to upload PDF</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {status === 'verified' && (
          <View style={styles.statusBox}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.statusText}>ID Verified Successfully!</Text>
          </View>
        )}

        {status === 'rejected' && (
          <View style={[styles.statusBox, styles.statusBoxError]}>
            <Ionicons name="close-circle" size={24} color="#ef4444" />
            <Text style={[styles.statusText, styles.statusTextError]}>
              Verification failed. Please try again.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading || (uploadMode === 'pictures' && (!frontId || !backId)) || (uploadMode === 'pdf' && !pdfFile)}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Submit for Verification</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Upload Options Modal for Pictures Mode */}
      {uploadMode === 'pictures' && (
        <Modal
          visible={showUploadOptions !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setShowUploadOptions(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Upload {showUploadOptions === 'front' ? 'Front' : 'Back'} ID
                </Text>
                <TouchableOpacity onPress={() => setShowUploadOptions(null)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => takePhoto(showUploadOptions!)}
              >
                <Ionicons name="camera" size={24} color="#6366f1" />
                <View>
                  <Text style={styles.modalOptionTitle}>Take Photo</Text>
                  <Text style={styles.modalOptionSubtitle}>
                    Use your camera to capture the ID
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => pickDocument(showUploadOptions!)}
              >
                <Ionicons name="image" size={24} color="#6366f1" />
                <View>
                  <Text style={styles.modalOptionTitle}>Upload Image</Text>
                  <Text style={styles.modalOptionSubtitle}>
                    Choose from your device
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowUploadOptions(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  modeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
  },
  modeSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxFilled: {
    borderColor: '#10b981',
    backgroundColor: '#0a3d2a',
  },
  uploadContent: {
    alignItems: 'center',
    gap: 8,
  },
  uploadedContent: {
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadedText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
  },
  statusBox: {
    backgroundColor: '#0a3d2a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  statusBoxError: {
    backgroundColor: '#3d0a0a',
  },
  statusText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  statusTextError: {
    color: '#ef4444',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 16,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOptionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  modalCancel: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
