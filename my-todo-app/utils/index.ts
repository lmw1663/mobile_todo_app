import { Timestamp } from 'firebase/firestore';

// ID 생성
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 날짜 포맷팅
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ko-KR');
};

// 메모리 크기 포맷팅
export const formatMemorySize = (size: number): string => {
  return `${size.toFixed(1)}MB`;
};

// 프로세스 크기 계산
export const calculateProcessSize = (process: { 
  size: number; 
  lastUpdated: Date; 
  growthRate: number; 
}): number => {
  const now = new Date();
  const hoursSinceLastUpdate = (now.getTime() - process.lastUpdated.getTime()) / (1000 * 60 * 60);
  const sizeIncrease = hoursSinceLastUpdate * process.growthRate;
  return Math.max(process.size + sizeIncrease, process.size);
};

// 메모리 사용률 계산
export const calculateMemoryUsage = (usedCapacity: number, totalCapacity: number): number => {
  return Math.round((usedCapacity / totalCapacity) * 100);
};

// Firebase Timestamp 변환 유틸리티
export const toFirebaseTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

export const fromFirebaseTimestamp = (timestamp: any): Date => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

// Firestore 데이터 변환
export const convertFirestoreData = (data: any): any => {
  if (!data) return data;
  
  const converted = { ...data };
  
  // Date 필드들을 변환
  const dateFields = ['createdAt', 'lastUpdated', 'dueDate', 'startTime', 'endTime'];
  
  dateFields.forEach(field => {
    if (converted[field] && converted[field] !== 'infinity') {
      converted[field] = fromFirebaseTimestamp(converted[field]);
    }
  });
  
  return converted;
}; 