import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Todo, TodoStatus } from '@/types';
import { generateId, toFirebaseTimestamp, fromFirebaseTimestamp, convertFirestoreData } from '@/utils';
import { createProcess, deleteProcessByTodoId } from './memoryService';

// 더미 할 일 데이터
let todos: Todo[] = [
  {
    id: 'demo-todo-1',
    text: 'React Native 앱 개발',
    dueDate: 'infinity',
    status: 'process',
    type: 'nodeadline',
    recurring: 0,
    stackCount: 1,
    overDueDate: false,
    createdAt: new Date('2025-06-02'),
  },
  {
    id: 'demo-todo-2',
    text: 'Firebase 설정 완료',
    dueDate: new Date('2025-06-03'),
    status: 'done',
    type: 'deadline',
    recurring: 0,
    stackCount: 0,
    overDueDate: false,
    createdAt: new Date('2025-06-01'),
  },
  {
    id: 'demo-todo-3',
    text: 'UI 컴포넌트 디자인',
    dueDate: 'infinity',
    status: 'process',
    type: 'nodeadline',
    recurring: 0,
    stackCount: 2,
    overDueDate: false,
    createdAt: new Date('2025-06-02'),
  }
];

let subscribers: ((todos: Todo[]) => void)[] = [];

// Firebase 연결 체크
const checkFirebaseConnection = (): boolean => {
  if (!db) {
    console.warn('⚠️ Firebase not initialized, using offline mode');
    return false;
  }
  return true;
};

// Firebase에 할 일 생성
export const createTodo = async (userId: string, todoData: Omit<Todo, 'id' | 'createdAt'>): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Creating todo in offline mode:', todoData.text);
    return;
  }

  try {
    console.log('Creating todo for user:', userId, todoData.text);
    
    const todoCollection = collection(db, 'users', userId, 'todos');
    
    const newTodo = {
      ...todoData,
      createdAt: toFirebaseTimestamp(new Date()),
      dueDate: todoData.dueDate === 'infinity' ? 'infinity' : toFirebaseTimestamp(todoData.dueDate as Date),
    };
    
    const docRef = await addDoc(todoCollection, newTodo);
    console.log('Todo created with ID:', docRef.id);
    
    // 할 일이 'process' 상태일 때만 프로세스 생성
    if (todoData.status === 'process') {
      try {
        await createProcess(userId, docRef.id);
        console.log('Process created for todo:', docRef.id);
      } catch (processError) {
        console.error('Error creating process for todo:', processError);
        // 프로세스 생성 실패해도 할 일 생성은 유지
      }
    }
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
};

// Firebase에서 할 일 상태 업데이트
export const updateTodoStatus = async (userId: string, todoId: string, status: TodoStatus): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Updating todo status in offline mode:', todoId, status);
    return;
  }

  try {
    console.log('Updating todo status:', todoId, status);
    
    const todoDoc = doc(db, 'users', userId, 'todos', todoId);
    await updateDoc(todoDoc, {
      status,
    });
    
    // 할 일이 완료('done')되면 프로세스 삭제
    if (status === 'done') {
      try {
        await deleteProcessByTodoId(userId, todoId);
        console.log('Process deleted for completed todo:', todoId);
      } catch (processError) {
        console.error('Error deleting process for completed todo:', processError);
        // 프로세스 삭제 실패해도 할 일 상태 업데이트는 유지
      }
    }
    
    console.log('Todo status updated:', todoId);
  } catch (error) {
    console.error('Error updating todo status:', error);
    throw error;
  }
};

// Firebase에서 할 일 삭제
export const deleteTodo = async (userId: string, todoId: string): Promise<void> => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Deleting todo in offline mode:', todoId);
    return;
  }

  try {
    console.log('Deleting todo:', todoId);
    
    // 먼저 관련 프로세스 삭제
    try {
      await deleteProcessByTodoId(userId, todoId);
      console.log('Process deleted for todo:', todoId);
    } catch (processError) {
      console.error('Error deleting process for todo:', processError);
      // 프로세스 삭제 실패해도 할 일 삭제는 계속 진행
    }
    
    const todoDoc = doc(db, 'users', userId, 'todos', todoId);
    await deleteDoc(todoDoc);
    
    console.log('Todo deleted:', todoId);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

// Firebase에서 할 일 실시간 구독
export const subscribeToTodos = (userId: string, callback: (todos: Todo[]) => void): (() => void) => {
  if (!checkFirebaseConnection() || !db) {
    console.log('📱 Using offline mode for todos');
    // 오프라인 모드에서는 빈 배열 반환
    callback([]);
    return () => console.log('No subscription to unsubscribe (offline mode)');
  }

  console.log('Subscribing to todos for user:', userId);
  
  const todoCollection = collection(db, 'users', userId, 'todos');
  const q = query(todoCollection, orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const todos: Todo[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const convertedData = convertFirestoreData(data);
      
      const todo: Todo = {
        id: doc.id,
        text: convertedData.text,
        dueDate: convertedData.dueDate === 'infinity' ? 'infinity' : fromFirebaseTimestamp(convertedData.dueDate),
        status: convertedData.status,
        type: convertedData.type,
        recurring: convertedData.recurring,
        stackCount: convertedData.stackCount,
        overDueDate: convertedData.overDueDate,
        createdAt: fromFirebaseTimestamp(convertedData.createdAt),
        completed: convertedData.status === 'done',
      };
      
      todos.push(todo);
    });
    
    console.log('Todos updated:', todos.length);
    callback(todos);
  }, (error) => {
    console.error('Error subscribing to todos:', error);
    callback([]);
  });
  
  return unsubscribe;
}; 