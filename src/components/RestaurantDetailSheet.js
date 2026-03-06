import React, {useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../constants/colors';

const RestaurantDetailSheet = ({restaurant, sheetRef}) => {
  const snapPoints = useMemo(() => ['45%', '80%'], []);

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
      snapPoints={snapPoints}
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
                  style={styles.buttonFilled}>
                  <Icon name="menu-book" size={18} color={Colors.white} />
                  <Text style={styles.buttonFilledText}>Menu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : null}
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
    flex: 1,
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
});

export default RestaurantDetailSheet;
