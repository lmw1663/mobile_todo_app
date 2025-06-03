import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Memo } from '@/types';
import { toFirebaseTimestamp, fromFirebaseTimestamp, convertFirestoreData } from '@/utils';

// Firebase 연결 체크
const checkFirebaseConnection = (): boolean => {
  if (!db) {
    console.warn('⚠️ Firebase not initialized, using offline mode');
    return false;
  }
  return true;
};

// Firebase에 메모 생성
export const createMemo = async (userId: string, text: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Creating memo in offline mode:', text.substring(0, 30));
    return;
  }

  try {
    console.log('Creating memo for user:', userId);
    
    const memoCollection = collection(db, 'users', userId, 'memos');
    
    const newMemo = {
      text,
      createdAt: toFirebaseTimestamp(new Date()),
    };
    
    const docRef = await addDoc(memoCollection, newMemo);
    console.log('Memo created with ID:', docRef.id);
  } catch (error) {
    console.error('Error creating memo:', error);
    throw error;
  }
};

// Firebase에서 메모 업데이트
export const updateMemo = async (userId: string, memoId: string, text: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Updating memo in offline mode:', memoId);
    return;
  }

  try {
    console.log('Updating memo:', memoId);
    
    const memoDoc = doc(db, 'users', userId, 'memos', memoId);
    await updateDoc(memoDoc, {
      text,
    });
    
    console.log('Memo updated:', memoId);
  } catch (error) {
    console.error('Error updating memo:', error);
    throw error;
  }
};

// Firebase에서 메모 삭제
export const deleteMemo = async (userId: string, memoId: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Deleting memo in offline mode:', memoId);
    return;
  }

  try {
    console.log('Deleting memo:', memoId);
    
    const memoDoc = doc(db, 'users', userId, 'memos', memoId);
    await deleteDoc(memoDoc);
    
    console.log('Memo deleted:', memoId);
  } catch (error) {
    console.error('Error deleting memo:', error);
    throw error;
  }
};

// Firebase에서 메모 실시간 구독
export const subscribeToMemos = (userId: string, callback: (memos: Memo[]) => void): (() => void) => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Using offline mode for memos');
    callback([]);
    return () => console.log('No subscription to unsubscribe (offline mode)');
  }

  console.log('Subscribing to memos for user:', userId);
  
  const memoCollection = collection(db, 'users', userId, 'memos');
  const q = query(memoCollection, orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const memos: Memo[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const convertedData = convertFirestoreData(data);
      
      const memo: Memo = {
        id: doc.id,
        text: convertedData.text,
        createdAt: fromFirebaseTimestamp(convertedData.createdAt),
      };
      
      memos.push(memo);
    });
    
    console.log('Memos updated:', memos.length);
    callback(memos);
  }, (error) => {
    console.error('Error subscribing to memos:', error);
    callback([]);
  });
  
  return unsubscribe;
}; 