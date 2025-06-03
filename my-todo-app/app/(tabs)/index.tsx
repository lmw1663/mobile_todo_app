import React, { useState, useEffect } from 'react';
import { ScrollView, View, TextInput, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MemoryVisualization } from '@/components/MemoryVisualization';
import { TodoCard } from '@/components/TodoCard';
import UserProfile from '@/components/UserProfile';
import { Todo, MemorySpace, Goal, Counter, SleepLog, Memo } from '@/types';
import { createTodo, updateTodoStatus, subscribeToTodos } from '@/services/todoService';
import { subscribeToMemorySpaces, initializeMemorySpaces } from '@/services/memoryService';
import { subscribeToGoals } from '@/services/goalService';
import { subscribeToCounters } from '@/services/counterService';
import { subscribeToSleepLogs, getActiveSleep } from '@/services/sleepService';
import { subscribeToMemos } from '@/services/memoService';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [memorySpaces, setMemorySpaces] = useState<MemorySpace[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [activeSleep, setActiveSleep] = useState<SleepLog | null>(null);
  const [newTodoText, setNewTodoText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    const initializeApp = async () => {
      if (!user?.id) {
        console.log('사용자 정보 없음, 초기화 건너뛰기');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Firebase 초기화 시작...', user.id);
        
        // 메모리 공간 초기화 (처음 사용시)
        await initializeMemorySpaces(user.id);
        console.log('Memory spaces initialized for user:', user.id);

        // 활성 수면 상태 확인
        const activeSession = await getActiveSleep(user.id);
        setActiveSleep(activeSession);

        // 실시간 데이터 구독
        const unsubscribeTodos = subscribeToTodos(user.id, setTodos);
        const unsubscribeMemory = subscribeToMemorySpaces(user.id, setMemorySpaces);
        const unsubscribeGoals = subscribeToGoals(user.id, setGoals);
        const unsubscribeCounters = subscribeToCounters(user.id, setCounters);
        const unsubscribeSleep = subscribeToSleepLogs(user.id, setSleepLogs);
        const unsubscribeMemos = subscribeToMemos(user.id, setMemos);

        setIsLoading(false);

        // 컴포넌트 언마운트 시 구독 해제
        return () => {
          unsubscribeTodos();
          unsubscribeMemory();
          unsubscribeGoals();
          unsubscribeCounters();
          unsubscribeSleep();
          unsubscribeMemos();
        };
      } catch (error) {
        console.error('Firebase initialization error:', error);
        setError('Firebase 초기화 중 오류가 발생했습니다: ' + (error as Error).message);
        setIsLoading(false);
      }
    };

    const cleanup = initializeApp();
    
    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
  }, [user?.id]);

  const handleAddTodo = async () => {
    if (!newTodoText.trim() || !user?.id) return;

    try {
      console.log('Adding todo for user:', user.id, newTodoText);
      await createTodo(user.id, {
        text: newTodoText.trim(),
        dueDate: 'infinity',
        status: 'process',
        type: 'nodeadline',
        recurring: 0,
        stackCount: 0,
        overDueDate: false,
      });
      setNewTodoText('');
      console.log('Todo added successfully');
    } catch (error) {
      console.error('Error adding todo:', error);
      Alert.alert('오류', '할 일 추가에 실패했습니다: ' + (error as Error).message);
    }
  };

  const handleCompleteTodo = async (todoId: string) => {
    if (!user?.id) return;

    try {
      console.log('Completing todo:', todoId);
      await updateTodoStatus(user.id, todoId, 'done');
      console.log('Todo completed successfully');
    } catch (error) {
      console.error('Error completing todo:', error);
      Alert.alert('오류', '할 일 완료 처리에 실패했습니다: ' + (error as Error).message);
    }
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.errorTitle}>로그인 필요</ThemedText>
        <ThemedText style={styles.errorText}>로그인이 필요합니다.</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.errorTitle}>오류 발생</ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            setError(null);
            setIsLoading(true);
          }}
        >
          <ThemedText style={styles.retryButtonText}>다시 시도</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">로딩 중...</ThemedText>
        <ThemedText>사용자 데이터를 불러오고 있습니다...</ThemedText>
      </ThemedView>
    );
  }

  const activeTodos = todos.filter(todo => todo.status !== 'done');
  const completedTodos = todos.filter(todo => todo.status === 'done');
  const activeGoals = goals.filter(goal => !goal.isAchieved);
  const getTotalCounts = () => counters.reduce((sum, counter) => sum + counter.count, 0);
  const getRecentSleepHours = () => {
    const recentSleep = sleepLogs.filter(log => !log.isActive)[0];
    return recentSleep?.duration ? Math.floor(recentSleep.duration / 60) : 0;
  };

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        {/* 사용자 프로필 */}
        <UserProfile />

        <ThemedText type="title" style={styles.header}>
          📊 종합 대시보드
        </ThemedText>

        {/* 전체 통계 카드 */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeTodos.length}</Text>
            <Text style={styles.statLabel}>진행중 할일</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{activeGoals.length}</Text>
            <Text style={styles.statLabel}>활성 목표</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getTotalCounts()}</Text>
            <Text style={styles.statLabel}>총 카운트</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getRecentSleepHours()}h</Text>
            <Text style={styles.statLabel}>최근 수면</Text>
          </View>
        </View>

        {/* 메모리 시스템 시각화 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 메모리 현황</Text>
          <MemoryVisualization memorySpaces={memorySpaces} />
        </View>

        {/* 빠른 할 일 추가 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>➕ 빠른 할 일 추가</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="새로운 할 일을 입력하세요"
              value={newTodoText}
              onChangeText={setNewTodoText}
              multiline
            />
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddTodo}
            >
              <Text style={styles.addButtonText}>추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 현재 수면 상태 */}
        {activeSleep ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>😴 현재 수면 중</Text>
            <View style={styles.sleepStatusCard}>
              <Text style={styles.sleepTime}>
                시작: {activeSleep.startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.sleepDuration}>
                지속: {Math.floor((new Date().getTime() - activeSleep.startTime.getTime()) / (1000 * 60))}분
              </Text>
            </View>
          </View>
        ) : null}

        {/* 최근 활동 할 일 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 최근 할 일 ({activeTodos.length}개)</Text>
          {activeTodos.length === 0 ? (
            <Text style={styles.emptyText}>진행 중인 할 일이 없습니다!</Text>
          ) : (
            activeTodos.slice(0, 3).map(todo => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onComplete={() => handleCompleteTodo(todo.id)}
                onDelete={() => {}}
              />
            ))
          )}
          {activeTodos.length > 3 ? (
            <Text style={styles.moreText}>그 외 {activeTodos.length - 3}개 더...</Text>
          ) : null}
        </View>

        {/* 목표 현황 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 목표 현황</Text>
          {activeGoals.length === 0 ? (
            <Text style={styles.emptyText}>활성 목표가 없습니다.</Text>
          ) : (
            <View style={styles.goalsPreview}>
              {activeGoals.slice(0, 2).map(goal => (
                <View key={goal.id} style={styles.goalCard}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalDeadline}>
                    {goal.dueDate ? `마감: ${goal.dueDate.toLocaleDateString('ko-KR')}` : '기한 없음'}
                  </Text>
                </View>
              ))}
              {activeGoals.length > 2 ? (
                <Text style={styles.moreText}>그 외 {activeGoals.length - 2}개 더...</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* 카운터 요약 */}
        {counters.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 카운터 요약</Text>
            <View style={styles.countersPreview}>
              {counters.slice(0, 3).map(counter => (
                <View key={counter.id} style={styles.counterCard}>
                  <Text style={styles.counterName}>{counter.sort}</Text>
                  <Text style={styles.counterCount}>{counter.count}회</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* 메모 요약 */}
        {memos.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 최근 메모</Text>
            <View style={styles.memosPreview}>
              <Text style={styles.memoSummary}>
                총 {memos.length}개 메모 • 평균 {Math.round(memos.reduce((sum, memo) => sum + memo.text.length, 0) / memos.length)}자
              </Text>
              {memos.slice(0, 1).map(memo => (
                <View key={memo.id} style={styles.memoCard}>
                  <Text style={styles.memoText} numberOfLines={2}>
                    {memo.text}
                  </Text>
                  <Text style={styles.memoDate}>
                    {memo.createdAt.toLocaleDateString('ko-KR')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* 완료된 할 일 요약 */}
        {completedTodos.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ 최근 완료 ({completedTodos.length}개)</Text>
            <Text style={styles.completedSummary}>
              오늘 {completedTodos.filter(todo => 
                todo.createdAt.toDateString() === new Date().toDateString()
              ).length}개 완료하셨습니다! 🎉
            </Text>
          </View>
        ) : null}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    maxHeight: 100,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  sleepStatusCard: {
    backgroundColor: '#1a237e',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  sleepTime: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  sleepDuration: {
    color: '#9c27b0',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  moreText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  goalsPreview: {
    gap: 8,
  },
  goalCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  goalDeadline: {
    fontSize: 12,
    color: '#666',
  },
  countersPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  counterCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
  },
  counterName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  counterCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  memosPreview: {
    gap: 8,
  },
  memoSummary: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  memoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  memoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  memoDate: {
    fontSize: 12,
    color: '#666',
  },
  completedSummary: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '500',
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
