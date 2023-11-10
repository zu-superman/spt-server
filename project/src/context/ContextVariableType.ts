export enum ContextVariableType
{
    SESSION_ID = 0, // Logged in users session id
    RAID_CONFIGURATION = 1, // Currently active raid information
    CLIENT_START_TIMESTAMP = 2, // Timestamp when client first connected
    REGISTER_PLAYER_REQUEST = 3, // When player is loading into map and loot is requested
}
