import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, where, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Counter } from '@/types';
import { toFirebaseTimestamp, fromFirebaseTimestamp, convertFirestoreData } from '@/utils';

// Firebase 연결 체크
const checkFirebaseConnection = (): boolean => {
  if (!db) {
    console.warn('⚠️ Firebase not initialized, using offline mode');
    return false;
  }
  return true;
};

// Firebase에 카운터 생성
export const createCounter = async (userId: string, sort: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Creating counter in offline mode:', sort);
    return;
  }

  try {
    console.log('Creating counter for user:', userId, 'sort:', sort);
    
    const counterCollection = collection(db, 'users', userId, 'counters');
    
    const newCounter = {
      sort,
      count: 0,
      createdAt: toFirebaseTimestamp(new Date()),
    };
    
    const docRef = await addDoc(counterCollection, newCounter);
    console.log('Counter created with ID:', docRef.id);
  } catch (error) {
    console.error('Error creating counter:', error);
    throw error;
  }
};

// Firebase에서 카운터 증가
export const incrementCounter = async (userId: string, counterId: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Incrementing counter in offline mode:', counterId);
    return;
  }

  try {
    console.log('Incrementing counter:', counterId);
    
    const counterDoc = doc(db, 'users', userId, 'counters', counterId);
    
    // 현재 카운터 값을 가져와서 +1
    const counterSnapshot = await getDoc(counterDoc);
    if (counterSnapshot.exists()) {
      const currentCount = counterSnapshot.data().count || 0;
      await updateDoc(counterDoc, {
        count: currentCount + 1,
      });
      console.log('Counter incremented:', counterId, 'new count:', currentCount + 1);
    }
  } catch (error) {
    console.error('Error incrementing counter:', error);
    throw error;
  }
};

// Firebase에서 카운터 감소
export const decrementCounter = async (userId: string, counterId: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Decrementing counter in offline mode:', counterId);
    return;
  }

  try {
    console.log('Decrementing counter:', counterId);
    
    const counterDoc = doc(db, 'users', userId, 'counters', counterId);
    
    // 현재 카운터 값을 가져와서 -1 (0 이하로는 가지 않음)
    const counterSnapshot = await getDoc(counterDoc);
    if (counterSnapshot.exists()) {
      const currentCount = counterSnapshot.data().count || 0;
      const newCount = Math.max(0, currentCount - 1);
      await updateDoc(counterDoc, {
        count: newCount,
      });
      console.log('Counter decremented:', counterId, 'new count:', newCount);
    }
  } catch (error) {
    console.error('Error decrementing counter:', error);
    throw error;
  }
};

// Firebase에서 카운터 삭제
export const deleteCounter = async (userId: string, counterId: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Deleting counter in offline mode:', counterId);
    return;
  }

  try {
    console.log('Deleting counter:', counterId);
    
    const counterDoc = doc(db, 'users', userId, 'counters', counterId);
    await deleteDoc(counterDoc);
    
    console.log('Counter deleted:', counterId);
  } catch (error) {
    console.error('Error deleting counter:', error);
    throw error;
  }
};

// Firebase에서 카운터 실시간 구독
export const subscribeToCounters = (userId: string, callback: (counters: Counter[]) => void): (() => void) => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Using offline mode for counters');
    callback([]);
    return () => console.log('No subscription to unsubscribe (offline mode)');
  }

  console.log('Subscribing to counters for user:', userId);
  
  const counterCollection = collection(db, 'users', userId, 'counters');
  const q = query(counterCollection, orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const counters: Counter[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const convertedData = convertFirestoreData(data);
      
      const counter: Counter = {
        id: doc.id,
        sort: convertedData.sort,
        count: convertedData.count,
        createdAt: fromFirebaseTimestamp(convertedData.createdAt),
      };
      
      counters.push(counter);
    });
    
    console.log('Counters updated:', counters.length);
    callback(counters);
  }, (error) => {
    console.error('Error subscribing to counters:', error);
    callback([]);
  });
  
  return unsubscribe;
}; 