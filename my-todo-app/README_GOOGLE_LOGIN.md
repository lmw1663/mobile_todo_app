# Google 로그인 설정 가이드

## 1. Firebase 콘솔 설정

### 1-1. Firebase Console (https://console.firebase.google.com/)에 접속
1. 프로젝트 선택
2. Authentication > Sign-in method 이동
3. Google 제공업체 활성화

### 1-2. Web Client ID 가져오기
1. Project Settings > General 탭
2. 'Your apps' 섹션에서 웹 앱 확인
3. Web Client ID 복사

### 1-3. Android 설정 (필요시)
1. Project Settings > General 탭
2. Android 앱 추가 (com.yourcompany.mytodoapp)
3. google-services.json 다운로드
4. android/app/ 폴더에 배치

### 1-4. iOS 설정 (필요시)
1. Project Settings > General 탭  
2. iOS 앱 추가 (com.yourcompany.mytodoapp)
3. GoogleService-Info.plist 다운로드
4. ios/ 폴더에 배치

## 2. 코드 설정

### 2-1. services/authService.ts 업데이트
```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // iOS 필요시
});
```

## 3. 테스트

### 3-1. 웹 브라우저에서 테스트
```bash
npx expo start --web
```

### 3-2. 모바일에서 테스트
```bash
npx expo start
# QR 코드로 Expo Go 앱에서 테스트
```

## 4. 주의사항

- Web Client ID는 반드시 Firebase 콘솔에서 가져온 실제 값으로 교체
- Android/iOS 배포 시 각각의 설정 파일 필요
- SHA-1 핑거프린트 등록 (Android 배포 시)

## 5. 오류 해결

### "Developer Error" 발생 시
- Web Client ID가 올바른지 확인
- Firebase 프로젝트 설정 다시 확인

### 로그인 후 사용자 정보가 없을 시
- Firebase Auth 규칙 확인
- 네트워크 연결 상태 확인

## 현재 상태

✅ Google SignIn 패키지 설치 완료
✅ 로그인 화면 구글 로그인으로 변경 완료
✅ Auth 서비스 구글 로그인으로 변경 완료
✅ UserProfile 컴포넌트 업데이트 완료
⚠️ Firebase 콘솔에서 Web Client ID 설정 필요 