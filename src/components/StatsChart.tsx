// FILE 4: src/components/StatsChart.tsx
// ============================================

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { DayStats } from '../types';
import { CHART_COLORS } from '../utils/constants';

interface StatsChartProps {
  weekStats: DayStats[];
}

const { width } = Dimensions.get('window');

export const StatsChart: React.FC<StatsChartProps> = ({ weekStats }) => {
  // Prepare data for pie chart
  const chartData = weekStats
    .filter(stat => stat.totalHours > 0 || stat.totalMinutes > 0)
    .map((stat, index) => {
      const date = new Date(stat.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const totalHoursDecimal = stat.totalHours + (stat.totalMinutes / 60);
      
      return {
        name: `${dayName} (${stat.totalHours}h ${stat.totalMinutes}m)`,
        hours: parseFloat(totalHoursDecimal.toFixed(1)),
        color: CHART_COLORS[index % CHART_COLORS.length],
        legendFontColor: '#e4e4e4',
        legendFontSize: 11,
      };
    });

  if (chartData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>📊</Text>
        <Text style={styles.emptyMessage}>
          No study data this week.{'\n'}Complete your first session!
        </Text>
      </View>
    );
  }

  const totalHours = chartData.reduce((sum, item) => sum + item.hours, 0);
  const avgPerDay = totalHours / 7;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weekly Distribution</Text>
      
      <PieChart
        data={chartData}
        width={width - 40}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(168, 168, 255, ${opacity})`,
        }}
        accessor="hours"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        hasLegend={true}
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{totalHours.toFixed(1)}h</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Daily Avg</Text>
            <Text style={styles.summaryValue}>{avgPerDay.toFixed(1)}h</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Active Days</Text>
            <Text style={styles.summaryValue}>{chartData.length}/7</Text>
          </View>
        </View>
      </View>

      {/* Day by day breakdown with FIXED relative widths */}
      <View style={styles.breakdownContainer}>
        <Text style={styles.breakdownTitle}>Daily Breakdown</Text>
        {(() => {
          // Find max hours in the week for relative scaling
          const maxHoursInWeek = Math.max(
            ...weekStats.map(s => s.totalHours + (s.totalMinutes / 60)),
            1 // Minimum 1 to avoid division by zero
          );

          return weekStats.map((stat, index) => {
            const date = new Date(stat.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const isToday = new Date().toDateString() === date.toDateString();
            const totalHoursDecimal = stat.totalHours + (stat.totalMinutes / 60);
            
            // Calculate relative percentage based on week's max
            const barPercentage = (totalHoursDecimal / maxHoursInWeek) * 100;
            
            return (
              <View key={stat.date} style={styles.dayRow}>
                <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                  {dayName} {isToday && '(Today)'}
                </Text>
                <View style={styles.dayStats}>
                  {stat.totalHours > 0 || stat.totalMinutes > 0 ? (
                    <>
                      <Text style={styles.dayHours}>
                        {stat.totalHours}h {stat.totalMinutes}m
                      </Text>
                      <View style={styles.dayBarContainer}>
                        <View 
                          style={[
                            styles.dayBar,
                            { 
                              width: `${barPercentage}%`,
                              backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                            }
                          ]} 
                        />
                      </View>
                    </>
                  ) : (
                    <Text style={styles.dayNoData}>No study</Text>
                  )}
                </View>
              </View>
            );
          });
        })()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1.41,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a8a8ff',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#2a2a3e',
  },
  breakdownContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a3e',
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 12,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayName: {
    fontSize: 13,
    color: '#888',
    width: 80,
  },
  dayNameToday: {
    color: '#a8a8ff',
    fontWeight: '600',
  },
  dayStats: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayHours: {
    fontSize: 13,
    color: '#e4e4e4',
    width: 85,
    fontWeight: '600',
  },
  dayBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#2a2a3e',
    borderRadius: 3,
    overflow: 'hidden',
    marginLeft: 8,
  },
  dayBar: {
    height: '100%',
    borderRadius: 3,
  },
  dayNoData: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
  },
  emptyContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 40,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
});