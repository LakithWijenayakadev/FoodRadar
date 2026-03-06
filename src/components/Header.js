import React, {useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Colors from '../constants/colors';
import FilterChips from './FilterChips';

const GOOGLE_API_KEY = 'AIzaSyAB2dA6akyOVPMCMmfbP-qXf5h1X2hyhm0';

const Header = ({locationLabel, topLabel = 'OFFERS NEAR', onPlaceSelected, selectedFilter, onSelectFilter, onClearSearch, searchRef}) => {
  return (
    <View style={styles.container}>
      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.locationIcon}>
          <Icon name="location-on" size={18} color={Colors.purple} />
        </View>
        <View style={styles.locationText}>
          <Text style={styles.offersNear}>{topLabel}</Text>
          <Text style={styles.locationString} numberOfLines={1}>
            {locationLabel || 'Colombo, Sri Lanka'}
          </Text>
        </View>
        <View style={styles.avatarPlaceholder}>
          <Icon name="person" size={20} color={Colors.white} />
        </View>
      </View>

      {/* Places Autocomplete search bar */}
      <View>
        <GooglePlacesAutocomplete
          ref={searchRef}
        placeholder="Search for Location You Want to Get Offer"
        fetchDetails={true}
        
        onPress={(data, details = null) => {
          if (details) {
            const lat = details.geometry.location.lat;
            const lng = details.geometry.location.lng;
            const name = data.structured_formatting?.main_text || data.description;
            const placeId = details.place_id;
            onPlaceSelected(lat, lng, name, placeId);
            // Keep the selected text in the input
          }
        }}
        query={{
          key: GOOGLE_API_KEY,
          language: 'en',
          // Bias to Sri Lanka
          components: 'country:lk',
        }}
        GooglePlacesSearchQuery={{
          rankby: 'distance',
          type: 'restaurant',
        }}
        enablePoweredByContainer={false}
        minLength={2}
        debounce={300}
        styles={{
          container: {
            flex: 0,
          },
          textInputContainer: {
            backgroundColor: Colors.grey,
            borderRadius: 12,
            paddingHorizontal: 4,
            height: 44,
          },
          textInput: {
            backgroundColor: 'transparent',
            fontSize: 13,
            color: Colors.black,
            height: 44,
            marginTop: 0,
            marginBottom: 0,
          },
          listView: {
            position: 'absolute',
            top: 48,
            left: 0,
            right: 0,
            backgroundColor: Colors.white,
            borderRadius: 12,
            marginTop: 4,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.12,
            shadowRadius: 10,
            elevation: 8,
            zIndex: 1000,
          },
          row: {
            paddingVertical: 12,
            paddingHorizontal: 16,
          },
          description: {
            fontSize: 13,
            color: Colors.black,
          },
          predefinedPlacesDescription: {
            color: Colors.purple,
          },
          separator: {
            backgroundColor: Colors.grey,
            height: 1,
          },
          poweredContainer: {
            display: 'none',
          },
        }}
        renderLeftButton={() => (
          <View style={styles.searchIconWrapper}>
            <Icon name="search" size={20} color={Colors.greyDark} />
          </View>
        )}
        renderRightButton={() => (
          <TouchableOpacity 
            style={styles.clearIconWrapper} 
            onPress={() => {
              searchRef?.current?.setAddressText('');
              searchRef?.current?.clear();
              Keyboard.dismiss();
              if (onClearSearch) onClearSearch();
            }}>
            <Icon name="close" size={20} color={Colors.greyDark} />
          </TouchableOpacity>
        )}
        textInputProps={{
          placeholderTextColor: Colors.greyMid,
          clearButtonMode: 'always',
        }}
        />
      </View>

      <View>
        <FilterChips selected={selectedFilter} onSelect={onSelectFilter} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 20,
    // left: 16,
    // right: 16,
    backgroundColor: Colors.card,
    // borderRadius: 20,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 14,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 100,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  locationText: {
    flex: 1,
  },
  offersNear: {
    fontSize: 11,
    color: Colors.greyDark,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  locationString: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
    marginTop: 1,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 4,
    height: 44,
  },
  clearIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 10,
    paddingLeft: 4,
    height: 44,
  },
});

export default Header;
