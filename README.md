# Todo List Mobile App

MOBILE_APP_SPECIFICATION.md를 기반으로 구현한 React Native(Expo) Todo 앱입니다.

## 🚀 주요 기능

### 📱 현재 구현된 기능
- ✅ **메모리 시스템 시각화**: 할 일을 가상 메모리 공간에서 프로세스로 관리
- ✅ **할 일 관리**: CRUD 기능, 상태 관리 (process, virtual, done)
- ✅ **실시간 동기화**: Firebase Firestore를 통한 실시간 데이터 업데이트
- ✅ **반응형 UI**: 모던한 디자인의 카드 기반 인터페이스
- ✅ **탭 네비게이션**: Dashboard, Calendar, Record, Profile

### 🔄 향후 구현 예정
- 🔲 인증 시스템 (로그인/회원가입)
- 🔲 수면 사이클 추적
- 🔲 목표 및 메모 관리
- 🔲 캘린더 기능
- 🔲 푸시 알림

## 📁 프로젝트 구조

```
mobile_todo_app/my-todo-app/
├── app/
│   ├── (tabs)/              # 탭 기반 네비게이션
│   │   ├── index.tsx        # Dashboard (메인 화면)
│   │   ├── calendar.tsx     # 캘린더
│   │   ├── record.tsx       # 기록
│   │   └── profile.tsx      # 프로필
│   └── _layout.tsx          # 루트 레이아웃
├── components/
│   ├── MemoryVisualization.tsx  # 메모리 시스템 시각화
│   ├── TodoCard.tsx            # 할 일 카드 컴포넌트
│   └── ui/                     # 공통 UI 컴포넌트
├── config/
│   └── firebase.ts            # Firebase 설정
├── services/
│   ├── authService.ts         # 인증 서비스
│   ├── todoService.ts         # 할 일 관리 서비스
│   └── memoryService.ts       # 메모리 시스템 서비스
├── types/
│   └── index.ts               # TypeScript 타입 정의
├── utils/
│   └── index.ts               # 유틸리티 함수들
└── package.json
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치
```bash
cd mobile_todo_app/my-todo-app
npm install
```

### 2. 앱 실행
```bash
npm start
```

### 3. 플랫폼별 실행
```bash
# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# 웹 브라우저
npm run web
```

## 🔧 주요 기술 스택

- **Frontend**: React Native (Expo)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Navigation**: Expo Router
- **State Management**: React Hooks
- **UI**: React Native Components + Custom Styling

## 🧠 핵심 컨셉: 메모리 시스템

이 앱의 독특한 특징은 할 일을 컴퓨터의 **프로세스**로 취급하는 것입니다:

- **메모리 공간**: `memory` (1000MB), `hwvm` (500MB)
- **프로세스**: 할 일이 생성되면 메모리 공간에서 프로세스로 실행
- **메모리 증가**: 시간이 지날수록 프로세스 크기가 증가 (시간당 0.5MB)
- **메모리 부족**: 메모리가 가득 차면 경고 표시

### 메모리 시스템 로직
```typescript
// 프로세스 크기 계산
const calculateProcessSize = (process) => {
  const hoursSinceLastUpdate = (now - process.lastUpdated) / (1000 * 60 * 60);
  const sizeIncrease = hoursSinceLastUpdate * 0.5; // 시간당 0.5MB 증가
  return process.size + sizeIncrease;
};
```

## 🎨 UI/UX 특징

### 색상 팔레트
- **Primary**: #3b82f6 (파란색)
- **Success**: #10b981 (초록색) 
- **Warning**: #f59e0b (주황색)
- **Danger**: #ef4444 (빨간색)

### 메모리 시각화
```
┌─ 메모리 시스템 ─────────┐
│ memory: 1000MB         │
│ ████████░░ 80%         │
│                        │
│ hwvm: 500MB            │
│ ██████░░░░ 60%         │
└────────────────────────┘
```

### 할 일 카드
```
┌─────────────────────────────┐
│ 📝 프로젝트 완료            │
│ 🕐 2024.12.31 마감         │
│ 💾 memory 공간에서 실행 중  │
│ [완료] [삭제]              │
└─────────────────────────────┘
```

## 🔥 Firebase 설정

현재 앱은 다음 Firebase 프로젝트에 연결되어 있습니다:
- **Project ID**: todolistapp-e3641
- **Auth Domain**: todolistapp-e3641.firebaseapp.com

### Firestore 컬렉션 구조
```
users/{userId}/
├── todos/           # 할 일들
├── memorySpaces/    # 메모리 공간들 (memory, hwvm)
├── processes/       # 프로세스들
├── sleepLogs/       # 수면 기록들 (향후 구현)
├── counters/        # 카운터들 (향후 구현)
├── goals/           # 목표들 (향후 구현)
└── memos/           # 메모들 (향후 구현)
```

## 📱 사용법

### 1. 할 일 추가
1. 메인 화면에서 텍스트 입력란에 할 일 내용 입력
2. "추가" 버튼 클릭
3. 자동으로 `memory` 공간에서 프로세스로 실행됨

### 2. 메모리 상태 확인
- 상단의 메모리 시각화에서 현재 사용량 확인
- 프로그레스 바로 메모리 사용률 표시
- 메모리가 가득 차면 빨간색으로 경고

### 3. 할 일 완료
- 할 일 카드의 "완료" 버튼 클릭
- 상태가 `done`으로 변경되고 관련 프로세스 삭제
- 메모리 사용량 감소

## 🐛 알려진 이슈

1. **임시 사용자**: 현재 인증 없이 `demo-user-123` 사용자로 고정
2. **프로세스 크기 업데이트**: 실시간 크기 증가 미구현
3. **오프라인 지원**: 네트워크 연결 필요

## 🤝 기여하기

1. 이 프로젝트를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

## 📄 라이선스

MIT License

---

**개발자**: Claude AI Assistant  
**기반 스펙**: MOBILE_APP_SPECIFICATION.md  
**프레임워크**: React Native (Expo)  
**백엔드**: Firebase
