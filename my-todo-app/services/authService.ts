import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { User } from '@/types';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// 더미 사용자 정보 (Firebase의 실제 uid 사용)
const dummyUser: User = {
  id: 'jWnP4HIwrIV2y62I9ODO1VIolnd2', // Firebase의 실제 구글 사용자 uid
  email: 'dummy.user@gmail.com',
  displayName: '더미 구글 유저',
};

// 자동으로 더미 유저로 로그인된 상태로 설정
let currentUser: User | null = dummyUser;
let authSubscribers: ((user: User | null) => void)[] = [];

// 구글 로그인 요청 훅 (현재는 더미 데이터 사용을 위해 유지)
export const useGoogleAuthRequest = () => {
  return Google.useIdTokenAuthRequest({
    clientId: Platform.select({
      ios: '34426649912-duosupheqqiamgd10l35bm1ehv0pbgpb.apps.googleusercontent.com',
      android: '여기에_Android용_클라이언트_ID_입력',
      default: '34426649912-i99ig1astenkhtmvmh5hjvls0ihuorbi.apps.googleusercontent.com',
    }),
    redirectUri: 'https://auth.expo.io/@leeminwoo1663/my-todo-app',
  });
};

// 더미 구글 로그인 (실제 구글 로그인 대신 사용)
export const handleDummyGoogleLogin = async () => {
  console.log('더미 구글 로그인 실행:', dummyUser);
  currentUser = dummyUser;
  authSubscribers.forEach(cb => cb(currentUser));
  return currentUser;
};

// 구글 로그인 응답 처리 (기존 로직 유지, 하지만 더미 데이터로 처리)
export const handleGoogleResponse = async (response: any) => {
  console.log('구글 로그인 응답:', response);
  // 응답과 관계없이 더미 유저로 로그인 처리
  currentUser = dummyUser;
  authSubscribers.forEach(cb => cb(currentUser));
};

export const getCurrentUser = () => currentUser;

export const subscribeToAuthState = (callback: (user: User | null) => void) => {
  authSubscribers.push(callback);
  callback(currentUser); // 즉시 더미 유저 상태 전달
  return () => {
    const idx = authSubscribers.indexOf(callback);
    if (idx > -1) authSubscribers.splice(idx, 1);
  };
};

export const logout = async () => {
  currentUser = null;
  authSubscribers.forEach(cb => cb(currentUser));
};

// 앱 시작 시 자동으로 더미 유저로 로그인 상태 설정
export const initializeDummyAuth = () => {
  console.log('더미 인증 초기화 - 자동 로그인:', dummyUser);
  currentUser = dummyUser;
  authSubscribers.forEach(cb => cb(currentUser));
}; 