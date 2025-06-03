import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Todo } from '@/types';
import { formatDate } from '@/utils';

interface Props {
  todo: Todo;
  onComplete: (todoId: string) => void;
  onDelete: (todoId: string) => void;
}

export function TodoCard({ todo, onComplete, onDelete }: Props) {
  const isOverdue = todo.dueDate !== 'infinity' && new Date(todo.dueDate) < new Date();
  const statusColor = todo.status === 'process' ? '#3b82f6' : todo.status === 'virtual' ? '#f59e0b' : '#10b981';

  return (
    <ThemedView style={[styles.container, isOverdue && styles.overdueContainer]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {todo.text}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <ThemedText style={styles.statusText}>{todo.status}</ThemedText>
          </View>
        </View>
        
        {todo.dueDate !== 'infinity' && (
          <View style={styles.dueDateRow}>
            <IconSymbol name="clock" size={16} color="#666" />
            <ThemedText style={[styles.dueDate, isOverdue && styles.overdueText]}>
              {formatDate(new Date(todo.dueDate))} 마감
            </ThemedText>
          </View>
        )}
        
        {todo.status === 'process' && (
          <View style={styles.processInfo}>
            <IconSymbol name="cpu" size={16} color="#3b82f6" />
            <ThemedText style={styles.processText}>memory 공간에서 실행 중</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.completeButton]} 
          onPress={() => onComplete(todo.id)}
        >
          <ThemedText style={styles.actionButtonText}>완료</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => onDelete(todo.id)}
        >
          <ThemedText style={styles.actionButtonText}>삭제</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overdueContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
  },
  overdueText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  processInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  processText: {
    fontSize: 14,
    color: '#3b82f6',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
}); 