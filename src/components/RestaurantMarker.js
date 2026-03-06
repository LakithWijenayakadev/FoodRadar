import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Marker} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Colors from '../constants/colors';

const FILTER_ICONS = {
  Cuisines: 'local-restaurant',
  Caffe: 'local-cafe',
  Restaurants: 'restaurant',
  FastFood: 'fastfood',
  Desserts: 'icecream',
  Drinks: 'local-bar',
};

const RestaurantMarker = ({
  restaurant,
  isSearched,
  onPress,
  isZoomedOut,
}) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  
  useEffect(() => {
    setTracksViewChanges(true);
    const timeout = setTimeout(() => {
      setTracksViewChanges(false);
    }, 400); 
    return () => clearTimeout(timeout);
  }, [isZoomedOut]);

  // set icon
  const iconName = FILTER_ICONS[restaurant.cuisine] || 'restaurant';
  const bgColor = isSearched ? Colors.star : Colors.purple;
  const iconColor = Colors.white;
  
  return (
    <Marker
      coordinate={{latitude: restaurant.lat, longitude: restaurant.lng}}
      onPress={() => onPress(restaurant)}
      tracksViewChanges={tracksViewChanges}>
     
        {isZoomedOut ? (
          <View style={[styles.zoomedOutIcon, {backgroundColor: bgColor}]}>
            <Icon name={iconName} size={15} color={iconColor} />
          </View>
        ) : (
          <View style={styles.bubble}>
            {/* icon */}
            <View style={[styles.iconWrapper, {backgroundColor: bgColor}]}>
              <Icon name={iconName} size={13} color={iconColor} />
            </View>
            
            {/* content */}
            <View style={styles.textContainer}>
              <Text style={styles.rating}>{restaurant.distance}</Text>
              <Text style={styles.name} numberOfLines={1}>
                {restaurant.name}
              </Text>
            </View>
          </View>
        )}
       
       
   
    </Marker>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    alignItems: 'center',
    // backgroundColor: 'red',
      // elevation: 8,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:'#f7f3ffff',
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 6,
    shadowColor: '#0000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 8,
    minWidth: 120,
    borderWidth: 0.5,
    borderColor: '#03000018',
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  zoomedOutIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.black,
    marginBottom: 0,
    letterSpacing: -0.2,
  },
  name: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.greyDark,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.white,
    marginTop: -2,  // overlapping lightly to hide seam
    marginLeft: -40, // push tail to the left to align with icon
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    backgroundColor:'red'
  },
});

export default RestaurantMarker;
