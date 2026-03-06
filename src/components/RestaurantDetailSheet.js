import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../constants/colors';

const MENU_ITEMS = [
  { id: '1', name: 'Classic Cheeseburger', description: 'Angus beef, cheddar, lettuce, tomato, special sauce', price: '$12.99', icon: 'lunch-dining' },
  { id: '2', name: 'Margherita Pizza', description: 'Fresh mozzarella, tomato sauce, basil', price: '$14.50', icon: 'local-pizza' },
  { id: '3', name: 'Grilled Salmon', description: 'Wild-caught salmon with roasted asparagus', price: '$18.00', icon: 'set-meal' },
  { id: '4', name: 'Spicy Pasta', description: 'Penne pasta with spicy tomato cream sauce', price: '$13.25', icon: 'restaurant' },
  { id: '5', name: 'Caesar Salad', description: 'Crisp romaine, parmesan, croutons, caesar dressing', price: '$9.99', icon: 'eco' },
];

const RestaurantDetailSheet = ({restaurant, sheetRef}) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const openMenu = () => setIsMenuVisible(true);
  const closeMenu = () => setIsMenuVisible(false);

  const handleDirection = useCallback(() => {
    if (!restaurant) return;
    const url =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${restaurant.lat},${restaurant.lng}`
        : `geo:${restaurant.lat},${restaurant.lng}?q=${restaurant.lat},${restaurant.lng}(${restaurant.name})`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${restaurant.lat},${restaurant.lng}`,
      );
    });
  }, [restaurant]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      enableDynamicSizing={true}
      enablePanDownToClose
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}>
      <BottomSheetView style={styles.container}>
        {restaurant ? (
          <>
            {/* Restaurant image */}
            <View style={styles.imageContainer}>
              <Image
                source={{uri: restaurant.image}}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.badge}>
                <Icon name="local-offer" size={13} color={Colors.white} />
                <Text style={styles.badgeText}>{restaurant.discount}</Text>
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.titleRow}>
                <View style={styles.titleBlock}>
                  <Text style={styles.title}>{restaurant.name}</Text>
                  <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
                </View>
                <View style={styles.ratingBubble}>
                  <Icon name="star" size={14} color={Colors.star} />
                  <Text style={styles.ratingText}>{restaurant.rating}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Icon name="near-me" size={14} color={Colors.purple} />
                  <Text style={styles.metaText}>{restaurant.distance} km away</Text>
                </View>
                <View style={styles.metaDot} />
                <View style={styles.metaItem}>
                  <Icon name="schedule" size={14} color={Colors.purple} />
                  <Text style={styles.metaText}>{restaurant.deliveryDays}-day delivery</Text>
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={handleDirection}
                  activeOpacity={0.85}
                  style={styles.buttonOutline}>
                  <Icon name="directions" size={18} color={Colors.purple} />
                  <Text style={styles.buttonOutlineText}>Direction</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.buttonFilled}
                  onPress={openMenu}>
                  <Icon name="menu-book" size={18} color={Colors.white} />
                  <Text style={styles.buttonFilledText}>Menu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : null}

        {/* Menu Modal Overlay */}
        <Modal
          visible={isMenuVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeMenu}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Food Menu</Text>
                <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                  <Icon name="close" size={20} color={Colors.black} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
                {MENU_ITEMS.map((item) => (
                  <View key={item.id} style={styles.menuItem}>
                    <View style={styles.menuItemIconBg}>
                      <Icon name={item.icon} size={24} color={Colors.purple} />
                    </View>
                    <View style={styles.menuItemDetails}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      <Text style={styles.menuItemDesc}>{item.description}</Text>
                    </View>
                    <Text style={styles.menuItemPrice}>{item.price}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.white,
    borderRadius: 28,
  },
  handleIndicator: {
    backgroundColor: Colors.greyMid,
    width: 40,
  },
  container: {
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  imageContainer: {
    marginHorizontal: 16,
    marginTop: 4,
    borderRadius: 20,
    overflow: 'hidden',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.purple,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleBlock: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  cuisine: {
    fontSize: 13,
    color: Colors.greyDark,
    marginTop: 2,
    fontWeight: '500',
  },
  ratingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.greyDark,
    fontWeight: '500',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.greyMid,
    marginHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.purple,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
  },
  buttonOutlineText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.purple,
  },
  buttonFilled: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.purple,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    shadowColor: Colors.purple,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonFilledText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.black,
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  menuList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  menuItemIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemDetails: {
    flex: 1,
    marginRight: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  menuItemDesc: {
    fontSize: 13,
    color: Colors.greyDark,
    lineHeight: 18,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.purple,
  },
});

export default RestaurantDetailSheet;
