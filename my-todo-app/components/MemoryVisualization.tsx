import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MemorySpace } from '@/types';
import { formatMemorySize, calculateMemoryUsage } from '@/utils';

interface Props {
  memorySpaces: MemorySpace[];
}

export function MemoryVisualization({ memorySpaces }: Props) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>메모리 시스템</ThemedText>
      
      {memorySpaces.map((space) => {
        const usage = calculateMemoryUsage(space.memory.usedCapacity, space.memory.totalCapacity);
        const isOverloaded = space.memory.isFull;
        
        return (
          <View key={space.id} style={styles.memorySpace}>
            <View style={styles.memoryHeader}>
              <ThemedText type="defaultSemiBold">{space.name}</ThemedText>
              <ThemedText style={[styles.capacityText, isOverloaded && styles.overloadedText]}>
                {formatMemorySize(space.memory.usedCapacity)} / {formatMemorySize(space.memory.totalCapacity)}
              </ThemedText>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${Math.min(usage, 100)}%` },
                    isOverloaded && styles.overloadedBar
                  ]} 
                />
              </View>
              <ThemedText style={styles.percentageText}>{usage}%</ThemedText>
            </View>
          </View>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  memorySpace: {
    marginBottom: 16,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  capacityText: {
    fontSize: 14,
    color: '#666',
  },
  overloadedText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  overloadedBar: {
    backgroundColor: '#ef4444',
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    minWidth: 30,
  },
}); 