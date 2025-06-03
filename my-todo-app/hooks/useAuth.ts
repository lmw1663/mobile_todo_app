import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getCurrentUser, subscribeToAuthState } from '@/services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuth: Auth 상태 감지 시작');
    
    // 초기 사용자 상태 설정
    const initialUser = getCurrentUser();
    setUser(initialUser);
    console.log('useAuth: 초기 사용자 상태:', initialUser ? '로그인됨' : '로그아웃됨');
    
    // Auth 상태 변화 구독
    const unsubscribe = subscribeToAuthState((authUser) => {
      setUser(authUser);
      setLoading(false);
      console.log('useAuth: Auth 상태 변경:', authUser ? '로그인됨' : '로그아웃됨');
    });

    setLoading(false);

    return unsubscribe;
  }, []);

  return { user, loading };
}; 