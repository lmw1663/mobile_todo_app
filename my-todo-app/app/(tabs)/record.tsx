import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { subscribeToGoals, createGoal, updateGoalAchievement, deleteGoal } from '@/services/goalService';
import { subscribeToCounters, createCounter, incrementCounter, decrementCounter, deleteCounter } from '@/services/counterService';
import { subscribeToMemos, createMemo, updateMemo, deleteMemo } from '@/services/memoService';
import { subscribeToSleepLogs, startSleep, endSleep, deleteSleepLog, getActiveSleep } from '@/services/sleepService';
import { getCurrentUser } from '@/services/authService';
import { Goal, Counter, Memo, SleepLog } from '@/types';

export default function RecordScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [activeSleep, setActiveSleep] = useState<SleepLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'goals' | 'counters' | 'memos' | 'sleep'>('goals');

  // 폼 상태들
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newCounterSort, setNewCounterSort] = useState('');
  const [newMemoText, setNewMemoText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          Alert.alert('오류', '사용자가 로그인되지 않았습니다.');
          return;
        }

        // 활성 수면 상태 확인
        const activeSession = await getActiveSleep(user.id);
        setActiveSleep(activeSession);

        // 실시간 구독 설정
        const unsubscribeGoals = subscribeToGoals(user.id, setGoals);
        const unsubscribeCounters = subscribeToCounters(user.id, setCounters);
        const unsubscribeMemos = subscribeToMemos(user.id, setMemos);
        const unsubscribeSleep = subscribeToSleepLogs(user.id, setSleepLogs);

        setLoading(false);

        return () => {
          unsubscribeGoals();
          unsubscribeCounters();
          unsubscribeMemos();
          unsubscribeSleep();
        };
      } catch (error) {
        console.error('Error initializing record data:', error);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // 목표 관련 함수들
  const handleCreateGoal = async () => {
    if (!newGoalTitle.trim()) {
      Alert.alert('오류', '목표 제목을 입력해주세요.');
      return;
    }

    try {
      const user = getCurrentUser();
      if (!user) return;

      // 한 달 후 마감일 설정
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);

      await createGoal(user.id, {
        title: newGoalTitle.trim(),
        isAchieved: false,
        dueDate: dueDate,
      });
      setNewGoalTitle('');
      setShowAddForm(false);
      Alert.alert('성공', '목표가 생성되었습니다!');
    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('오류', '목표 생성에 실패했습니다.');
    }
  };

  const handleToggleGoal = async (goalId: string, currentStatus: boolean) => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      await updateGoalAchievement(user.id, goalId, !currentStatus);
    } catch (error) {
      console.error('Error toggling goal:', error);
      Alert.alert('오류', '목표 상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteGoal = async (goalId: string, goalTitle: string) => {
    Alert.alert(
      '목표 삭제',
      `"${goalTitle}" 목표를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = getCurrentUser();
              if (!user) return;

              await deleteGoal(user.id, goalId);
              Alert.alert('성공', '목표가 삭제되었습니다.');
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('오류', '목표 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 카운터 관련 함수들
  const handleCreateCounter = async () => {
    if (!newCounterSort.trim()) {
      Alert.alert('오류', '카운터 이름을 입력해주세요.');
      return;
    }

    try {
      const user = getCurrentUser();
      if (!user) return;

      await createCounter(user.id, newCounterSort.trim());
      setNewCounterSort('');
      setShowAddForm(false);
      Alert.alert('성공', '카운터가 생성되었습니다!');
    } catch (error) {
      console.error('Error creating counter:', error);
      Alert.alert('오류', '카운터 생성에 실패했습니다.');
    }
  };

  const handleIncrement = async (counterId: string) => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      await incrementCounter(user.id, counterId);
    } catch (error) {
      console.error('Error incrementing counter:', error);
      Alert.alert('오류', '카운터 증가에 실패했습니다.');
    }
  };

  const handleDecrement = async (counterId: string) => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      await decrementCounter(user.id, counterId);
    } catch (error) {
      console.error('Error decrementing counter:', error);
      Alert.alert('오류', '카운터 감소에 실패했습니다.');
    }
  };

  const handleDeleteCounter = async (counterId: string, counterSort: string) => {
    Alert.alert(
      '카운터 삭제',
      `"${counterSort}" 카운터를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = getCurrentUser();
              if (!user) return;

              await deleteCounter(user.id, counterId);
              Alert.alert('성공', '카운터가 삭제되었습니다.');
            } catch (error) {
              console.error('Error deleting counter:', error);
              Alert.alert('오류', '카운터 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 메모 관련 함수들
  const handleCreateMemo = async () => {
    if (!newMemoText.trim()) {
      Alert.alert('오류', '메모 내용을 입력해주세요.');
      return;
    }

    try {
      const user = getCurrentUser();
      if (!user) return;

      await createMemo(user.id, newMemoText.trim());
      setNewMemoText('');
      setShowAddForm(false);
      Alert.alert('성공', '메모가 생성되었습니다!');
    } catch (error) {
      console.error('Error creating memo:', error);
      Alert.alert('오류', '메모 생성에 실패했습니다.');
    }
  };

  const handleDeleteMemo = async (memoId: string, memoText: string) => {
    Alert.alert(
      '메모 삭제',
      `"${memoText.substring(0, 30)}..." 메모를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = getCurrentUser();
              if (!user) return;

              await deleteMemo(user.id, memoId);
              Alert.alert('성공', '메모가 삭제되었습니다.');
            } catch (error) {
              console.error('Error deleting memo:', error);
              Alert.alert('오류', '메모 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 수면 관련 함수들
  const handleStartSleep = async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;

      const sleepId = await startSleep(user.id);
      if (sleepId) {
        Alert.alert('수면 시작', '수면 추적을 시작했습니다. 잠들기 전에 폰을 내려놓으세요! 😴');
        const activeSession = await getActiveSleep(user.id);
        setActiveSleep(activeSession);
      }
    } catch (error) {
      console.error('Error starting sleep:', error);
      Alert.alert('오류', '수면 시작에 실패했습니다.');
    }
  };

  const handleEndSleep = async () => {
    if (!activeSleep) return;

    Alert.alert(
      '수면 종료',
      '수면 추적을 종료하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '종료',
          onPress: async () => {
            try {
              const user = getCurrentUser();
              if (!user) return;

              await endSleep(user.id, activeSleep.id);
              setActiveSleep(null);
              Alert.alert('수면 종료', '수면 추적이 완료되었습니다! 좋은 아침이에요! ☀️');
            } catch (error) {
              console.error('Error ending sleep:', error);
              Alert.alert('오류', '수면 종료에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteSleepLog = async (sleepId: string, startTime: Date) => {
    Alert.alert(
      '수면 기록 삭제',
      `${startTime.toLocaleDateString('ko-KR')} 수면 기록을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = getCurrentUser();
              if (!user) return;

              await deleteSleepLog(user.id, sleepId);
              Alert.alert('성공', '수면 기록이 삭제되었습니다.');
            } catch (error) {
              console.error('Error deleting sleep log:', error);
              Alert.alert('오류', '수면 기록 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  // 유틸리티 함수들
  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('ko-KR') + ' ' + date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  const getCounterIcon = (sort: string) => {
    const lowerSort = sort.toLowerCase();
    if (lowerSort.includes('담배') || lowerSort.includes('cigarette')) return '🚬';
    if (lowerSort.includes('커피') || lowerSort.includes('coffee')) return '☕';
    if (lowerSort.includes('운동') || lowerSort.includes('exercise')) return '💪';
    if (lowerSort.includes('물') || lowerSort.includes('water')) return '💧';
    if (lowerSort.includes('독서') || lowerSort.includes('book')) return '📚';
    if (lowerSort.includes('공부') || lowerSort.includes('study')) return '📖';
    if (lowerSort.includes('음주') || lowerSort.includes('alcohol')) return '🍺';
    return '📊';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>기록 관리</Text>
        <Text style={styles.loading}>로딩 중...</Text>
      </View>
    );
  }

  const renderAddForm = () => {
    if (!showAddForm) return null;

    return (
      <View style={styles.addForm}>
        {activeTab === 'goals' && (
          <>
            <Text style={styles.formTitle}>새 목표 추가</Text>
            <TextInput
              style={styles.textInput}
              placeholder="목표를 입력하세요"
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
            />
            <TouchableOpacity style={styles.createButton} onPress={handleCreateGoal}>
              <Text style={styles.createButtonText}>목표 생성</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'counters' && (
          <>
            <Text style={styles.formTitle}>새 카운터 추가</Text>
            <TextInput
              style={styles.textInput}
              placeholder="카운터 이름을 입력하세요 (예: 담배, 커피)"
              value={newCounterSort}
              onChangeText={setNewCounterSort}
            />
            <TouchableOpacity style={styles.createButton} onPress={handleCreateCounter}>
              <Text style={styles.createButtonText}>카운터 생성</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'memos' && (
          <>
            <Text style={styles.formTitle}>새 메모 추가</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              placeholder="메모 내용을 입력하세요..."
              value={newMemoText}
              onChangeText={setNewMemoText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.createButton} onPress={handleCreateMemo}>
              <Text style={styles.createButtonText}>메모 생성</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  const renderGoals = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>🎯 목표 목록 ({goals.length}개)</Text>
      {goals.length === 0 ? (
        <Text style={styles.emptyText}>아직 목표가 없습니다. 첫 번째 목표를 추가해보세요!</Text>
      ) : (
        goals.map((goal) => (
          <View key={goal.id} style={[styles.itemCard, goal.isAchieved && styles.achievedCard]}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemTitle, goal.isAchieved && styles.achievedText]}>
                {goal.isAchieved ? '✅' : '🎯'} {goal.title}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteGoal(goal.id, goal.title)}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.itemDate}>
              마감: {goal.dueDate.toLocaleDateString('ko-KR')}
            </Text>
            <TouchableOpacity
              style={[styles.toggleButton, goal.isAchieved && styles.achievedToggleButton]}
              onPress={() => handleToggleGoal(goal.id, goal.isAchieved)}
            >
              <Text style={styles.toggleButtonText}>
                {goal.isAchieved ? '달성 취소' : '달성 완료'}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  const renderCounters = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>📊 카운터 목록 ({counters.length}개)</Text>
      {counters.length === 0 ? (
        <Text style={styles.emptyText}>아직 카운터가 없습니다. 첫 번째 카운터를 추가해보세요!</Text>
      ) : (
        counters.map((counter) => (
          <View key={counter.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.counterInfo}>
                <Text style={styles.counterIcon}>{getCounterIcon(counter.sort)}</Text>
                <Text style={styles.itemTitle}>{counter.sort}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteCounter(counter.id, counter.sort)}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.counterControls}>
              <TouchableOpacity
                style={styles.decrementButton}
                onPress={() => handleDecrement(counter.id)}
              >
                <Text style={styles.controlButtonText}>➖</Text>
              </TouchableOpacity>
              
              <View style={styles.countDisplay}>
                <Text style={styles.countNumber}>{counter.count}</Text>
                <Text style={styles.countLabel}>회</Text>
              </View>
              
              <TouchableOpacity
                style={styles.incrementButton}
                onPress={() => handleIncrement(counter.id)}
              >
                <Text style={styles.controlButtonText}>➕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderMemos = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>📝 메모 목록 ({memos.length}개)</Text>
      {memos.length === 0 ? (
        <Text style={styles.emptyText}>아직 메모가 없습니다. 첫 번째 메모를 추가해보세요!</Text>
      ) : (
        memos.map((memo) => (
          <View key={memo.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemDate}>
                {formatDateTime(memo.createdAt)}
              </Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteMemo(memo.id, memo.text)}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.memoText}>{memo.text}</Text>
            <Text style={styles.memoStats}>
              📝 {memo.text.length}자 • 📖 {memo.text.split('\n').length}줄
            </Text>
          </View>
        ))
      )}
    </View>
  );

  const renderSleep = () => (
    <View style={styles.contentSection}>
      <Text style={styles.sectionTitle}>😴 수면 기록 ({sleepLogs.filter(log => !log.isActive).length}개)</Text>
      
      {/* 현재 수면 상태 */}
      {activeSleep ? (
        <View style={styles.activeSleepCard}>
          <Text style={styles.activeSleepTitle}>🌙 현재 수면 중</Text>
          <Text style={styles.activeSleepTime}>
            시작: {formatDateTime(activeSleep.startTime)}
          </Text>
          <TouchableOpacity style={styles.endSleepButton} onPress={handleEndSleep}>
            <Text style={styles.endSleepButtonText}>🌅 수면 종료</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.startSleepButton} onPress={handleStartSleep}>
          <Text style={styles.startSleepButtonText}>🛌 수면 시작</Text>
        </TouchableOpacity>
      )}

      {/* 수면 기록 목록 */}
      {sleepLogs.filter(log => !log.isActive).length === 0 ? (
        <Text style={styles.emptyText}>아직 수면 기록이 없습니다. 첫 번째 수면을 추적해보세요!</Text>
      ) : (
        sleepLogs
          .filter(log => !log.isActive)
          .map((log) => (
            <View key={log.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.sleepDate}>
                  😴 {formatDateTime(log.startTime)}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteSleepLog(log.id, log.startTime)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
              {log.endTime && (
                <Text style={styles.sleepEndTime}>
                  종료: {formatDateTime(log.endTime)}
                </Text>
              )}
              {log.duration && (
                <Text style={styles.sleepDuration}>
                  ⏱️ {formatDuration(log.duration)}
                </Text>
              )}
            </View>
          ))
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📋 기록 관리</Text>

      {/* 탭 네비게이션 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
          onPress={() => {
            setActiveTab('goals');
            setShowAddForm(false);
          }}
        >
          <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>목표</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'counters' && styles.activeTab]}
          onPress={() => {
            setActiveTab('counters');
            setShowAddForm(false);
          }}
        >
          <Text style={[styles.tabText, activeTab === 'counters' && styles.activeTabText]}>카운터</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'memos' && styles.activeTab]}
          onPress={() => {
            setActiveTab('memos');
            setShowAddForm(false);
          }}
        >
          <Text style={[styles.tabText, activeTab === 'memos' && styles.activeTabText]}>메모</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sleep' && styles.activeTab]}
          onPress={() => {
            setActiveTab('sleep');
            setShowAddForm(false);
          }}
        >
          <Text style={[styles.tabText, activeTab === 'sleep' && styles.activeTabText]}>수면</Text>
        </TouchableOpacity>
      </View>

      {/* 추가 버튼 */}
      {activeTab !== 'sleep' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.addButtonText}>
            {showAddForm ? '➖ 취소' : '➕ 새로 추가'}
          </Text>
        </TouchableOpacity>
      )}

      {/* 추가 폼 */}
      {renderAddForm()}

      {/* 컨텐츠 */}
      {activeTab === 'goals' && renderGoals()}
      {activeTab === 'counters' && renderCounters()}
      {activeTab === 'memos' && renderMemos()}
      {activeTab === 'sleep' && renderSleep()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  loading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addForm: {
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
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contentSection: {
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
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  achievedCard: {
    borderLeftColor: '#FFC107',
    backgroundColor: '#fff8e1',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  achievedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  itemDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  toggleButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  achievedToggleButton: {
    backgroundColor: '#FFC107',
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // 카운터 스타일
  counterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  counterIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  decrementButton: {
    backgroundColor: '#ff5722',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incrementButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  countDisplay: {
    marginHorizontal: 20,
    alignItems: 'center',
  },
  countNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 2,
  },
  countLabel: {
    fontSize: 12,
    color: '#666',
  },
  // 메모 스타일
  memoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  memoStats: {
    fontSize: 12,
    color: '#888',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
  // 수면 스타일
  activeSleepCard: {
    backgroundColor: '#1a237e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  activeSleepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  activeSleepTime: {
    fontSize: 14,
    color: '#c5cae9',
    marginBottom: 12,
  },
  endSleepButton: {
    backgroundColor: '#ff9800',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  endSleepButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  startSleepButton: {
    backgroundColor: '#3f51b5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  startSleepButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sleepDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sleepEndTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sleepDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
}); 