import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { subscribeToTodos } from '@/services/todoService';
import { subscribeToGoals } from '@/services/goalService';
import { subscribeToCounters } from '@/services/counterService';
import { subscribeToMemos } from '@/services/memoService';
import { subscribeToSleepLogs } from '@/services/sleepService';
import { getCurrentUser } from '@/services/authService';
import { Todo, Goal, Counter, Memo, SleepLog } from '@/types';

export default function CalendarScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const initializeData = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          Alert.alert('오류', '사용자가 로그인되지 않았습니다.');
          return;
        }

        // 실시간 구독 설정
        const unsubscribeTodos = subscribeToTodos(user.id, setTodos);
        const unsubscribeGoals = subscribeToGoals(user.id, setGoals);
        const unsubscribeCounters = subscribeToCounters(user.id, setCounters);
        const unsubscribeMemos = subscribeToMemos(user.id, setMemos);
        const unsubscribeSleep = subscribeToSleepLogs(user.id, setSleepLogs);

        setLoading(false);

        return () => {
          unsubscribeTodos();
          unsubscribeGoals();
          unsubscribeCounters();
          unsubscribeMemos();
          unsubscribeSleep();
        };
      } catch (error) {
        console.error('Error initializing calendar data:', error);
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // 달력 생성 함수
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 일요일부터 시작

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) { // 6주 * 7일
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // 특정 날짜의 데이터 가져오기
  const getDateData = (date: Date) => {
    const dateString = date.toDateString();
    
    const dayTodos = todos.filter(todo => 
      todo.createdAt.toDateString() === dateString ||
      (todo.dueDate !== 'infinity' && new Date(todo.dueDate).toDateString() === dateString)
    );
    
    const dayGoals = goals.filter(goal => 
      goal.createdAt.toDateString() === dateString ||
      goal.dueDate.toDateString() === dateString
    );
    
    const dayMemos = memos.filter(memo => 
      memo.createdAt.toDateString() === dateString
    );
    
    const daySleep = sleepLogs.filter(log => 
      log.startTime.toDateString() === dateString
    );

    return {
      todos: dayTodos,
      goals: dayGoals,
      memos: dayMemos,
      sleep: daySleep,
      hasData: dayTodos.length > 0 || dayGoals.length > 0 || dayMemos.length > 0 || daySleep.length > 0
    };
  };

  // 날짜 포맷 함수들
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // 월 변경 함수들
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>달력</Text>
        <Text style={styles.loading}>로딩 중...</Text>
      </View>
    );
  }

  const calendarDays = generateCalendar();
  const selectedDateData = getDateData(selectedDate);
  const today = new Date();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📅 달력</Text>

      {/* 월 네비게이션 */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
          <Text style={styles.navButtonText}>◀</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.monthTitle} onPress={goToToday}>
          <Text style={styles.monthTitleText}>{formatMonthYear(currentMonth)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
          <Text style={styles.navButtonText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.weekdayHeader}>
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <View key={index} style={styles.weekdayCell}>
            <Text style={[
              styles.weekdayText,
              index === 0 && styles.sundayText,
              index === 6 && styles.saturdayText
            ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 달력 그리드 */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((date, index) => {
          const dateData = getDateData(date);
          const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.calendarCell,
                isToday && styles.todayCell,
                isSelected && styles.selectedCell,
                !isCurrentMonth && styles.otherMonthCell
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.dateText,
                !isCurrentMonth && styles.otherMonthText,
                isToday && styles.todayText,
                isSelected && styles.selectedText,
                isWeekend && isCurrentMonth && styles.weekendText
              ]}>
                {date.getDate()}
              </Text>
              
              {/* 데이터 표시 점들 */}
              {isCurrentMonth && (
                <View style={styles.dataIndicators}>
                  {dateData.todos.length > 0 && <View style={[styles.indicator, styles.todoIndicator]} />}
                  {dateData.goals.length > 0 && <View style={[styles.indicator, styles.goalIndicator]} />}
                  {dateData.memos.length > 0 && <View style={[styles.indicator, styles.memoIndicator]} />}
                  {dateData.sleep.length > 0 && <View style={[styles.indicator, styles.sleepIndicator]} />}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 선택된 날짜 정보 */}
      <View style={styles.selectedDateSection}>
        <Text style={styles.selectedDateTitle}>
          {formatSelectedDate(selectedDate)}
        </Text>

        {!selectedDateData.hasData ? (
          <Text style={styles.noDataText}>이 날에는 기록된 데이터가 없습니다.</Text>
        ) : (
          <>
            {/* 할 일 */}
            {selectedDateData.todos.length > 0 && (
              <View style={styles.dataSection}>
                <Text style={styles.dataSectionTitle}>📝 할 일 ({selectedDateData.todos.length}개)</Text>
                {selectedDateData.todos.map(todo => (
                  <View key={todo.id} style={styles.dataItem}>
                    <Text style={[styles.dataItemText, todo.status === 'done' && styles.completedText]}>
                      {todo.status === 'done' ? '✅' : '📋'} {todo.text}
                    </Text>
                    <Text style={styles.dataItemSubtext}>
                      {todo.status === 'done' ? '완료됨' : todo.status}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* 목표 */}
            {selectedDateData.goals.length > 0 && (
              <View style={styles.dataSection}>
                <Text style={styles.dataSectionTitle}>🎯 목표 ({selectedDateData.goals.length}개)</Text>
                {selectedDateData.goals.map(goal => (
                  <View key={goal.id} style={styles.dataItem}>
                    <Text style={[styles.dataItemText, goal.isAchieved && styles.completedText]}>
                      {goal.isAchieved ? '✅' : '🎯'} {goal.title}
                    </Text>
                    <Text style={styles.dataItemSubtext}>
                      {goal.dueDate.toDateString() === selectedDate.toDateString() ? '마감일' : '생성일'}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* 메모 */}
            {selectedDateData.memos.length > 0 && (
              <View style={styles.dataSection}>
                <Text style={styles.dataSectionTitle}>📝 메모 ({selectedDateData.memos.length}개)</Text>
                {selectedDateData.memos.map(memo => (
                  <View key={memo.id} style={styles.dataItem}>
                    <Text style={styles.dataItemText} numberOfLines={2}>
                      📝 {memo.text}
                    </Text>
                    <Text style={styles.dataItemSubtext}>
                      {memo.text.length}자
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* 수면 */}
            {selectedDateData.sleep.length > 0 && (
              <View style={styles.dataSection}>
                <Text style={styles.dataSectionTitle}>😴 수면 ({selectedDateData.sleep.length}개)</Text>
                {selectedDateData.sleep.map(sleep => (
                  <View key={sleep.id} style={styles.dataItem}>
                    <Text style={styles.dataItemText}>
                      😴 {sleep.startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      {sleep.endTime && ` - ${sleep.endTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
                    </Text>
                    <Text style={styles.dataItemSubtext}>
                      {sleep.duration ? formatDuration(sleep.duration) : '진행중'}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      {/* 전체 통계 */}
      <View style={styles.statsSection}>
        <Text style={styles.statsSectionTitle}>📊 이번 달 통계</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {todos.filter(todo => 
                todo.createdAt.getMonth() === currentMonth.getMonth() &&
                todo.createdAt.getFullYear() === currentMonth.getFullYear()
              ).length}
            </Text>
            <Text style={styles.statLabel}>할 일</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {goals.filter(goal => 
                goal.createdAt.getMonth() === currentMonth.getMonth() &&
                goal.createdAt.getFullYear() === currentMonth.getFullYear()
              ).length}
            </Text>
            <Text style={styles.statLabel}>목표</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {memos.filter(memo => 
                memo.createdAt.getMonth() === currentMonth.getMonth() &&
                memo.createdAt.getFullYear() === currentMonth.getFullYear()
              ).length}
            </Text>
            <Text style={styles.statLabel}>메모</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {sleepLogs.filter(log => 
                log.startTime.getMonth() === currentMonth.getMonth() &&
                log.startTime.getFullYear() === currentMonth.getFullYear() &&
                !log.isActive
              ).length}
            </Text>
            <Text style={styles.statLabel}>수면</Text>
          </View>
        </View>
      </View>
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
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  monthTitle: {
    flex: 1,
    alignItems: 'center',
  },
  monthTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weekdayHeader: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  sundayText: {
    color: '#f44336',
  },
  saturdayText: {
    color: '#2196F3',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarCell: {
    width: '14.28%', // 7일로 나누기
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 1,
    position: 'relative',
  },
  todayCell: {
    backgroundColor: '#e3f2fd',
  },
  selectedCell: {
    backgroundColor: '#4CAF50',
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  otherMonthText: {
    color: '#ccc',
  },
  todayText: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  weekendText: {
    color: '#f44336',
  },
  dataIndicators: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    gap: 1,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  todoIndicator: {
    backgroundColor: '#4CAF50',
  },
  goalIndicator: {
    backgroundColor: '#FF9800',
  },
  memoIndicator: {
    backgroundColor: '#9C27B0',
  },
  sleepIndicator: {
    backgroundColor: '#3F51B5',
  },
  selectedDateSection: {
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
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  dataSection: {
    marginBottom: 16,
  },
  dataSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dataItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  dataItemText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  dataItemSubtext: {
    fontSize: 12,
    color: '#666',
  },
  statsSection: {
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
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
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
}); 