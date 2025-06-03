// 사용자 및 프로필
export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface UserProfile {
  name: string;
  createdAt: Date;
}

// 메모리 시스템
export interface Memory {
  totalCapacity: number;  // 총 메모리 용량
  usedCapacity: number;   // 현재 사용 중인 용량
  isFull: boolean;        // 메모리가 가득 찼는지 여부
  lastUpdated: Date;      // 마지막 업데이트 시간
}

export interface MemorySpace {
  id: string;             // 메모리 공간 ID
  name: string;           // 메모리 이름 ("memory" | "hwvm")
  memory: Memory;         // 메모리 정보
}

export interface Process {
  id: string;             // 프로세스 ID
  todoId: string;         // 연결된 Todo의 ID
  memorySpaceId: string;  // 소속된 메모리 공간 ID
  createdAt: Date;        // 프로세스 생성 시간
  size: number;           // 현재 프로세스 크기
  growthRate: number;     // 시간당 크기 증가율 (0.5)
  lastUpdated: Date;      // 마지막 업데이트 시간
}

// 할 일 관리
export type TodoStatus = "process" | "virtual" | "done";
export type TodoType = "deadline" | "nodeadline" | "recurring";

export interface Todo {
  id: string;
  text: string;
  dueDate: Date | "infinity";
  status: TodoStatus;
  type: TodoType;
  recurring: number;      // 0이면 반복 없음, 숫자면 일주일에 몇 번 반복
  stackCount: number;
  overDueDate: boolean;
  createdAt: Date;
  completed?: boolean;    // UI를 위한 필드
}

// 수면 추적
export interface SleepLog {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;  // 분 단위로 계산
  isActive?: boolean; // 현재 수면 중인지
}

export interface Counter {
  id: string;
  sort: string;      // 예: "cigarette", "coffee", "exercise" 등
  count: number;
  createdAt: Date;
}

// 기타
export interface Memo {
  id: string;
  text: string;
  content?: string;       // 세부사항
  createdAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  isAchieved: boolean;
  dueDate: Date;
  createdAt: Date;
}

export interface Penalty {
  isLocked: boolean;
  reason: string;
}

export interface Meta {
  sleepTrackingEnabled: boolean;
} 