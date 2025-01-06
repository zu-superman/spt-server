import buildInfo from "@spt/entry/build.json" assert { type: "json" };
import { EntryType } from "./models/enums/EntryType";

// biome-ignore lint/complexity/noStaticOnlyClass:
export class ProgramStatics {
    private static _ENTRY_TYPE: EntryType;

    private static _DEBUG: boolean;
    private static _COMPILED: boolean;
    private static _MODS: boolean;

    private static _SPT_VERSION: string;
    private static _COMMIT: string;
    private static _BUILD_TIME: number;

    public static initialize(): void {
        ProgramStatics._ENTRY_TYPE = buildInfo.entryType as EntryType;
        ProgramStatics._SPT_VERSION = buildInfo.sptVersion ?? "";
        ProgramStatics._COMMIT = buildInfo.commit ?? "";
        ProgramStatics._BUILD_TIME = buildInfo.buildTime ?? 0;

        switch (ProgramStatics._ENTRY_TYPE) {
            case EntryType.RELEASE:
                ProgramStatics._DEBUG = false;
                ProgramStatics._COMPILED = true;
                ProgramStatics._MODS = true;
                break;
            case EntryType.BLEEDING_EDGE:
                ProgramStatics._DEBUG = true;
                ProgramStatics._COMPILED = true;
                ProgramStatics._MODS = false;
                break;
            case EntryType.DEBUG:
            case EntryType.BLEEDING_EDGE_MODS:
                ProgramStatics._DEBUG = true;
                ProgramStatics._COMPILED = true;
                ProgramStatics._MODS = true;
                break;
            default: // EntryType.LOCAL
                ProgramStatics._DEBUG = true;
                ProgramStatics._COMPILED = false;
                ProgramStatics._MODS = true;
                break;
        }
    }

    // Public Static Getters
    public static get ENTRY_TYPE(): EntryType {
        return ProgramStatics._ENTRY_TYPE;
    }
    public static get DEBUG(): boolean {
        return ProgramStatics._DEBUG;
    }
    public static get COMPILED(): boolean {
        return ProgramStatics._COMPILED;
    }
    public static get MODS(): boolean {
        return ProgramStatics._MODS;
    }
    public static get SPT_VERSION(): string {
        return ProgramStatics._SPT_VERSION;
    }
    public static get COMMIT(): string {
        return ProgramStatics._COMMIT;
    }
    public static get BUILD_TIME(): number {
        return ProgramStatics._BUILD_TIME;
    }
}
