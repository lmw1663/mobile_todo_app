import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyChcGZonMju-2r9g-YY7K_Tc_omzsLQkA0",
  authDomain: "todolistapp-e3641.firebaseapp.com",
  projectId: "todolistapp-e3641",
  storageBucket: "todolistapp-e3641.firebasestorage.app",
  messagingSenderId: "168244221281",
  appId: "1:168244221281:web:83cd8d26fe9d80b624e120",
  measurementId: "G-YX73GEWY69"
};

// Firebase 앱 초기화 (중복 방지)
let app;
let db;

try {
  // Firebase 앱이 이미 초기화되었는지 확인
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log('🔥 Firebase app initialized');
  } else {
    app = getApp();
    console.log('🔥 Firebase app already exists');
  }

  // Firestore 초기화
  db = getFirestore(app);
  console.log('🔥 Firestore initialized successfully');

} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  
  // 에러 발생 시 기본값 설정 (앱이 크래시되지 않도록)
  if (!app && getApps().length > 0) {
    app = getApp();
  }
  
  if (!db && app) {
    try {
      db = getFirestore(app);
    } catch (firestoreError) {
      console.error('❌ Firestore initialization error:', firestoreError);
    }
  }
}

// null 체크를 위한 안전한 export
const safeDb = db || null;

export { safeDb as db };
export default app; 