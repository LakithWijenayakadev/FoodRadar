import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  Platform,
  PermissionsAndroid,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';

import mapStyle from '../constants/mapStyle.json';
import fallbackRestaurants from '../data/restaurants';
import {sortRestaurants} from '../utils/sortRestaurants';
import {
  fetchNearbyRestaurants,
  fetchPlaceDetails,
  fetchAddressFromCoords,
  haversineDistance,
} from '../services/placesService';
import Colors from '../constants/colors';

const GOOGLE_API_KEY = 'AIzaSyAB2dA6akyOVPMCMmfbP-qXf5h1X2hyhm0';

import Header from '../components/Header';
import RestaurantMarker from '../components/RestaurantMarker';
import RestaurantDetailSheet from '../components/RestaurantDetailSheet';

// default start pos
const INITIAL_REGION = {
  latitude: 6.9271,
  longitude: 79.8612,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

// MapScreen now directly relies on the Chip ID exactly matching the resolved Cuisine string.

const MapScreen = () => {
  const sheetRef = useRef(null);
  const mapRef = useRef(null);
  const searchRef = useRef(null);

  const [allRestaurants, setAllRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState('Locating...');
  const [topLabel, setTopLabel] = useState('MY LOCATION');
  const [searchedLocationCoords, setSearchedLocationCoords] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [isZoomedOut, setIsZoomedOut] = useState(INITIAL_REGION.longitudeDelta > 0.015);

  // toast state
  const [toastMessage, setToastMessage] = useState('');
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const showToast = useCallback((message) => {
    setToastMessage(message);
    Animated.spring(slideAnim, {
      toValue: Platform.OS === 'ios' ? 50 : 20,
      useNativeDriver: true,
      friction: 8,
    }).start();

    // auto-hide & clear
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setToastMessage('');
        searchRef.current?.setAddressText('');
        searchRef.current?.clear();
      });
    }, 3500);
  }, [slideAnim]);

  // fetch api data
  const loadRestaurants = useCallback(
    async (lat, lng, userLat, userLng, radius = 5000, specificPlaceId = null) => {
      setLoading(true);
      try {
        const results = await fetchNearbyRestaurants(lat, lng, radius);
        
        // Fetch explicitly searched place
        if (specificPlaceId) {
          const specificPlace = await fetchPlaceDetails(specificPlaceId);
          if (specificPlace) {
            results.unshift(specificPlace);
          } else {
            showToast("Cannot explore : Not a food or drink location.");
            // Auto-reset search on error
            handleClearSearch();
          }
        }

        // Deduplicate in case specific place was already in nearby fetch
        const uniqueResults = [];
        const seen = new Set();
        for (const item of results) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            uniqueResults.push(item);
          }
        }

        const uLat = userLat ?? lat;
        const uLng = userLng ?? lng;
        const withDistance = uniqueResults.map(r => ({
          ...r,
          distance: haversineDistance(uLat, uLng, r.lat, r.lng),
        }));
        setAllRestaurants(
          withDistance.length > 0 ? withDistance : fallbackRestaurants,
        );
      } catch (err) {
        console.warn('Places API error:', err.message);
        setAllRestaurants(fallbackRestaurants);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // get user pos
  const getLocation = useCallback(
    () =>
      new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        });
      }),
    [],
  );

  // req perms & init
  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('whenInUse');
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need your location to show restaurants near you.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          loadRestaurants(INITIAL_REGION.latitude, INITIAL_REGION.longitude);
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    try {
      const position = await getLocation();
      const {latitude, longitude} = position.coords;
      setUserLocation({latitude, longitude});

      // Reverse geocode to get street address
      const address = await fetchAddressFromCoords(latitude, longitude);
      if (address) {
        setLocationLabel(address);
      } else {
        setLocationLabel('Current Location');
      }

      mapRef.current?.animateToRegion(
        // {latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05},
        // 800,
         {latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01},
        1000,
      );
      loadRestaurants(latitude, longitude, latitude, longitude);
    } catch {
      loadRestaurants(INITIAL_REGION.latitude, INITIAL_REGION.longitude);
    }
  }, [getLocation, loadRestaurants]);

  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  // pan to me
  const handleGoToMyLocation = useCallback(async () => {
    setLocatingUser(true);
    try {
      const position = await getLocation();
      const {latitude, longitude} = position.coords;
      setUserLocation({latitude, longitude});

      // Reverse geocode
      const address = await fetchAddressFromCoords(latitude, longitude);
      if (address) {
        setLocationLabel(address);
      } else {
        setLocationLabel('Current Location');
      }

      mapRef.current?.animateToRegion(
        {latitude, longitude, latitudeDelta: 0.005, longitudeDelta: 0.005},
        1000,
      );
      loadRestaurants(latitude, longitude, latitude, longitude, 3000);
    } catch {
      Alert.alert('Location Error', 'Unable to get your current location.');
    } finally {
      setLocatingUser(false);
    }
  }, [getLocation, loadRestaurants]);

  // clear search
  const handleClearSearch = useCallback(async () => {
    setLocationLabel('Locating...');
    setTopLabel('MY LOCATION');
    setSearchedLocationCoords(null);
    setSelectedRestaurant(null);
    setSelectedFilter('All');
    sheetRef.current?.close();
    handleGoToMyLocation();
  }, [handleGoToMyLocation]);

  // handle search val
  const handlePlaceSelected = useCallback(
    (lat, lng, name, placeId) => {
      setLocationLabel(name);
      setTopLabel('OFFERS NEAR');
      setSearchedLocationCoords({ lat, lng });
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        },
        700,
      );
      loadRestaurants(
        lat,
        lng,
        userLocation?.latitude ?? lat,
        userLocation?.longitude ?? lng,
        5000,
        placeId
      );
    },
    [loadRestaurants, userLocation],
  );

  // filter & sort
  const visibleRestaurants = React.useMemo(() => {
    let list = allRestaurants;
    if (selectedFilter !== 'All') {
      list = list.filter(r => {
        // Always show the explicitly searched marker regardless of selected filter
        if (searchedLocationCoords && 
            Math.abs(r.lat - searchedLocationCoords.lat) < 0.0001 && 
            Math.abs(r.lng - searchedLocationCoords.lng) < 0.0001) {
          return true;
        }
        return r.cuisine === selectedFilter;
      });
    }
    return sortRestaurants(list, 'rating');
  }, [allRestaurants, selectedFilter, searchedLocationCoords]);

  const handleMarkerPress = useCallback(restaurant => {
    // zoom to marker
    mapRef.current?.animateToRegion(
      {
        latitude: restaurant.lat - 0.0002,
        longitude: restaurant.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      700,
    );
    setSelectedRestaurant(restaurant);
    sheetRef.current?.snapToIndex(0);
  }, []);

  // track zoom to hide/show details
  const handleRegionChangeComplete = useCallback((region) => {
    const zoomedOut = region.longitudeDelta > 0.015 || region.latitudeDelta > 0.015;
    setIsZoomedOut(prev => prev !== zoomedOut ? zoomedOut : prev);
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={INITIAL_REGION}
        customMapStyle={mapStyle}
        // onPress={() => setSelectedRestaurant(null)}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
        onRegionChangeComplete={handleRegionChangeComplete}>
        
        {/* Custom User Location Marker */}
        {userLocation && (
          <Marker coordinate={userLocation} anchor={{x: 0.5, y: 0.5}}>
            <View style={styles.userLocationRing}>
              <View style={styles.userLocationDot} />
            </View>
          </Marker>
        )}

        {visibleRestaurants.map(r => {
          // If the marker coordinates are extremely close to the searched ones, highlight it
          const isSearched = searchedLocationCoords && 
            Math.abs(r.lat - searchedLocationCoords.lat) < 0.0001 && 
            Math.abs(r.lng - searchedLocationCoords.lng) < 0.0001;

          return (
            <RestaurantMarker
              key={r.id}
              restaurant={r}
              isSearched={isSearched}
              onPress={handleMarkerPress}
              isZoomedOut={isZoomedOut}
            />
          );
        })}


      </MapView>

      {/* Floating My-Location button */}
      <TouchableOpacity
        style={styles.locationFab}
        onPress={handleGoToMyLocation}
        activeOpacity={0.85}>
        {locatingUser ? (
          <ActivityIndicator size="small" color={Colors.purple} />
        ) : (
          <Icon name="my-location" size={22} color={Colors.purple} />
        )}
      </TouchableOpacity>

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={Colors.purple} />
          <Text style={styles.loadingText}>Finding restaurants…</Text>
        </View>
      )}

      {/* Overlays */}
      <Header
        locationLabel={locationLabel}
        topLabel={topLabel}
        onPlaceSelected={handlePlaceSelected}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
        onClearSearch={handleClearSearch}
        searchRef={searchRef}
      />

      {/* Custom Animated Toast */}
      {toastMessage !== '' && (
        <Animated.View style={[styles.toastContainer, { transform: [{ translateY: slideAnim }] }]}>
          <Icon name="error-outline" size={20} color={Colors.white} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}

      {/* Bottom sheet */}
      <RestaurantDetailSheet
        restaurant={selectedRestaurant}
        sheetRef={sheetRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 130 : 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53E3E', // Vivid Red
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999, // Ensure it floats above the header
  },
  toastText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  locationFab: {
    position: 'absolute',
    right: 16,
    bottom: 140,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
    // zIndex: 150,
  },
  userLocationRing: {
    width: 34,
    height: 34,
    borderRadius: 22,
    backgroundColor: 'rgba(124, 58, 237, 0.2)', // Purple with 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.purple,
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 200,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.greyDark,
    fontWeight: '500',
  },
});

export default MapScreen;
