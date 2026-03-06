import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../constants/colors';

const CHIPS = [
  {id: 'All', label: 'All', icon: 'apps'},
 
  {id: 'Caffe', label: 'Caffe', icon: 'local-cafe'},
  {id: 'Restaurants', label: 'Restaurants', icon: 'restaurant'},
  {id: 'FastFood', label: 'Fast Food', icon: 'fastfood'},
  {id: 'Desserts', label: 'Desserts', icon: 'icecream'},
  {id: 'Drinks', label: 'Drinks', icon: 'local-bar'},
   {id: 'Cuisines', label: 'Cuisines', icon: 'local-restaurant'},
];

const FilterChips = ({selected, onSelect}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {CHIPS.map(chip => {
          const active = chip.id === selected;
          return (
            <TouchableOpacity
              key={chip.id}
              onPress={() => onSelect(chip.id)}
              activeOpacity={0.8}
              style={[styles.chip, active && styles.chipActive]}>
              <Icon
                name={chip.icon}
                size={15}
                color={active ? Colors.white : Colors.purple}
                style={styles.chipIcon}
              />
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
    marginHorizontal: -16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
  },
  chipActive: {
    backgroundColor: Colors.purple,
    borderColor: Colors.purple,
  },
  chipIcon: {
    marginRight: 5,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.purple,
  },
  chipLabelActive: {
    color: Colors.white,
  },
});

export default FilterChips;
