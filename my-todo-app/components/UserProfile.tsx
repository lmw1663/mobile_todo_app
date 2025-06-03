import React from 'react';
import { View, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/services/authService';

export default function UserProfile() {
  const { user } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('로그아웃 오류:', error);
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          {user.photoURL ? (
            <Image 
              source={{ uri: user.photoURL }}
              style={styles.avatarImage}
            />
          ) : (
            <ThemedText style={styles.avatarText}>
              {user.displayName.charAt(0).toUpperCase()}
            </ThemedText>
          )}
        </View>
        <View style={styles.userDetails}>
          <ThemedText style={styles.displayName}>
            {user.displayName}
          </ThemedText>
          <ThemedText style={styles.email}>
            {user.email}
          </ThemedText>
          <ThemedText style={styles.providerText}>
            Google 계정
          </ThemedText>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <ThemedText style={styles.logoutText}>
          로그아웃
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  providerText: {
    fontSize: 12,
    color: '#4285f4',
    fontWeight: '500',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
}); 