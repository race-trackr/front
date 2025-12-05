import { WeatherForecast, WeatherCondition, TrackCondition } from '@/types';

// This is a mock function. In a real application, this would call a backend API
// which in turn would integrate with a third-party weather service (e.g., OpenWeatherMap, AccuWeather).
export const getWeatherForecast = async (trackId: number, date: string): Promise<WeatherForecast | null> => {
  console.log(`Simulating weather forecast for track ${trackId} on ${date}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate some mock data based on trackId and date
  const seed = trackId + date.length; // Simple seed for variety
  const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const mockWeather: WeatherCondition[] = ['clear', 'cloudy', 'rainy'];
  const mockTrackCondition: TrackCondition[] = ['dry', 'moist', 'wet'];

  if (seed % 5 === 0) { // Simulate no forecast sometimes
    return null;
  }

  return {
    date: date,
    weather: mockWeather[random(0, mockWeather.length - 1)],
    airTemperature: random(5, 30),
    trackTemperature: random(10, 45),
    trackCondition: mockTrackCondition[random(0, mockTrackCondition.length - 1)],
  };
};