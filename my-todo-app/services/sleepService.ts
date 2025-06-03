import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, where, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { SleepLog } from '@/types';
import { toFirebaseTimestamp, fromFirebaseTimestamp, convertFirestoreData } from '@/utils';

// Firebase 연결 체크
const checkFirebaseConnection = (): boolean => {
  if (!db) {
    console.warn('⚠️ Firebase not initialized, using offline mode');
    return false;
  }
  return true;
};

// Firebase에 수면 시작 기록
export const startSleep = async (userId: string): Promise<string | null> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Starting sleep in offline mode');
    return null;
  }

  try {
    console.log('Starting sleep for user:', userId);
    
    // 기존에 활성화된 수면이 있는지 확인
    const sleepCollection = collection(db, 'users', userId, 'sleepLogs');
    const activeQuery = query(sleepCollection, where('isActive', '==', true));
    const activeSnapshot = await getDocs(activeQuery);
    
    if (!activeSnapshot.empty) {
      console.log('Active sleep session already exists');
      return activeSnapshot.docs[0].id;
    }
    
    // 새 수면 세션 시작
    const newSleep = {
      startTime: toFirebaseTimestamp(new Date()),
      isActive: true,
    };
    
    const docRef = await addDoc(sleepCollection, newSleep);
    console.log('Sleep started with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error starting sleep:', error);
    throw error;
  }
};

// Firebase에서 수면 종료 기록
export const endSleep = async (userId: string, sleepId: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Ending sleep in offline mode:', sleepId);
    return;
  }

  try {
    console.log('Ending sleep:', sleepId);
    
    const sleepDoc = doc(db, 'users', userId, 'sleepLogs', sleepId);
    const sleepSnapshot = await getDoc(sleepDoc);
    
    if (sleepSnapshot.exists()) {
      const sleepData = sleepSnapshot.data();
      const startTime = fromFirebaseTimestamp(sleepData.startTime);
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // 분 단위
      
      await updateDoc(sleepDoc, {
        endTime: toFirebaseTimestamp(endTime),
        duration,
        isActive: false,
      });
      
      console.log('Sleep ended. Duration:', duration, 'minutes');
    }
  } catch (error) {
    console.error('Error ending sleep:', error);
    throw error;
  }
};

// Firebase에서 수면 기록 삭제
export const deleteSleepLog = async (userId: string, sleepId: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Deleting sleep log in offline mode:', sleepId);
    return;
  }

  try {
    console.log('Deleting sleep log:', sleepId);
    
    const sleepDoc = doc(db, 'users', userId, 'sleepLogs', sleepId);
    await deleteDoc(sleepDoc);
    
    console.log('Sleep log deleted:', sleepId);
  } catch (error) {
    console.error('Error deleting sleep log:', error);
    throw error;
  }
};

// Firebase에서 활성 수면 상태 확인
export const getActiveSleep = async (userId: string): Promise<SleepLog | null> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Getting active sleep in offline mode');
    return null;
  }

  try {
    const sleepCollection = collection(db, 'users', userId, 'sleepLogs');
    const activeQuery = query(sleepCollection, where('isActive', '==', true));
    const snapshot = await getDocs(activeQuery);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      const convertedData = convertFirestoreData(data);
      
      return {
        id: doc.id,
        startTime: fromFirebaseTimestamp(convertedData.startTime),
        endTime: convertedData.endTime ? fromFirebaseTimestamp(convertedData.endTime) : undefined,
        duration: convertedData.duration,
        isActive: convertedData.isActive,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting active sleep:', error);
    return null;
  }
};

// Firebase에서 수면 기록 실시간 구독
export const subscribeToSleepLogs = (userId: string, callback: (sleepLogs: SleepLog[]) => void): (() => void) => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Using offline mode for sleep logs');
    callback([]);
    return () => console.log('No subscription to unsubscribe (offline mode)');
  }

  console.log('Subscribing to sleep logs for user:', userId);
  
  const sleepCollection = collection(db, 'users', userId, 'sleepLogs');
  const q = query(sleepCollection, orderBy('startTime', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const sleepLogs: SleepLog[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const convertedData = convertFirestoreData(data);
      
      const sleepLog: SleepLog = {
        id: doc.id,
        startTime: fromFirebaseTimestamp(convertedData.startTime),
        endTime: convertedData.endTime ? fromFirebaseTimestamp(convertedData.endTime) : undefined,
        duration: convertedData.duration,
        isActive: convertedData.isActive,
      };
      
      sleepLogs.push(sleepLog);
    });
    
    console.log('Sleep logs updated:', sleepLogs.length);
    callback(sleepLogs);
  }, (error) => {
    console.error('Error subscribing to sleep logs:', error);
    callback([]);
  });
  
  return unsubscribe;
}; 