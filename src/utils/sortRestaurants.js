/**
 * Sort restaurants by rating (desc) or distance (asc).
 * @param {Array} list  - array of restaurant objects
 * @param {'rating'|'distance'} criterion
 * @returns {Array} sorted copy
 */
export const sortRestaurants = (list, criterion = 'rating') => {
  const copy = [...list];
  if (criterion === 'rating') {
    return copy.sort((a, b) => b.rating - a.rating);
  }
  if (criterion === 'distance') {
    return copy.sort((a, b) => a.distance - b.distance);
  }
  return copy;
};

/**
 * Filter restaurants by cuisine category.
 * 'All' returns the full list.
 */
export const filterByCuisine = (list, cuisine) => {
  if (!cuisine || cuisine === 'All') return list;
  return list.filter(r => r.cuisine === cuisine);
};
