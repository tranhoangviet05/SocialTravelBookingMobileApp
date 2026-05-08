import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, TouchableOpacity,
  FlatList, Dimensions, Platform
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { X, Check } from 'lucide-react-native';
import AppText from '../common/AppText';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 44;

const BirthDatePicker = ({ bottomSheetRef, onSelectDate, initialDate }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i); // 100 years is enough
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  const [selectedYear, setSelectedYear] = useState(currentYear - 20);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedDay, setSelectedDay] = useState(1);
  const [days, setDays] = useState([]);

  useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    setDays(daysArray);
    if (selectedDay > daysInMonth) setSelectedDay(daysInMonth);
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (initialDate) {
      const date = new Date(initialDate);
      if (!isNaN(date.getTime())) {
        setSelectedYear(date.getFullYear());
        setSelectedMonth(date.getMonth() + 1);
        setSelectedDay(date.getDate());
      }
    }
  }, [initialDate, bottomSheetRef]);

  const handleConfirm = () => {
    const date = new Date(selectedYear, selectedMonth - 1, selectedDay);
    onSelectDate(date);
    bottomSheetRef.current?.close();
  };

  const renderItem = ({ item, selectedValue, onSelect }) => (
    <TouchableOpacity
      style={[styles.item, selectedValue === item && styles.selectedItem]}
      onPress={() => onSelect(item)}
    >
      <AppText style={[styles.itemText, selectedValue === item && styles.selectedItemText]}>
        {item < 10 && item.toString().length === 1 ? `0${item}` : item}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <RBSheet
      ref={bottomSheetRef}
      height={350}
      openDuration={250}
      closeOnDragDown={true}
      closeOnPressMask={true}
      customStyles={{
        wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
        draggableIcon: { backgroundColor: '#E2E8F0', width: 40 },
        container: { borderTopLeftRadius: 24, borderTopRightRadius: 24 }
      }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => bottomSheetRef.current?.close()} style={styles.headerBtn}>
          <X color={Colors.textSecondary} size={20} />
        </TouchableOpacity>
        <AppText style={styles.headerTitle}>Chọn ngày sinh</AppText>
        <TouchableOpacity onPress={handleConfirm} style={styles.headerBtn}>
          <AppText style={styles.confirmText}>Xong</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        {/* Day Column */}
        <View style={styles.column}>
          <AppText style={styles.columnLabel}>Ngày</AppText>
          <FlatList
            data={days}
            keyExtractor={(item) => `day-${item}`}
            renderItem={({ item }) => renderItem({ item, selectedValue: selectedDay, onSelect: setSelectedDay })}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            contentContainerStyle={styles.listContent}
          />
        </View>

        {/* Month Column */}
        <View style={styles.column}>
          <AppText style={styles.columnLabel}>Tháng</AppText>
          <FlatList
            data={months}
            keyExtractor={(item) => `month-${item}`}
            renderItem={({ item }) => renderItem({ item, selectedValue: selectedMonth, onSelect: setSelectedMonth })}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            contentContainerStyle={styles.listContent}
          />
        </View>

        {/* Year Column */}
        <View style={styles.column}>
          <AppText style={styles.columnLabel}>Năm</AppText>
          <FlatList
            data={years}
            keyExtractor={(item) => `year-${item}`}
            renderItem={({ item }) => renderItem({ item, selectedValue: selectedYear, onSelect: setSelectedYear })}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </RBSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerBtn: { padding: 5 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  confirmText: { color: Colors.primary, fontWeight: 'bold', fontSize: 15 },
  pickerContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 5,
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  listContent: {
    paddingBottom: 20
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 1
  },
  selectedItem: {
    backgroundColor: Colors.primary + '10',
  },
  itemText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500'
  },
  selectedItemText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 17
  }
});

export default BirthDatePicker;
