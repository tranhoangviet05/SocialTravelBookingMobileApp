import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { X, ChevronRight } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

const CustomDatePicker = ({ bottomSheetRef, onSelectRange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [currentMonth] = useState(new Date());

  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const calendarData = useMemo(() => {
    const months = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1);
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).getDay();
      const days = [];
      for (let j = 0; j < firstDay; j++) days.push(null);
      for (let j = 1; j <= daysInMonth; j++) {
        days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), j));
      }
      months.push({
        name: `Tháng ${monthDate.getMonth() + 1}, ${monthDate.getFullYear()}`,
        days,
      });
    }
    return months;
  }, [currentMonth]);

  const handleDatePress = (date) => {
    if (!date || date < today) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (date < startDate) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };

  const handleConfirm = () => {
    if (startDate) {
      // Nếu không có endDate, coi như endDate = startDate (cho tab Hoạt động)
      onSelectRange({ startDate, endDate: endDate || startDate });
      bottomSheetRef.current?.close();
    }
  };

  const isSelected = (date) =>
    date && (startDate?.getTime() === date.getTime() || endDate?.getTime() === date.getTime());

  const isInRange = (date) =>
    date && startDate && endDate && date > startDate && date < endDate;

  const formatDate = (date) => (date ? `${date.getDate()}/${date.getMonth() + 1}` : '__');

  return (
    <RBSheet
      ref={bottomSheetRef}
      height={650}
      openDuration={250}
      closeOnDragDown={true}
      closeOnPressMask={true}
      customStyles={{
        wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
        draggableIcon: { backgroundColor: '#E0E0E0', width: 40 },
        container: { borderTopLeftRadius: 24, borderTopRightRadius: 24 }
      }}
    >
      <View style={styles.sheetHeader}>
        <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
          <X color={Colors.text} size={22} />
        </TouchableOpacity>
        <Text style={styles.sheetTitle}>Chọn ngày</Text>
        <TouchableOpacity disabled={!startDate} onPress={handleConfirm}>
          <Text style={[styles.confirmText, !startDate && styles.disabledText]}>Xong</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.selectionPreview}>
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>Ngày đi</Text>
          <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
        </View>
        <ChevronRight color={Colors.border} size={20} />
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>Ngày về</Text>
          <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
        </View>
      </View>

      <View style={styles.weekDays}>
        {daysOfWeek.map((d) => <Text key={d} style={styles.weekDayText}>{d}</Text>)}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {calendarData.map((month, mIdx) => (
          <View key={mIdx} style={styles.monthContainer}>
            <Text style={styles.monthName}>{month.name}</Text>
            <View style={styles.daysGrid}>
              {month.days.map((day, dIdx) => {
                const selected = isSelected(day);
                const inRange = isInRange(day);
                const isPast = day && day < today;
                return (
                  <TouchableOpacity
                    key={dIdx}
                    style={[
                      styles.dayCell,
                      selected && styles.selectedDay,
                      inRange && styles.rangeDay,
                      day && startDate?.getTime() === day.getTime() && endDate && styles.startRangeDay,
                      day && endDate?.getTime() === day.getTime() && styles.endRangeDay,
                    ]}
                    onPress={() => handleDatePress(day)}
                    disabled={!day || isPast}
                  >
                    <Text style={[
                      styles.dayText, 
                      selected && styles.selectedDayText, 
                      inRange && styles.rangeDayText,
                      isPast && styles.pastDayText
                    ]}>
                      {day ? day.getDate() : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </RBSheet>
  );
};

const styles = StyleSheet.create({
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sheetTitle: { fontSize: 17, fontWeight: 'bold' },
  confirmText: { color: Colors.primary, fontWeight: 'bold', fontSize: 16 },
  disabledText: { color: Colors.border },
  selectionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 18,
    backgroundColor: '#fafafa',
  },
  dateBox: { alignItems: 'center' },
  dateLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  dateValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  weekDays: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  weekDayText: { flex: 1, textAlign: 'center', fontSize: 12, color: Colors.textSecondary, fontWeight: 'bold' },
  monthContainer: { paddingHorizontal: 10, marginTop: 20 },
  monthName: { fontSize: 15, fontWeight: 'bold', marginBottom: 12, paddingLeft: 8 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, height: 44, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  dayText: { fontSize: 15, color: Colors.text },
  selectedDay: { backgroundColor: Colors.primary, borderRadius: 22 },
  selectedDayText: { color: '#fff', fontWeight: 'bold' },
  rangeDay: { backgroundColor: Colors.primary + '20' },
  rangeDayText: { color: Colors.primary },
  startRangeDay: { borderTopLeftRadius: 22, borderBottomLeftRadius: 22 },
  endRangeDay: { borderTopRightRadius: 22, borderBottomRightRadius: 22 },
  pastDayText: { color: '#E0E0E0' },
});

export default CustomDatePicker;
