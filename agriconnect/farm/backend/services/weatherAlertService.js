const axios = require("axios");
const cron = require("node-cron");
const User = require("../../models/User");
const Notification = require("../../models/Notification");

class WeatherAlertService {
  constructor() {
    // Weather thresholds for alerts
    this.thresholds = {
      temperature: { min: 5, max: 35 },
      rainfall: { min: 0, max: 50 },
      humidity: { min: 30, max: 80 },
    };
  }

  async checkWeatherConditions(location) {
    try {
      // Replace with your weather API key and endpoint
      const response = await axios.get(`YOUR_WEATHER_API_ENDPOINT`, {
        params: {
          lat: location.latitude,
          lon: location.longitude,
          appid: process.env.WEATHER_API_KEY,
        },
      });

      return {
        temperature: response.data.main.temp,
        humidity: response.data.main.humidity,
        rainfall: response.data.rain?.["1h"] || 0,
        conditions: response.data.weather[0].main,
      };
    } catch (error) {
      console.error("Weather API Error:", error);
      throw error;
    }
  }

  async createAlert(userId, message, severity) {
    try {
      await Notification.create({
        user: userId,
        message,
        type: "weather",
        severity,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Alert Creation Error:", error);
      throw error;
    }
  }

  async monitorWeather() {
    try {
      const users = await User.find({ farmLocation: { $exists: true } });

      for (const user of users) {
        const weather = await this.checkWeatherConditions(user.farmLocation);

        // Check temperature
        if (weather.temperature < this.thresholds.temperature.min) {
          await this.createAlert(
            user._id,
            `Warning: Low temperature alert (${weather.temperature}°C) - Protect your crops from frost`,
            "high"
          );
        }

        if (weather.temperature > this.thresholds.temperature.max) {
          await this.createAlert(
            user._id,
            `Warning: High temperature alert (${weather.temperature}°C) - Consider additional irrigation`,
            "high"
          );
        }

        // Check rainfall
        if (weather.rainfall > this.thresholds.rainfall.max) {
          await this.createAlert(
            user._id,
            `Warning: Heavy rainfall alert (${weather.rainfall}mm) - Check drainage systems`,
            "high"
          );
        }

        // Add forecast-based alerts
        if (weather.conditions === "Storm") {
          await this.createAlert(
            user._id,
            "Storm approaching - Take necessary precautions to protect crops",
            "critical"
          );
        }
      }
    } catch (error) {
      console.error("Weather Monitoring Error:", error);
      throw error;
    }
  }
}

const weatherAlertService = new WeatherAlertService();

// Schedule weather monitoring every 3 hours
cron.schedule("0 */3 * * *", () => {
  weatherAlertService.monitorWeather();
});

module.exports = weatherAlertService;
