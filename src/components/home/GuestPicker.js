import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { X, Plus, Minus } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';

const GuestPicker = ({ bottomSheetRef, guests, setGuests }) => {
  const updateCount = (type, delta) => {
    setGuests((prev) => ({
      ...prev,
      [type]: Math.max(type === 'children' ? 0 : 1, prev[type] + delta),
    }));
  };

  return (
    <RBSheet
      ref={bottomSheetRef}
      height={400}
      openDuration={250}
      closeOnDragDown={true}
      closeOnPressMask={true}
      customStyles={{
        wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
        draggableIcon: { backgroundColor: '#E0E0E0', width: 40 },
        container: { borderTopLeftRadius: 24, borderTopRightRadius: 24 }
      }}
    >
      <View style={styles.content}>
        <View style={styles.sheetHeader}>
          <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
            <X color={Colors.text} size={22} />
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>Số phòng và khách</Text>
          <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
            <Text style={styles.confirmText}>Xong</Text>
          </TouchableOpacity>
        </View>

        <CounterRow
          label="Số phòng"
          value={guests.rooms}
          onIncrement={() => updateCount('rooms', 1)}
          onDecrement={() => updateCount('rooms', -1)}
          min={1}
        />
        <CounterRow
          label="Người lớn"
          subLabel="Từ 13 tuổi trở lên"
          value={guests.adults}
          onIncrement={() => updateCount('adults', 1)}
          onDecrement={() => updateCount('adults', -1)}
          min={1}
        />
        <CounterRow
          label="Trẻ em"
          subLabel="Từ 0 đến 12 tuổi"
          value={guests.children}
          onIncrement={() => updateCount('children', 1)}
          onDecrement={() => updateCount('children', -1)}
          min={0}
        />
      </View>
    </RBSheet>
  );
};

const CounterRow = ({ label, subLabel, value, onIncrement, onDecrement, min }) => (
  <View style={styles.row}>
    <View>
      <Text style={styles.label}>{label}</Text>
      {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
    </View>
    <View style={styles.counter}>
      <TouchableOpacity onPress={onDecrement} disabled={value <= min} style={[styles.btn, value <= min && styles.btnDisabled]}>
        <Minus color={value <= min ? '#ccc' : Colors.primary} size={18} />
      </TouchableOpacity>
      <Text style={styles.value}>{value}</Text>
      <TouchableOpacity onPress={onIncrement} style={styles.btn}>
        <Plus color={Colors.primary} size={18} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 20 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  sheetTitle: { fontSize: 17, fontWeight: 'bold' },
  confirmText: { color: Colors.primary, fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  label: { fontSize: 16, fontWeight: '600', color: Colors.text },
  subLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
  counter: { flexDirection: 'row', alignItems: 'center' },
  btn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { borderColor: '#e0e0e0' },
  value: { width: 44, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
});

export default GuestPicker;
