import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Linking, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { loadForecast, temperature, type ForecastDay } from './src/weather';
import { styles } from './src/styles';

export default function App() {
  const [city, setCity] = useState('');
  const [days, setDays] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const busy = useRef(false);
  const alive = useRef(true);

  async function refresh() {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    setNotice('');
    setDays([]);
    setCity('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error('Location permission denied. Enable it in Settings, then retry.');
      if (!await Location.hasServicesEnabledAsync()) throw new Error('Turn on device Location Services, then retry.');
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      let locationName = latitude.toFixed(3) + ', ' + longitude.toFixed(3);
      let locationNotice = '';
      try {
        const places = await Location.reverseGeocodeAsync({ latitude, longitude });
        const place = places[0];
        const name = place?.city ?? place?.district ?? place?.subregion;
        if (name) locationName = name;
        else locationNotice = 'City name is unavailable; coordinates are shown.';
      } catch {
        locationNotice = 'City lookup failed; the forecast still uses your actual location.';
      }
      const forecast = await loadForecast(latitude, longitude);
      if (!alive.current) return;
      setCity(locationName);
      setNotice(locationNotice);
      setDays(forecast);
    } catch (cause) {
      if (alive.current) {
        setError(cause instanceof Error ? cause.message : 'Could not load weather. Check network and try again.');
      }
    } finally {
      busy.current = false;
      if (alive.current) setLoading(false);
    }
  }

  useEffect(() => {
    alive.current = true;
    void refresh();
    return () => { alive.current = false; };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.title}>Weather forecast</Text>
          <Text style={styles.hint}>{city || 'Your current location'}</Text>
          <Button title={loading ? 'Loading…' : 'Refresh'} disabled={loading}
            onPress={() => { void refresh(); }} />
          {loading && <ActivityIndicator accessibilityLabel="Loading weather" />}
          {error !== '' && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          {error !== '' && <Button title="Open settings" onPress={() => { void Linking.openSettings(); }} />}
          {notice !== '' && <Text style={styles.hint}>{notice}</Text>}
          <FlatList
            data={days}
            keyExtractor={(day) => day.date}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.strong}>{item.date}</Text>
                <Text style={styles.label}>Min: {temperature(item.min)} / Max: {temperature(item.max)}</Text>
              </View>
            )}
          />
          <Text style={styles.hint}>7 days · air temperature at 2 m · Open-Meteo</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
