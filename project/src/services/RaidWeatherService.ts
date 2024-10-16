import { WeatherGenerator } from "@spt/generators/WeatherGenerator";
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
        @inject("ConfigServer") protected configServer: ConfigServer,
    ) {
        this.weatherConfig = this.configServer.getConfig(ConfigTypes.WEATHER);

        this.generateWeather();
    }

    public generateWeather() {
        // When to start generating weather from
        const staringTimestamp = this.getLastFullHourTimestamp();

        // How far into future do we generate weather
        const futureTimestampToReach = staringTimestamp + this.timeUtil.getHoursAsSeconds(24) * 1000; // TODO move 24 to config
        // Keep adding new weather until we have reached desired future date
        let nextTimestamp = staringTimestamp;
        while (nextTimestamp <= futureTimestampToReach) {
            const newWeather = this.weatherGenerator.generateWeather(nextTimestamp);
            this.logger.warning(`Handling ${new Date(nextTimestamp)}`);
            this.weatherForecast.push(newWeather);
            nextTimestamp += 30 * 60 * 1000; // TODO move to config
        }
    }

    protected getLastFullHourTimestamp() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();

        // If minutes are greater than 0, subtract 1 hour to get last full hour
        if (minutes > 0) {
            hours--;
        }

        // Create a new Date object with the last full hour, 0 minutes, and 0 seconds
        const lastFullHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, 0, 0);

        // Return timestamp of last full hour
        return lastFullHour.getTime();
    }

    public getCurrentWeather(): IWeather {
        // Clear expired weather data
        this.weatherForecast = this.weatherForecast.filter((x) => x.timestamp < this.timeUtil.getTimestamp());

        // return first weather object that is greater than/equal to now
        const result = this.weatherForecast.find((x) => x.timestamp >= this.timeUtil.getTimestamp());
        if (!result) {
            this.generateWeather();
        }

        return this.weatherForecast.find((x) => x.timestamp >= this.timeUtil.getTimestamp());
    }

    public getUpcomingWeather(): IWeather[] {
        // Clear expired weather data
        this.weatherForecast = this.weatherForecast.filter((x) => x.timestamp < this.timeUtil.getTimestamp());

        // return first weather object that is greater than/equal to now
        const result = this.weatherForecast.filter((x) => x.timestamp >= this.timeUtil.getTimestamp());
        if (result.length === 0) {
            this.generateWeather();
        }

        return this.weatherForecast.filter((x) => x.timestamp >= this.timeUtil.getTimestamp());
    }
}
