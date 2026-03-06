// Google Places REST API service

const PLACES_API_KEY = 'AIzaSyAB2dA6akyOVPMCMmfbP-qXf5h1X2hyhm0';
const BASE_URL = 'https://maps.googleapis.com/maps/api';

//Cuisine type mapping
const CUISINE_MAP = {
  cafe: 'Caffe',
  bakery: 'Desserts',
  ice_cream: 'Desserts',
  dessert: 'Desserts',
  coffee_shop: 'Caffe',
  restaurant: 'Restaurants',
  fast_food: 'FastFood',
  meal_takeaway: 'FastFood',
  meal_delivery: 'FastFood',
  food: 'Cuisines',
  bar: 'Drinks',
  liquor_store: 'Drinks',
};

const resolveCuisine = types => {
  const priorityTypes = [
    'bar', 'liquor_store', 'cafe', 'coffee_shop', 'bakery', 
    'ice_cream', 'dessert',
    'fast_food', 'meal_delivery', 'meal_takeaway', 'restaurant', 'food'
  ];
  for (const pt of priorityTypes) {
    if ((types || []).includes(pt) && CUISINE_MAP[pt]) {
      return CUISINE_MAP[pt];
    }
  }
  return 'Restaurants';
};

//Photo URL
export const getPhotoUrl = (photoReference, maxWidth = 600) => {
  if (!photoReference) return 'https://picsum.photos/seed/default/600/400';
  return `${BASE_URL}/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${PLACES_API_KEY}`;
};

//Normalise a Places API result to our restaurant shape
const normalise = place => ({
  id: place.place_id,
  name: place.name,
  cuisine: resolveCuisine(place.types),
  rating: place.rating ?? 4.0,
  distance: 0, // calculated in MapScreen from user location
  discount: 'Discount upto 20%',
  lat: place.geometry.location.lat,
  lng: place.geometry.location.lng,
  image: place.photos?.[0]?.photo_reference
    ? getPhotoUrl(place.photos[0].photo_reference)
    : `https://picsum.photos/seed/${place.place_id}/600/400`,
  deliveryDays: 5,
  vicinity: place.vicinity || '',
});

// Fetch specific Place Details
export const fetchPlaceDetails = async (placeId) => {
  const url = `${BASE_URL}/place/details/json?place_id=${placeId}&key=${PLACES_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = await response.json();
    if (json.status !== 'OK' || !json.result) return null;

    // Reject places that are not related to food/drinks
    const priorityTypes = [
      'bar', 'liquor_store', 'cafe', 'coffee_shop', 'bakery', 
      'ice_cream', 'dessert',
      'fast_food', 'meal_delivery', 'meal_takeaway', 'restaurant', 'food'
    ];
    const isFoodRelated = (json.result.types || []).some(type => priorityTypes.includes(type));
    
    if (!isFoodRelated) {
      console.warn(`Rejected non-food place: ${json.result.name}`);
      return null;
    }

    return normalise(json.result);
  } catch (e) {
    console.warn(`Place details failed for ${placeId}:`, e);
    return null;
  }
};

// Reverse Geocode
export const fetchAddressFromCoords = async (lat, lng) => {
  const url = `${BASE_URL}/geocode/json?latlng=${lat},${lng}&key=${PLACES_API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = await response.json();
    if (json.status !== 'OK' || !json.results.length) return null;
    
    // Attempt to grab the most relevant formatted address
    return json.results[0].formatted_address;
  } catch (e) {
    console.warn(`Reverse geocode failed for ${lat},${lng}:`, e);
    return null;
  }
};

// Fetch nearby restaurants
export const fetchNearbyRestaurants = async (lat, lng, radius = 100000) => {
  // Concurrently request types for robust results
  const typesToFetch = [
    'restaurant',
    'cafe',
    'bakery',
    'bar',
    'meal_takeaway',
    'liquor_store',
  ];

  const fetchPromises = typesToFetch.map(async (type) => {
    const url =
      `${BASE_URL}/place/nearbysearch/json` +
      `?location=${lat},${lng}` +
      `&radius=${radius}` +
      `&type=${type}` +
      `&key=${PLACES_API_KEY}`;

    try {
      const response = await fetch(url);
      if (!response.ok) return [];

      const json = await response.json();
      if (json.status !== 'OK' && json.status !== 'ZERO_RESULTS') {
        console.warn(`Places API error for type ${type}: ${json.status}`);
        return [];
      }
      return (json.results || []).map(normalise);
    } catch (e) {
      console.warn(`Fetch completely failed for type ${type}`, e);
      return [];
    }
  });

  const resultsArray = await Promise.all(fetchPromises);
  const flatResults = resultsArray.flat();
  
  // Remove duplicate places
  const seen = new Set();
  return flatResults.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
};

//Distance calculation
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
};
