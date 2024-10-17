import { WeatherGenerator } from "@spt/generators/WeatherGenerator";
import { WeightedRandomHelper } from "@spt/helpers/WeightedRandomHelper";
import { IWeather } from "@spt/models/eft/weather/IWeatherData";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { IWeatherConfig } from "@spt/models/spt/config/IWeatherConfig";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { DatabaseService } from "@spt/services/DatabaseService";
import { TimeUtil } from "@spt/utils/TimeUtil";
import { inject, injectable } from "tsyringe";

@injectable()
export class RaidWeatherService {
    protected weatherConfig: IWeatherConfig;
    protected weatherForecast: IWeather[] = [];

    constructor(
        @inject("PrimaryLogger") protected logger: ILogger,
        @inject("DatabaseService") protected databaseService: DatabaseService,
        @inject("TimeUtil") protected timeUtil: TimeUtil,
        @inject("WeatherGenerator") protected weatherGenerator: WeatherGenerator,
        @inject("WeightedRandomHelper") protected weightedRandomHelper: WeightedRandomHelper,
        @inject("ConfigServer") protected configServer: ConfigServer,
    ) {
        this.weatherConfig = this.configServer.getConfig(ConfigTypes.WEATHER);

        this.generateWeather();
    }

    /**
     * Generate 24 hours of weather data starting from midnight today
     */
    public generateWeather() {
        // When to start generating weather from in milliseconds
        const staringTimestampMs = this.timeUtil.getTodaysMidnightTimestamp();

        // How far into future do we generate weather
        const futureTimestampToReachMs =
            staringTimestampMs +
            this.timeUtil.getHoursAsSeconds(this.weatherConfig.weather.generateWeatherAmountHours) * 1000; // Convert to milliseconds

        // Keep adding new weather until we have reached desired future date
        let nextTimestampMs = staringTimestampMs;
        while (nextTimestampMs <= futureTimestampToReachMs) {
            const newWeather = this.weatherGenerator.generateWeather(nextTimestampMs);
            this.logger.warning(`Handling ${new Date(nextTimestampMs)}`);
            this.weatherForecast.push(newWeather);
            nextTimestampMs += this.getWeightedWeatherTimePeriodMs();
        }
    }

    protected getWeightedWeatherTimePeriodMs(): number {
        const chosenTimePeriodMinutes = this.weightedRandomHelper.weightedRandom(
            this.weatherConfig.weather.timePeriod.values,
            this.weatherConfig.weather.timePeriod.weights,
        ).item;

        return chosenTimePeriodMinutes * 60 * 1000; // Convert to milliseconds
    }

    /**
     * Find the first matching weather object that applies to the current time
     */
    public getCurrentWeather(): IWeather {
        this.validateWeatherDataExists();

        return this.weatherForecast.find((x) => x.timestamp >= this.timeUtil.getTimestamp());
    }

    /**
     * Find the first matching weather object that applies to the current time + all following weather data generated
     */
    public getUpcomingWeather(): IWeather[] {
        this.validateWeatherDataExists();

        return this.weatherForecast.filter((x) => x.timestamp >= this.timeUtil.getTimestamp());
    }

    /**
     * Ensure future weather data exists
     */
    protected validateWeatherDataExists() {
        // Clear expired weather data
        this.weatherForecast = this.weatherForecast.filter((x) => x.timestamp < this.timeUtil.getTimestamp());

        // Check data exists for current time
        const result = this.weatherForecast.filter((x) => x.timestamp >= this.timeUtil.getTimestamp());
        if (result.length === 0) {
            // TODO - replace with better check, if < 1 hours worth of data exists?
            this.generateWeather();
        }
    }
}
