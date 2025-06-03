import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, setDoc, getDoc, getDocs, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { MemorySpace, Process } from '@/types';
import { generateId, toFirebaseTimestamp, fromFirebaseTimestamp, convertFirestoreData } from '@/utils';

// 더미 메모리 공간 데이터
let memorySpaces: MemorySpace[] = [
  {
    id: 'memory-space-1',
    name: 'memory',
    memory: {
      totalCapacity: 1000,
      usedCapacity: 350,
      isFull: false,
      lastUpdated: new Date(),
    }
  },
  {
    id: 'memory-space-2', 
    name: 'hwvm',
    memory: {
      totalCapacity: 500,
      usedCapacity: 120,
      isFull: false,
      lastUpdated: new Date(),
    }
  }
];

// 더미 프로세스 데이터
let processes: Process[] = [
  {
    id: 'process-1',
    todoId: 'demo-todo-1',
    memorySpaceId: 'memory-space-1',
    createdAt: new Date('2025-06-02'),
    size: 150,
    growthRate: 0.5,
    lastUpdated: new Date(),
  },
  {
    id: 'process-2',
    todoId: 'demo-todo-3',
    memorySpaceId: 'memory-space-1',
    createdAt: new Date('2025-06-02'),
    size: 200,
    growthRate: 0.5,
    lastUpdated: new Date(),
  }
];

let memorySubscribers: ((memorySpaces: MemorySpace[]) => void)[] = [];
let processSubscribers: ((processes: Process[]) => void)[] = [];

// Firebase 연결 체크
const checkFirebaseConnection = (): boolean => {
  if (!db) {
    console.warn('⚠️ Firebase not initialized, using offline mode');
    return false;
  }
  return true;
};

// Firebase에서 메모리 공간 초기화
export const initializeMemorySpaces = async (userId: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Initializing memory spaces in offline mode for user:', userId);
    return;
  }

  try {
    console.log('Initializing memory spaces for user:', userId);
    
    // 메모리 공간이 이미 존재하는지 확인
    const memorySpacesRef = collection(db, 'users', userId, 'memorySpaces');
    const snapshot = await getDocs(memorySpacesRef);
    
    if (snapshot.empty) {
      console.log('Creating initial memory spaces...');
      
      // 메인 메모리 공간 생성 (100MB)
      const memorySpace: Omit<MemorySpace, 'id'> = {
        name: 'memory',
        memory: {
          totalCapacity: 100, // 100MB로 변경
          usedCapacity: 0,
          isFull: false,
          lastUpdated: new Date(),
        }
      };
      
      // HWVM 메모리 공간 생성 (50MB)
      const hwvmSpace: Omit<MemorySpace, 'id'> = {
        name: 'hwvm',
        memory: {
          totalCapacity: 50, // 50MB로 변경
          usedCapacity: 0,
          isFull: false,
          lastUpdated: new Date(),
        }
      };
      
      // Firebase에 저장
      await addDoc(memorySpacesRef, {
        ...memorySpace,
        memory: {
          ...memorySpace.memory,
          lastUpdated: toFirebaseTimestamp(memorySpace.memory.lastUpdated),
        }
      });
      
      await addDoc(memorySpacesRef, {
        ...hwvmSpace,
        memory: {
          ...hwvmSpace.memory,
          lastUpdated: toFirebaseTimestamp(hwvmSpace.memory.lastUpdated),
        }
      });
      
      console.log('Initial memory spaces created - Memory: 100MB, HWVM: 50MB');
    } else {
      console.log('Memory spaces already exist');
    }
  } catch (error) {
    console.error('Error initializing memory spaces:', error);
    throw error;
  }
};

// Firebase에 프로세스 생성
export const createProcess = async (userId: string, todoId: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Creating process in offline mode for todo:', todoId);
    return;
  }

  try {
    console.log('Creating process for todo:', todoId);
    
    // 메모리 공간 찾기 (기본적으로 memory 공간 사용)
    const memorySpacesRef = collection(db, 'users', userId, 'memorySpaces');
    const memoryQuery = query(memorySpacesRef, where('name', '==', 'memory'));
    const memorySnapshot = await getDocs(memoryQuery);
    
    if (memorySnapshot.empty) {
      throw new Error('Memory space not found');
    }
    
    const memorySpaceDoc = memorySnapshot.docs[0];
    const memorySpaceId = memorySpaceDoc.id;
    
    // 프로세스 생성 (웹앱과 동일한 크기)
    const processesRef = collection(db, 'users', userId, 'processes');
    const newProcess = {
      todoId,
      memorySpaceId,
      createdAt: toFirebaseTimestamp(new Date()),
      size: 10, // 웹앱과 동일하게 10MB로 변경
      growthRate: 0.5,
      lastUpdated: toFirebaseTimestamp(new Date()),
    };
    
    const docRef = await addDoc(processesRef, newProcess);
    console.log('Process created with ID:', docRef.id, '- Size: 10MB');
    
    // 메모리 사용량 업데이트
    const memoryData = memorySpaceDoc.data();
    const newUsedCapacity = memoryData.memory.usedCapacity + newProcess.size;
    
    await updateDoc(memorySpaceDoc.ref, {
      'memory.usedCapacity': newUsedCapacity,
      'memory.isFull': newUsedCapacity >= memoryData.memory.totalCapacity,
      'memory.lastUpdated': toFirebaseTimestamp(new Date()),
    });
    
  } catch (error) {
    console.error('Error creating process:', error);
    throw error;
  }
};

// Firebase에서 프로세스 삭제 (할 일 완료/삭제시)
export const deleteProcessByTodoId = async (userId: string, todoId: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Deleting process in offline mode for todo:', todoId);
    return;
  }

  try {
    console.log('Deleting process for todo:', todoId);
    
    // 해당 todoId를 가진 프로세스 찾기
    const processesRef = collection(db, 'users', userId, 'processes');
    const processQuery = query(processesRef, where('todoId', '==', todoId));
    const processSnapshot = await getDocs(processQuery);
    
    if (!processSnapshot.empty) {
      const processDoc = processSnapshot.docs[0];
      const processData = processDoc.data();
      
      // 메모리 사용량 업데이트
      const memorySpaceRef = doc(db, 'users', userId, 'memorySpaces', processData.memorySpaceId);
      const memorySpaceDoc = await getDoc(memorySpaceRef);
      
      if (memorySpaceDoc.exists()) {
        const memoryData = memorySpaceDoc.data();
        const newUsedCapacity = Math.max(0, memoryData.memory.usedCapacity - processData.size);
        
        await updateDoc(memorySpaceRef, {
          'memory.usedCapacity': newUsedCapacity,
          'memory.isFull': newUsedCapacity >= memoryData.memory.totalCapacity,
          'memory.lastUpdated': toFirebaseTimestamp(new Date()),
        });
      }
      
      // 프로세스 삭제
      await deleteDoc(processDoc.ref);
      console.log('Process deleted:', processDoc.id);
    }
  } catch (error) {
    console.error('Error deleting process:', error);
    throw error;
  }
};

// Firebase에서 메모리 공간 실시간 구독
export const subscribeToMemorySpaces = (userId: string, callback: (memorySpaces: MemorySpace[]) => void): (() => void) => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Using offline mode for memory spaces');
    // 오프라인 모드에서는 빈 배열 반환
    callback([]);
    return () => console.log('No subscription to unsubscribe (offline mode)');
  }

  console.log('Subscribing to memory spaces for user:', userId);
  
  const memorySpacesRef = collection(db, 'users', userId, 'memorySpaces');
  const q = query(memorySpacesRef, orderBy('name'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const memorySpaces: MemorySpace[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const convertedData = convertFirestoreData(data);
      
      const memorySpace: MemorySpace = {
        id: doc.id,
        name: convertedData.name,
        memory: {
          totalCapacity: convertedData.memory.totalCapacity,
          usedCapacity: convertedData.memory.usedCapacity,
          isFull: convertedData.memory.isFull,
          lastUpdated: fromFirebaseTimestamp(convertedData.memory.lastUpdated),
        }
      };
      
      memorySpaces.push(memorySpace);
    });
    
    console.log('Memory spaces updated:', memorySpaces.length);
    callback(memorySpaces);
  }, (error) => {
    console.error('Error subscribing to memory spaces:', error);
    callback([]);
  });
  
  return unsubscribe;
};

// Firebase에서 프로세스 실시간 구독
export const subscribeToProcesses = (userId: string, callback: (processes: Process[]) => void): (() => void) => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Using offline mode for processes');
    // 오프라인 모드에서는 빈 배열 반환
    callback([]);
    return () => console.log('No subscription to unsubscribe (offline mode)');
  }

  console.log('Subscribing to processes for user:', userId);
  
  const processesRef = collection(db, 'users', userId, 'processes');
  const q = query(processesRef, orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const processes: Process[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const convertedData = convertFirestoreData(data);
      
      const process: Process = {
        id: doc.id,
        todoId: convertedData.todoId,
        memorySpaceId: convertedData.memorySpaceId,
        createdAt: fromFirebaseTimestamp(convertedData.createdAt),
        size: convertedData.size,
        growthRate: convertedData.growthRate,
        lastUpdated: fromFirebaseTimestamp(convertedData.lastUpdated),
      };
      
      processes.push(process);
    });
    
    console.log('Processes updated:', processes.length);
    callback(processes);
  }, (error) => {
    console.error('Error subscribing to processes:', error);
    callback([]);
  });
  
  return unsubscribe;
}; 