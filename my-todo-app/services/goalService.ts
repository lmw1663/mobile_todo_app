import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Goal } from '@/types';
import { toFirebaseTimestamp, fromFirebaseTimestamp, convertFirestoreData } from '@/utils';

// Firebase 연결 체크
const checkFirebaseConnection = (): boolean => {
  if (!db) {
    console.warn('⚠️ Firebase not initialized, using offline mode');
    return false;
  }
  return true;
};

// Firebase에 목표 생성
export const createGoal = async (userId: string, goalData: Omit<Goal, 'id' | 'createdAt'>): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Creating goal in offline mode:', goalData.title);
    return;
  }

  try {
    console.log('Creating goal for user:', userId, goalData.title);
    
    const goalCollection = collection(db, 'users', userId, 'goals');
    
    const newGoal = {
      ...goalData,
      createdAt: toFirebaseTimestamp(new Date()),
      dueDate: toFirebaseTimestamp(goalData.dueDate),
    };
    
    const docRef = await addDoc(goalCollection, newGoal);
    console.log('Goal created with ID:', docRef.id);
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

// Firebase에서 목표 달성 상태 업데이트
export const updateGoalAchievement = async (userId: string, goalId: string, isAchieved: boolean): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Updating goal achievement in offline mode:', goalId, isAchieved);
    return;
  }

  try {
    console.log('Updating goal achievement:', goalId, isAchieved);
    
    const goalDoc = doc(db, 'users', userId, 'goals', goalId);
    await updateDoc(goalDoc, {
      isAchieved,
    });
    
    console.log('Goal achievement updated:', goalId);
  } catch (error) {
    console.error('Error updating goal achievement:', error);
    throw error;
  }
};

// Firebase에서 목표 삭제
export const deleteGoal = async (userId: string, goalId: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Deleting goal in offline mode:', goalId);
    return;
  }

  try {
    console.log('Deleting goal:', goalId);
    
    const goalDoc = doc(db, 'users', userId, 'goals', goalId);
    await deleteDoc(goalDoc);
    
    console.log('Goal deleted:', goalId);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

// Firebase에서 목표 실시간 구독
export const subscribeToGoals = (userId: string, callback: (goals: Goal[]) => void): (() => void) => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Using offline mode for goals');
    callback([]);
    return () => console.log('No subscription to unsubscribe (offline mode)');
  }

  console.log('Subscribing to goals for user:', userId);
  
  const goalCollection = collection(db, 'users', userId, 'goals');
  const q = query(goalCollection, orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const goals: Goal[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const convertedData = convertFirestoreData(data);
      
      const goal: Goal = {
        id: doc.id,
        title: convertedData.title,
        isAchieved: convertedData.isAchieved,
        dueDate: fromFirebaseTimestamp(convertedData.dueDate),
        createdAt: fromFirebaseTimestamp(convertedData.createdAt),
      };
      
      goals.push(goal);
    });
    
    console.log('Goals updated:', goals.length);
    callback(goals);
  }, (error) => {
    console.error('Error subscribing to goals:', error);
    callback([]);
  });
  
  return unsubscribe;
}; 