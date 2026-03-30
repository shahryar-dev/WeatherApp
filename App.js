import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, FlatList, Keyboard, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { fetchCitySuggestions, fetchWeather } from './src/services/api';
import { getWeatherIcon } from './src/utils/weatherIcons';

export default function App() {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Animation Values
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;

  // Background Animation Loop
  useEffect(() => {
    const startAnimations = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(float1, { toValue: 1, duration: 10000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(float1, { toValue: 0, duration: 10000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(float2, { toValue: 1, duration: 12000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(float2, { toValue: 0, duration: 12000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    };
    startAnimations();
  }, [float1, float2]);

  // Interpolate animation values into X and Y movements
  const translateY1 = float1.interpolate({ inputRange: [0, 1], outputRange: [0, -80] });
  const translateX1 = float1.interpolate({ inputRange: [0, 1], outputRange: [0, 50] });
  const translateY2 = float2.interpolate({ inputRange: [0, 1], outputRange: [0, 100] });
  const translateX2 = float2.interpolate({ inputRange: [0, 1], outputRange: [0, -60] });

  // Initial Load & Location Fetching
  useEffect(() => {
    const getInitialWeather = async () => {
      setLoading(true);
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          handleSearch('Islamabad');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        let geocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocode.length > 0) {
          const currentCity = geocode[0].city || geocode[0].region || 'Islamabad';
          handleSearch(currentCity);
        } else {
          handleSearch('Islamabad');
        }
      } catch (err) {
        handleSearch('Islamabad');
      }
    };

    getInitialWeather();
  }, []);

  const handleTextChange = async (text) => {
    setCity(text);
    if (text.length > 2) {
      const results = await fetchCitySuggestions(text);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = async (searchCity) => {
    if (!searchCity.trim()) return;
    
    Keyboard.dismiss();
    setSuggestions([]);
    setLoading(true);
    setError('');
    setCity(''); 
    
    const data = await fetchWeather(searchCity);
    if (data) {
      setWeatherData(data);
    } else {
      setError("Couldn't find that city. Try again!");
    }
    setLoading(false);
  };

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Animated Ambient Background */}
      <View style={StyleSheet.absoluteFillObject}>
        <Animated.View style={[styles.orb1, { transform: [{ translateY: translateY1 }, { translateX: translateX1 }] }]} />
        <Animated.View style={[styles.orb2, { transform: [{ translateY: translateY2 }, { translateX: translateX2 }] }]} />
      </View>

      {/* Search Bar Section */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search city..."
          placeholderTextColor="#888"
          value={city}
          onChangeText={handleTextChange}
          onSubmitEditing={() => handleSearch(city)}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(city)}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Dynamic Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => handleSearch(item.name)}
              >
                <Text style={styles.suggestionText}>
                  {item.name}{item.admin1 ? `, ${item.admin1}` : ''}
                </Text>
                <Text style={styles.suggestionCountry}>{item.country}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading && <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />}

      {!loading && weatherData && (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.mainCard}>
            <Text style={styles.locationText}>{weatherData.location}</Text>
            <Ionicons 
              name={getWeatherIcon(weatherData.current.weather_code, weatherData.current.is_day)} 
              size={120} 
              color="#fff" 
              style={styles.mainIcon} 
            />
            <Text style={styles.tempText}>{Math.round(weatherData.current.temperature_2m)}°</Text>
            <Text style={styles.feelsLike}>Feels like {Math.round(weatherData.current.apparent_temperature)}°</Text>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Ionicons name="water-outline" size={24} color="#88B0FF" />
                <Text style={styles.detailText}>{weatherData.current.relative_humidity_2m}%</Text>
                <Text style={styles.detailLabel}>Humidity</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="leaf-outline" size={24} color="#88B0FF" />
                <Text style={styles.detailText}>{weatherData.current.wind_speed_10m} km/h</Text>
                <Text style={styles.detailLabel}>Wind</Text>
              </View>
            </View>
          </View>

          <Text style={styles.forecastHeader}>7-Day Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
            {weatherData.daily.time.map((day, index) => {
              const date = new Date(day);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <View key={index} style={styles.forecastCard}>
                  <Text style={styles.forecastDay}>{index === 0 ? 'Today' : dayName}</Text>
                  <Ionicons 
                    name={getWeatherIcon(weatherData.daily.weather_code[index], 1)} 
                    size={40} 
                    color="#fff" 
                  />
                  <Text style={styles.forecastTempText}>
                    {Math.round(weatherData.daily.temperature_2m_max[index])}°
                  </Text>
                  <Text style={styles.forecastTempMin}>
                    {Math.round(weatherData.daily.temperature_2m_min[index])}°
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </ScrollView>
      )}
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  orb1: {
    position: 'absolute',
    top: '5%',
    left: '-20%',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(59, 130, 246, 0.15)', // Soft Blue
  },
  orb2: {
    position: 'absolute',
    bottom: '10%',
    right: '-20%',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(139, 92, 246, 0.15)', // Soft Purple
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    zIndex: 2, 
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    color: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 25,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 80 : 80,
    left: 20,
    right: 75, 
    backgroundColor: '#1E293B',
    borderRadius: 15,
    maxHeight: 200,
    zIndex: 10, 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 16,
  },
  suggestionCountry: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
  mainCard: {
    alignItems: 'center',
    margin: 20,
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mainIcon: {
    marginVertical: 20,
  },
  tempText: {
    color: '#fff',
    fontSize: 72,
    fontWeight: 'bold',
  },
  feelsLike: {
    color: '#94A3B8',
    fontSize: 18,
    marginBottom: 30,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 20,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 5,
  },
  detailLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  forecastHeader: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 15,
  },
  forecastScroll: {
    paddingLeft: 20,
    marginBottom: 30,
  },
  forecastCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 15,
    width: 90,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  forecastDay: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 10,
  },
  forecastTempText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  forecastTempMin: {
    color: '#64748B',
    fontSize: 14,
  }
});