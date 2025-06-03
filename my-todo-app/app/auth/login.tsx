import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useGoogleAuthRequest, handleGoogleResponse } from '@/services/authService';

export default function LoginScreen() {
  const [request, response, promptAsync] = useGoogleAuthRequest();

  useEffect(() => {
    if (response) {
      handleGoogleResponse(response);
    }
  }, [response]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Todo Memory App
      </ThemedText>
      
      <ThemedText style={styles.subtitle}>
        할 일들이 메모리 프로세스로 관리됩니다
      </ThemedText>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <ThemedText style={styles.buttonText}>
          🚀 구글로 로그인
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
  },
  googleButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 