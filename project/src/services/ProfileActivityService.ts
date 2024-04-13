import { injectable } from "tsyringe";

@injectable()
export class ProfileActivityService
{
    protected profileActivityTimestamps: Record<string, number> = {};

    /**
     * Was the requested profile active in the last requested minutes
     * @param sessionId Profile to check
     * @param minutes Minutes to check for activity in
     * @returns True when profile was active within past x minutes
     */
    public activeWithinLastMinutes(sessionId: string, minutes: number): boolean
    {
        const currentTimestamp = new Date().getTime() / 1000;
        const storedActivityTimestamp = this.profileActivityTimestamps[sessionId];
        if (!storedActivityTimestamp)
        {
            // No value, no assumed activity (server offline?)
            return false;
        }

        // True if difference since last timestamp to now is below desired amount
        return (currentTimestamp - storedActivityTimestamp) < (minutes * 60); // convert minutes to seconds to compare
    }

    /**
     * Update the timestamp a profile was last observed active
     * @param sessionId Profile to update
     */
    public setActivityTimestamp(sessionId: string): void
    {
        this.profileActivityTimestamps[sessionId] = new Date().getTime() / 1000;
    }
}
