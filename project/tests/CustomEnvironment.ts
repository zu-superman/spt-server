import "reflect-metadata";
import { container, DependencyContainer, Lifecycle } from "tsyringe";

// Import everything we intend to test so we can register it in the Jest custom environment.
import { BotCallbacks } from "@spt-aki/callbacks/BotCallbacks";
import { BundleCallbacks } from "@spt-aki/callbacks/BundleCallbacks";
import { ClientLogCallbacks } from "@spt-aki/callbacks/ClientLogCallbacks";
import { CustomizationCallbacks } from "@spt-aki/callbacks/CustomizationCallbacks";
import { DataCallbacks } from "@spt-aki/callbacks/DataCallbacks";
import { DialogueCallbacks } from "@spt-aki/callbacks/DialogueCallbacks";
import { GameCallbacks } from "@spt-aki/callbacks/GameCallbacks";
import { HandbookCallbacks } from "@spt-aki/callbacks/HandbookCallbacks";
import { HealthCallbacks } from "@spt-aki/callbacks/HealthCallbacks";
import { HideoutCallbacks } from "@spt-aki/callbacks/HideoutCallbacks";
import { HttpCallbacks } from "@spt-aki/callbacks/HttpCallbacks";
import { InraidCallbacks } from "@spt-aki/callbacks/InraidCallbacks";
import { InsuranceCallbacks } from "@spt-aki/callbacks/InsuranceCallbacks";
import { InventoryCallbacks } from "@spt-aki/callbacks/InventoryCallbacks";
import { ItemEventCallbacks } from "@spt-aki/callbacks/ItemEventCallbacks";
import { LauncherCallbacks } from "@spt-aki/callbacks/LauncherCallbacks";
import { LocationCallbacks } from "@spt-aki/callbacks/LocationCallbacks";
import { MatchCallbacks } from "@spt-aki/callbacks/MatchCallbacks";
import { ModCallbacks } from "@spt-aki/callbacks/ModCallbacks";
import { NoteCallbacks } from "@spt-aki/callbacks/NoteCallbacks";
import { NotifierCallbacks } from "@spt-aki/callbacks/NotifierCallbacks";
import { PresetBuildCallbacks } from "@spt-aki/callbacks/PresetBuildCallbacks";
import { PresetCallbacks } from "@spt-aki/callbacks/PresetCallbacks";
import { ProfileCallbacks } from "@spt-aki/callbacks/ProfileCallbacks";
import { QuestCallbacks } from "@spt-aki/callbacks/QuestCallbacks";
import { RagfairCallbacks } from "@spt-aki/callbacks/RagfairCallbacks";
import { RepairCallbacks } from "@spt-aki/callbacks/RepairCallbacks";
import { SaveCallbacks } from "@spt-aki/callbacks/SaveCallbacks";
import { TradeCallbacks } from "@spt-aki/callbacks/TradeCallbacks";
import { TraderCallbacks } from "@spt-aki/callbacks/TraderCallbacks";
import { WeatherCallbacks } from "@spt-aki/callbacks/WeatherCallbacks";
import { WishlistCallbacks } from "@spt-aki/callbacks/WishlistCallbacks";
import { ApplicationContext } from "@spt-aki/context/ApplicationContext";
import { BotController } from "@spt-aki/controllers/BotController";
import { ClientLogController } from "@spt-aki/controllers/ClientLogController";
import { CustomizationController } from "@spt-aki/controllers/CustomizationController";
import { DialogueController } from "@spt-aki/controllers/DialogueController";
import { GameController } from "@spt-aki/controllers/GameController";
import { HandbookController } from "@spt-aki/controllers/HandbookController";
import { HealthController } from "@spt-aki/controllers/HealthController";
import { HideoutController } from "@spt-aki/controllers/HideoutController";
import { InraidController } from "@spt-aki/controllers/InraidController";
import { InsuranceController } from "@spt-aki/controllers/InsuranceController";
import { InventoryController } from "@spt-aki/controllers/InventoryController";
import { LauncherController } from "@spt-aki/controllers/LauncherController";
import { LocationController } from "@spt-aki/controllers/LocationController";
import { MatchController } from "@spt-aki/controllers/MatchController";
import { NoteController } from "@spt-aki/controllers/NoteController";
import { NotifierController } from "@spt-aki/controllers/NotifierController";
import { PresetBuildController } from "@spt-aki/controllers/PresetBuildController";
import { PresetController } from "@spt-aki/controllers/PresetController";
import { ProfileController } from "@spt-aki/controllers/ProfileController";
import { QuestController } from "@spt-aki/controllers/QuestController";
import { RagfairController } from "@spt-aki/controllers/RagfairController";
import { RepairController } from "@spt-aki/controllers/RepairController";
import { RepeatableQuestController } from "@spt-aki/controllers/RepeatableQuestController";
import { TradeController } from "@spt-aki/controllers/TradeController";
import { TraderController } from "@spt-aki/controllers/TraderController";
import { WeatherController } from "@spt-aki/controllers/WeatherController";
import { WishlistController } from "@spt-aki/controllers/WishlistController";
import { BotEquipmentModGenerator } from "@spt-aki/generators/BotEquipmentModGenerator";
import { BotGenerator } from "@spt-aki/generators/BotGenerator";
import { BotInventoryGenerator } from "@spt-aki/generators/BotInventoryGenerator";
import { BotLevelGenerator } from "@spt-aki/generators/BotLevelGenerator";
import { BotLootGenerator } from "@spt-aki/generators/BotLootGenerator";
import { BotWeaponGenerator } from "@spt-aki/generators/BotWeaponGenerator";
import { FenceBaseAssortGenerator } from "@spt-aki/generators/FenceBaseAssortGenerator";
import { LocationGenerator } from "@spt-aki/generators/LocationGenerator";
import { LootGenerator } from "@spt-aki/generators/LootGenerator";
import { PMCLootGenerator } from "@spt-aki/generators/PMCLootGenerator";
import { PlayerScavGenerator } from "@spt-aki/generators/PlayerScavGenerator";
import { RagfairAssortGenerator } from "@spt-aki/generators/RagfairAssortGenerator";
import { RagfairOfferGenerator } from "@spt-aki/generators/RagfairOfferGenerator";
import { RepeatableQuestGenerator } from "@spt-aki/generators/RepeatableQuestGenerator";
import { ScavCaseRewardGenerator } from "@spt-aki/generators/ScavCaseRewardGenerator";
import { WeatherGenerator } from "@spt-aki/generators/WeatherGenerator";
import { BarrelInventoryMagGen } from "@spt-aki/generators/weapongen/implementations/BarrelInventoryMagGen";
import { ExternalInventoryMagGen } from "@spt-aki/generators/weapongen/implementations/ExternalInventoryMagGen";
import { InternalMagazineInventoryMagGen } from "@spt-aki/generators/weapongen/implementations/InternalMagazineInventoryMagGen";
import { UbglExternalMagGen } from "@spt-aki/generators/weapongen/implementations/UbglExternalMagGen";
import { AssortHelper } from "@spt-aki/helpers/AssortHelper";
import { BotDifficultyHelper } from "@spt-aki/helpers/BotDifficultyHelper";
import { BotGeneratorHelper } from "@spt-aki/helpers/BotGeneratorHelper";
import { BotHelper } from "@spt-aki/helpers/BotHelper";
import { BotWeaponGeneratorHelper } from "@spt-aki/helpers/BotWeaponGeneratorHelper";
import { ContainerHelper } from "@spt-aki/helpers/ContainerHelper";
import { DialogueHelper } from "@spt-aki/helpers/DialogueHelper";
import { DurabilityLimitsHelper } from "@spt-aki/helpers/DurabilityLimitsHelper";
import { GameEventHelper } from "@spt-aki/helpers/GameEventHelper";
import { HandbookHelper } from "@spt-aki/helpers/HandbookHelper";
import { HealthHelper } from "@spt-aki/helpers/HealthHelper";
import { HideoutHelper } from "@spt-aki/helpers/HideoutHelper";
import { HttpServerHelper } from "@spt-aki/helpers/HttpServerHelper";
import { InRaidHelper } from "@spt-aki/helpers/InRaidHelper";
import { InventoryHelper } from "@spt-aki/helpers/InventoryHelper";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { NotificationSendHelper } from "@spt-aki/helpers/NotificationSendHelper";
import { NotifierHelper } from "@spt-aki/helpers/NotifierHelper";
import { PaymentHelper } from "@spt-aki/helpers/PaymentHelper";
import { PresetHelper } from "@spt-aki/helpers/PresetHelper";
import { ProbabilityHelper } from "@spt-aki/helpers/ProbabilityHelper";
import { ProfileHelper } from "@spt-aki/helpers/ProfileHelper";
import { QuestConditionHelper } from "@spt-aki/helpers/QuestConditionHelper";
import { QuestHelper } from "@spt-aki/helpers/QuestHelper";
import { RagfairHelper } from "@spt-aki/helpers/RagfairHelper";
import { RagfairOfferHelper } from "@spt-aki/helpers/RagfairOfferHelper";
import { RagfairSellHelper } from "@spt-aki/helpers/RagfairSellHelper";
import { RagfairServerHelper } from "@spt-aki/helpers/RagfairServerHelper";
import { RagfairSortHelper } from "@spt-aki/helpers/RagfairSortHelper";
import { RepairHelper } from "@spt-aki/helpers/RepairHelper";
import { RepeatableQuestHelper } from "@spt-aki/helpers/RepeatableQuestHelper";
import { SecureContainerHelper } from "@spt-aki/helpers/SecureContainerHelper";
import { TradeHelper } from "@spt-aki/helpers/TradeHelper";
import { TraderAssortHelper } from "@spt-aki/helpers/TraderAssortHelper";
import { TraderHelper } from "@spt-aki/helpers/TraderHelper";
import { UtilityHelper } from "@spt-aki/helpers/UtilityHelper";
import { WeightedRandomHelper } from "@spt-aki/helpers/WeightedRandomHelper";
import { BundleLoader } from "@spt-aki/loaders/BundleLoader";
import { ModLoadOrder } from "@spt-aki/loaders/ModLoadOrder";
import { ModTypeCheck } from "@spt-aki/loaders/ModTypeCheck";
import { PostAkiModLoader } from "@spt-aki/loaders/PostAkiModLoader";
import { PostDBModLoader } from "@spt-aki/loaders/PostDBModLoader";
import { PreAkiModLoader } from "@spt-aki/loaders/PreAkiModLoader";
import { IAsyncQueue } from "@spt-aki/models/spt/utils/IAsyncQueue";
import { IUUidGenerator } from "@spt-aki/models/spt/utils/IUuidGenerator";
import { EventOutputHolder } from "@spt-aki/routers/EventOutputHolder";
import { HttpRouter } from "@spt-aki/routers/HttpRouter";
import { ImageRouter } from "@spt-aki/routers/ImageRouter";
import { ItemEventRouter } from "@spt-aki/routers/ItemEventRouter";
import { BotDynamicRouter } from "@spt-aki/routers/dynamic/BotDynamicRouter";
import { BundleDynamicRouter } from "@spt-aki/routers/dynamic/BundleDynamicRouter";
import { CustomizationDynamicRouter } from "@spt-aki/routers/dynamic/CustomizationDynamicRouter";
import { DataDynamicRouter } from "@spt-aki/routers/dynamic/DataDynamicRouter";
import { HttpDynamicRouter } from "@spt-aki/routers/dynamic/HttpDynamicRouter";
import { InraidDynamicRouter } from "@spt-aki/routers/dynamic/InraidDynamicRouter";
import { LocationDynamicRouter } from "@spt-aki/routers/dynamic/LocationDynamicRouter";
import { NotifierDynamicRouter } from "@spt-aki/routers/dynamic/NotifierDynamicRouter";
import { TraderDynamicRouter } from "@spt-aki/routers/dynamic/TraderDynamicRouter";
import { CustomizationItemEventRouter } from "@spt-aki/routers/item_events/CustomizationItemEventRouter";
import { HealthItemEventRouter } from "@spt-aki/routers/item_events/HealthItemEventRouter";
import { HideoutItemEventRouter } from "@spt-aki/routers/item_events/HideoutItemEventRouter";
import { InsuranceItemEventRouter } from "@spt-aki/routers/item_events/InsuranceItemEventRouter";
import { InventoryItemEventRouter } from "@spt-aki/routers/item_events/InventoryItemEventRouter";
import { NoteItemEventRouter } from "@spt-aki/routers/item_events/NoteItemEventRouter";
import { PresetBuildItemEventRouter } from "@spt-aki/routers/item_events/PresetBuildItemEventRouter";
import { QuestItemEventRouter } from "@spt-aki/routers/item_events/QuestItemEventRouter";
import { RagfairItemEventRouter } from "@spt-aki/routers/item_events/RagfairItemEventRouter";
import { RepairItemEventRouter } from "@spt-aki/routers/item_events/RepairItemEventRouter";
import { TradeItemEventRouter } from "@spt-aki/routers/item_events/TradeItemEventRouter";
import { WishlistItemEventRouter } from "@spt-aki/routers/item_events/WishlistItemEventRouter";
import { HealthSaveLoadRouter } from "@spt-aki/routers/save_load/HealthSaveLoadRouter";
import { InraidSaveLoadRouter } from "@spt-aki/routers/save_load/InraidSaveLoadRouter";
import { InsuranceSaveLoadRouter } from "@spt-aki/routers/save_load/InsuranceSaveLoadRouter";
import { ProfileSaveLoadRouter } from "@spt-aki/routers/save_load/ProfileSaveLoadRouter";
import { BundleSerializer } from "@spt-aki/routers/serializers/BundleSerializer";
import { ImageSerializer } from "@spt-aki/routers/serializers/ImageSerializer";
import { NotifySerializer } from "@spt-aki/routers/serializers/NotifySerializer";
import { BotStaticRouter } from "@spt-aki/routers/static/BotStaticRouter";
import { BundleStaticRouter } from "@spt-aki/routers/static/BundleStaticRouter";
import { ClientLogStaticRouter } from "@spt-aki/routers/static/ClientLogStaticRouter";
import { CustomizationStaticRouter } from "@spt-aki/routers/static/CustomizationStaticRouter";
import { DataStaticRouter } from "@spt-aki/routers/static/DataStaticRouter";
import { DialogStaticRouter } from "@spt-aki/routers/static/DialogStaticRouter";
import { GameStaticRouter } from "@spt-aki/routers/static/GameStaticRouter";
import { HealthStaticRouter } from "@spt-aki/routers/static/HealthStaticRouter";
import { InraidStaticRouter } from "@spt-aki/routers/static/InraidStaticRouter";
import { InsuranceStaticRouter } from "@spt-aki/routers/static/InsuranceStaticRouter";
import { ItemEventStaticRouter } from "@spt-aki/routers/static/ItemEventStaticRouter";
import { LauncherStaticRouter } from "@spt-aki/routers/static/LauncherStaticRouter";
import { LocationStaticRouter } from "@spt-aki/routers/static/LocationStaticRouter";
import { MatchStaticRouter } from "@spt-aki/routers/static/MatchStaticRouter";
import { NotifierStaticRouter } from "@spt-aki/routers/static/NotifierStaticRouter";
import { PresetStaticRouter } from "@spt-aki/routers/static/PresetStaticRouter";
import { ProfileStaticRouter } from "@spt-aki/routers/static/ProfileStaticRouter";
import { QuestStaticRouter } from "@spt-aki/routers/static/QuestStaticRouter";
import { RagfairStaticRouter } from "@spt-aki/routers/static/RagfairStaticRouter";
import { TraderStaticRouter } from "@spt-aki/routers/static/TraderStaticRouter";
import { WeatherStaticRouter } from "@spt-aki/routers/static/WeatherStaticRouter";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { HttpServer } from "@spt-aki/servers/HttpServer";
import { RagfairServer } from "@spt-aki/servers/RagfairServer";
import { SaveServer } from "@spt-aki/servers/SaveServer";
import { WebSocketServer } from "@spt-aki/servers/WebSocketServer";
import { HttpBufferHandler } from "@spt-aki/servers/http/HttpBufferHandler";
import { BotEquipmentFilterService } from "@spt-aki/services/BotEquipmentFilterService";
import { BotEquipmentModPoolService } from "@spt-aki/services/BotEquipmentModPoolService";
import { BotGenerationCacheService } from "@spt-aki/services/BotGenerationCacheService";
import { BotLootCacheService } from "@spt-aki/services/BotLootCacheService";
import { BotWeaponModLimitService } from "@spt-aki/services/BotWeaponModLimitService";
import { CustomLocationWaveService } from "@spt-aki/services/CustomLocationWaveService";
import { FenceService } from "@spt-aki/services/FenceService";
import { GiftService } from "@spt-aki/services/GiftService";
import { HashCacheService } from "@spt-aki/services/HashCacheService";
import { InsuranceService } from "@spt-aki/services/InsuranceService";
import { ItemBaseClassService } from "@spt-aki/services/ItemBaseClassService";
import { ItemFilterService } from "@spt-aki/services/ItemFilterService";
import { LocaleService } from "@spt-aki/services/LocaleService";
import { LocalisationService } from "@spt-aki/services/LocalisationService";
import { MailSendService } from "@spt-aki/services/MailSendService";
import { MatchBotDetailsCacheService } from "@spt-aki/services/MatchBotDetailsCacheService";
import { MatchLocationService } from "@spt-aki/services/MatchLocationService";
import { ModCompilerService } from "@spt-aki/services/ModCompilerService";
import { NotificationService } from "@spt-aki/services/NotificationService";
import { OpenZoneService } from "@spt-aki/services/OpenZoneService";
import { PaymentService } from "@spt-aki/services/PaymentService";
import { PlayerService } from "@spt-aki/services/PlayerService";
import { PmcChatResponseService } from "@spt-aki/services/PmcChatResponseService";
import { ProfileFixerService } from "@spt-aki/services/ProfileFixerService";
import { ProfileSnapshotService } from "@spt-aki/services/ProfileSnapshotService";
import { RagfairCategoriesService } from "@spt-aki/services/RagfairCategoriesService";
import { RagfairLinkedItemService } from "@spt-aki/services/RagfairLinkedItemService";
import { RagfairOfferService } from "@spt-aki/services/RagfairOfferService";
import { RagfairPriceService } from "@spt-aki/services/RagfairPriceService";
import { RagfairRequiredItemsService } from "@spt-aki/services/RagfairRequiredItemsService";
import { RagfairTaxService } from "@spt-aki/services/RagfairTaxService";
import { RepairService } from "@spt-aki/services/RepairService";
import { SeasonalEventService } from "@spt-aki/services/SeasonalEventService";
import { TraderAssortService } from "@spt-aki/services/TraderAssortService";
import { TraderPurchasePersisterService } from "@spt-aki/services/TraderPurchasePersisterService";
import { CustomItemService } from "@spt-aki/services/mod/CustomItemService";
import { DynamicRouterModService } from "@spt-aki/services/mod/dynamicRouter/DynamicRouterModService";
import { HttpListenerModService } from "@spt-aki/services/mod/httpListener/HttpListenerModService";
import { ImageRouteService } from "@spt-aki/services/mod/image/ImageRouteService";
import { OnLoadModService } from "@spt-aki/services/mod/onLoad/OnLoadModService";
import { OnUpdateModService } from "@spt-aki/services/mod/onUpdate/OnUpdateModService";
import { StaticRouterModService } from "@spt-aki/services/mod/staticRouter/StaticRouterModService";
import { App } from "@spt-aki/utils/App";
import { AsyncQueue } from "@spt-aki/utils/AsyncQueue";
import { DatabaseImporter } from "@spt-aki/utils/DatabaseImporter";
import { EncodingUtil } from "@spt-aki/utils/EncodingUtil";
import { HashUtil } from "@spt-aki/utils/HashUtil";
import { HttpFileUtil } from "@spt-aki/utils/HttpFileUtil";
import { HttpResponseUtil } from "@spt-aki/utils/HttpResponseUtil";
import { ImporterUtil } from "@spt-aki/utils/ImporterUtil";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { MathUtil } from "@spt-aki/utils/MathUtil";
import { ObjectId } from "@spt-aki/utils/ObjectId";
import { RandomUtil } from "@spt-aki/utils/RandomUtil";
import { TimeUtil } from "@spt-aki/utils/TimeUtil";
import { UUidGenerator } from "@spt-aki/utils/UUidGenerator";
import { VFS } from "@spt-aki/utils/VFS";
import { Watermark, WatermarkLocale } from "@spt-aki/utils/Watermark";
import { WinstonMainLogger } from "@spt-aki/utils/logging/WinstonMainLogger";
import { WinstonRequestLogger } from "@spt-aki/utils/logging/WinstonRequestLogger";

// For the Jest Custom Environment.
import NodeEnvironment from "jest-environment-node";
import type { EnvironmentContext, JestEnvironmentConfig } from "@jest/environment";

// Used for importing the database.
import path from "path";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";

export default class CustomEnvironment extends NodeEnvironment
{
    private container: DependencyContainer;

    // For importing the database.
    private importerUtil: ImporterUtil;
    private databaseServer: DatabaseServer;

    constructor(config: JestEnvironmentConfig, context: EnvironmentContext)
    {
        super(config, context);

        this.container = this.register(container);
    }

    async setup(): Promise<void>
    {
        await super.setup();

        // Import the database.
        await this.importDatabase();

        // Make the container accessible to the tests.
        this.global.container = this.container;

        // TODO: Create test account/profile
    }

    async teardown(): Promise<void>
    {
        // TODO: Delete test account/profile

        await super.teardown();
    }

    // Register all of the things!
    private register(container: DependencyContainer): DependencyContainer
    {
        container.register("ApplicationContext", ApplicationContext, { lifecycle: Lifecycle.Singleton });

        this.registerUtils(container);
        this.registerRouters(container);
        this.registerGenerators(container);
        this.registerHelpers(container);
        this.registerLoaders(container);
        this.registerCallbacks(container);
        this.registerServers(container);
        this.registerServices(container);
        this.registerControllers(container);

        this.registerListTypes(container);

        return container;
    }

    private registerUtils(container: DependencyContainer): void
    {
        // Utils
        container.register<App>("App", App, { lifecycle: Lifecycle.Singleton });
        container.register<DatabaseImporter>("DatabaseImporter", DatabaseImporter, { lifecycle: Lifecycle.Singleton });
        container.register<HashUtil>("HashUtil", HashUtil, { lifecycle: Lifecycle.Singleton });
        container.register<ImporterUtil>("ImporterUtil", ImporterUtil, { lifecycle: Lifecycle.Singleton });
        container.register<HttpResponseUtil>("HttpResponseUtil", HttpResponseUtil);
        container.register<EncodingUtil>("EncodingUtil", EncodingUtil, { lifecycle: Lifecycle.Singleton });
        container.register<JsonUtil>("JsonUtil", JsonUtil);
        container.register<WinstonMainLogger>("WinstonLogger", WinstonMainLogger, { lifecycle: Lifecycle.Singleton });
        container.register<WinstonRequestLogger>("RequestsLogger", WinstonRequestLogger, { lifecycle: Lifecycle.Singleton });
        container.register<MathUtil>("MathUtil", MathUtil, { lifecycle: Lifecycle.Singleton });
        container.register<ObjectId>("ObjectId", ObjectId);
        container.register<RandomUtil>("RandomUtil", RandomUtil, { lifecycle: Lifecycle.Singleton });
        container.register<TimeUtil>("TimeUtil", TimeUtil, { lifecycle: Lifecycle.Singleton });
        container.register<VFS>("VFS", VFS, { lifecycle: Lifecycle.Singleton });
        container.register<WatermarkLocale>("WatermarkLocale", WatermarkLocale, { lifecycle: Lifecycle.Singleton });
        container.register<Watermark>("Watermark", Watermark, { lifecycle: Lifecycle.Singleton });
        container.register<IAsyncQueue>("AsyncQueue", AsyncQueue, { lifecycle: Lifecycle.Singleton });
        container.register<IUUidGenerator>("UUidGenerator", UUidGenerator, { lifecycle: Lifecycle.Singleton });
        container.register<HttpFileUtil>("HttpFileUtil", HttpFileUtil, { lifecycle: Lifecycle.Singleton });
        container.register<ModLoadOrder>("ModLoadOrder", ModLoadOrder, { lifecycle: Lifecycle.Singleton });
        container.register<ModTypeCheck>("ModTypeCheck", ModTypeCheck, { lifecycle: Lifecycle.Singleton });
    }

    private registerRouters(container: DependencyContainer): void
    {
        // Routers
        container.register<HttpRouter>("HttpRouter", HttpRouter, { lifecycle: Lifecycle.Singleton });
        container.register<ImageRouter>("ImageRouter", ImageRouter);
        container.register<EventOutputHolder>("EventOutputHolder", EventOutputHolder, { lifecycle: Lifecycle.Singleton });
        container.register<ItemEventRouter>("ItemEventRouter", ItemEventRouter);

        // Dynamic Routes
        container.register<BotDynamicRouter>("BotDynamicRouter", { useClass: BotDynamicRouter });
        container.register<BundleDynamicRouter>("BundleDynamicRouter", { useClass: BundleDynamicRouter });
        container.register<CustomizationDynamicRouter>("CustomizationDynamicRouter", { useClass: CustomizationDynamicRouter });
        container.register<DataDynamicRouter>("DataDynamicRouter", { useClass: DataDynamicRouter });
        container.register<HttpDynamicRouter>("HttpDynamicRouter", { useClass: HttpDynamicRouter });
        container.register<InraidDynamicRouter>("InraidDynamicRouter", { useClass: InraidDynamicRouter });
        container.register<LocationDynamicRouter>("LocationDynamicRouter", { useClass: LocationDynamicRouter });
        container.register<NotifierDynamicRouter>("NotifierDynamicRouter", { useClass: NotifierDynamicRouter });
        container.register<TraderDynamicRouter>("TraderDynamicRouter", { useClass: TraderDynamicRouter });

        // Item Event Routes
        container.register<CustomizationItemEventRouter>("CustomizationItemEventRouter", { useClass: CustomizationItemEventRouter });
        container.register<HealthItemEventRouter>("HealthItemEventRouter", { useClass: HealthItemEventRouter });
        container.register<HideoutItemEventRouter>("HideoutItemEventRouter", { useClass: HideoutItemEventRouter });
        container.register<InsuranceItemEventRouter>("InsuranceItemEventRouter", { useClass: InsuranceItemEventRouter });
        container.register<InventoryItemEventRouter>("InventoryItemEventRouter", { useClass: InventoryItemEventRouter });
        container.register<NoteItemEventRouter>("NoteItemEventRouter", { useClass: NoteItemEventRouter });
        container.register<PresetBuildItemEventRouter>("PresetBuildItemEventRouter", { useClass: PresetBuildItemEventRouter });
        container.register<QuestItemEventRouter>("QuestItemEventRouter", { useClass: QuestItemEventRouter });
        container.register<RagfairItemEventRouter>("RagfairItemEventRouter", { useClass: RagfairItemEventRouter });
        container.register<RepairItemEventRouter>("RepairItemEventRouter", { useClass: RepairItemEventRouter });
        container.register<TradeItemEventRouter>("TradeItemEventRouter", { useClass: TradeItemEventRouter });
        container.register<WishlistItemEventRouter>("WishlistItemEventRouter", { useClass: WishlistItemEventRouter });

        // Save Load Routes
        container.register<HealthSaveLoadRouter>("HealthSaveLoadRouter", { useClass: HealthSaveLoadRouter });
        container.register<InraidSaveLoadRouter>("InraidSaveLoadRouter", { useClass: InraidSaveLoadRouter });
        container.register<InsuranceSaveLoadRouter>("InsuranceSaveLoadRouter", { useClass: InsuranceSaveLoadRouter });
        container.register<ProfileSaveLoadRouter>("ProfileSaveLoadRouter", { useClass: ProfileSaveLoadRouter });

        // Route Serializers
        container.register<BundleSerializer>("BundleSerializer", { useClass: BundleSerializer });
        container.register<ImageSerializer>("ImageSerializer", { useClass: ImageSerializer });
        container.register<NotifySerializer>("NotifySerializer", { useClass: NotifySerializer });

        // Static Routes
        container.register<BotStaticRouter>("BotStaticRouter", { useClass: BotStaticRouter });
        container.register<BundleStaticRouter>("BundleStaticRouter", { useClass: BundleStaticRouter });
        container.register<ClientLogStaticRouter>("ClientLogStaticRouter", { useClass: ClientLogStaticRouter });
        container.register<CustomizationStaticRouter>("CustomizationStaticRouter", { useClass: CustomizationStaticRouter });
        container.register<DataStaticRouter>("DataStaticRouter", { useClass: DataStaticRouter });
        container.register<DialogStaticRouter>("DialogStaticRouter", { useClass: DialogStaticRouter });
        container.register<GameStaticRouter>("GameStaticRouter", { useClass: GameStaticRouter });
        container.register<HealthStaticRouter>("HealthStaticRouter", { useClass: HealthStaticRouter });
        container.register<InraidStaticRouter>("InraidStaticRouter", { useClass: InraidStaticRouter });
        container.register<InsuranceStaticRouter>("InsuranceStaticRouter", { useClass: InsuranceStaticRouter });
        container.register<ItemEventStaticRouter>("ItemEventStaticRouter", { useClass: ItemEventStaticRouter });
        container.register<LauncherStaticRouter>("LauncherStaticRouter", { useClass: LauncherStaticRouter });
        container.register<LocationStaticRouter>("LocationStaticRouter", { useClass: LocationStaticRouter });
        container.register<MatchStaticRouter>("MatchStaticRouter", { useClass: MatchStaticRouter });
        container.register<NotifierStaticRouter>("NotifierStaticRouter", { useClass: NotifierStaticRouter });
        container.register<PresetStaticRouter>("PresetStaticRouter", { useClass: PresetStaticRouter });
        container.register<ProfileStaticRouter>("ProfileStaticRouter", { useClass: ProfileStaticRouter });
        container.register<QuestStaticRouter>("QuestStaticRouter", { useClass: QuestStaticRouter });
        container.register<RagfairStaticRouter>("RagfairStaticRouter", { useClass: RagfairStaticRouter });
        container.register<TraderStaticRouter>("TraderStaticRouter", { useClass: TraderStaticRouter });
        container.register<WeatherStaticRouter>("WeatherStaticRouter", { useClass: WeatherStaticRouter });
    }

    private registerGenerators(container: DependencyContainer): void
    {
        // Generators
        container.register<BotGenerator>("BotGenerator", BotGenerator);
        container.register<BotWeaponGenerator>("BotWeaponGenerator", BotWeaponGenerator);
        container.register<BotLootGenerator>("BotLootGenerator", BotLootGenerator);
        container.register<BotInventoryGenerator>("BotInventoryGenerator", BotInventoryGenerator);
        container.register<LocationGenerator>("LocationGenerator", { useClass: LocationGenerator });
        container.register<PMCLootGenerator>("PMCLootGenerator", PMCLootGenerator, { lifecycle: Lifecycle.Singleton });
        container.register<ScavCaseRewardGenerator>("ScavCaseRewardGenerator", ScavCaseRewardGenerator, { lifecycle: Lifecycle.Singleton });
        container.register<RagfairAssortGenerator>("RagfairAssortGenerator", { useClass: RagfairAssortGenerator });
        container.register<RagfairOfferGenerator>("RagfairOfferGenerator", { useClass: RagfairOfferGenerator });
        container.register<WeatherGenerator>("WeatherGenerator", { useClass: WeatherGenerator });
        container.register<PlayerScavGenerator>("PlayerScavGenerator", { useClass: PlayerScavGenerator });
        container.register<LootGenerator>("LootGenerator", { useClass: LootGenerator });
        container.register<FenceBaseAssortGenerator>("FenceBaseAssortGenerator", { useClass: FenceBaseAssortGenerator });
        container.register<BotLevelGenerator>("BotLevelGenerator", { useClass: BotLevelGenerator });
        container.register<BotEquipmentModGenerator>("BotEquipmentModGenerator", { useClass: BotEquipmentModGenerator });
        container.register<RepeatableQuestGenerator>("RepeatableQuestGenerator", { useClass: RepeatableQuestGenerator });
        container.register<BarrelInventoryMagGen>("BarrelInventoryMagGen", { useClass: BarrelInventoryMagGen });
        container.register<ExternalInventoryMagGen>("ExternalInventoryMagGen", { useClass: ExternalInventoryMagGen });
        container.register<InternalMagazineInventoryMagGen>("InternalMagazineInventoryMagGen", { useClass: InternalMagazineInventoryMagGen });
        container.register<UbglExternalMagGen>("UbglExternalMagGen", { useClass: UbglExternalMagGen });

        container.registerType("InventoryMagGen", "BarrelInventoryMagGen");
        container.registerType("InventoryMagGen", "ExternalInventoryMagGen");
        container.registerType("InventoryMagGen", "InternalMagazineInventoryMagGen");
        container.registerType("InventoryMagGen", "UbglExternalMagGen");
    }

    private registerHelpers(container: DependencyContainer): void
    {
        // Helpers
        container.register<AssortHelper>("AssortHelper", { useClass: AssortHelper });
        container.register<BotHelper>("BotHelper", { useClass: BotHelper });
        container.register<BotGeneratorHelper>("BotGeneratorHelper", { useClass: BotGeneratorHelper });
        container.register<ContainerHelper>("ContainerHelper", ContainerHelper);
        container.register<DialogueHelper>("DialogueHelper", { useClass: DialogueHelper });
        container.register<DurabilityLimitsHelper>("DurabilityLimitsHelper", { useClass: DurabilityLimitsHelper });
        container.register<GameEventHelper>("GameEventHelper", GameEventHelper);
        container.register<HandbookHelper>("HandbookHelper", HandbookHelper, { lifecycle: Lifecycle.Singleton });
        container.register<HealthHelper>("HealthHelper", { useClass: HealthHelper });
        container.register<HideoutHelper>("HideoutHelper", { useClass: HideoutHelper });
        container.register<InRaidHelper>("InRaidHelper", { useClass: InRaidHelper });
        container.register<InventoryHelper>("InventoryHelper", { useClass: InventoryHelper });
        container.register<PaymentHelper>("PaymentHelper", PaymentHelper);
        container.register<ItemHelper>("ItemHelper", { useClass: ItemHelper });
        container.register<PresetHelper>("PresetHelper", PresetHelper, { lifecycle: Lifecycle.Singleton });
        container.register<ProfileHelper>("ProfileHelper", { useClass: ProfileHelper });
        container.register<QuestHelper>("QuestHelper", { useClass: QuestHelper });
        container.register<QuestConditionHelper>("QuestConditionHelper", QuestConditionHelper);
        container.register<RagfairHelper>("RagfairHelper", { useClass: RagfairHelper });
        container.register<RagfairSortHelper>("RagfairSortHelper", { useClass: RagfairSortHelper });
        container.register<RagfairSellHelper>("RagfairSellHelper", { useClass: RagfairSellHelper });
        container.register<RagfairOfferHelper>("RagfairOfferHelper", { useClass: RagfairOfferHelper });
        container.register<RagfairServerHelper>("RagfairServerHelper", { useClass: RagfairServerHelper });
        container.register<RepairHelper>("RepairHelper", { useClass: RepairHelper });
        container.register<TraderHelper>("TraderHelper", TraderHelper);
        container.register<TraderAssortHelper>("TraderAssortHelper", TraderAssortHelper, { lifecycle: Lifecycle.Singleton });
        container.register<TradeHelper>("TradeHelper", { useClass: TradeHelper });
        container.register<NotifierHelper>("NotifierHelper", { useClass: NotifierHelper });
        container.register<UtilityHelper>("UtilityHelper", UtilityHelper);
        container.register<WeightedRandomHelper>("WeightedRandomHelper", { useClass: WeightedRandomHelper });
        container.register<HttpServerHelper>("HttpServerHelper", { useClass: HttpServerHelper });
        container.register<NotificationSendHelper>("NotificationSendHelper", { useClass: NotificationSendHelper });
        container.register<SecureContainerHelper>("SecureContainerHelper", { useClass: SecureContainerHelper });
        container.register<ProbabilityHelper>("ProbabilityHelper", { useClass: ProbabilityHelper });
        container.register<BotWeaponGeneratorHelper>("BotWeaponGeneratorHelper", { useClass: BotWeaponGeneratorHelper });
        container.register<BotDifficultyHelper>("BotDifficultyHelper", { useClass: BotDifficultyHelper });
        container.register<RepeatableQuestHelper>("RepeatableQuestHelper", { useClass: RepeatableQuestHelper });
    }

    private registerLoaders(container: DependencyContainer): void
    {
        // Loaders
        container.register<BundleLoader>("BundleLoader", BundleLoader, { lifecycle: Lifecycle.Singleton });
        container.register<PreAkiModLoader>("PreAkiModLoader", PreAkiModLoader, { lifecycle: Lifecycle.Singleton });
        container.register<PostAkiModLoader>("PostAkiModLoader", PostAkiModLoader, { lifecycle: Lifecycle.Singleton });
    }

    private registerCallbacks(container: DependencyContainer): void
    {
        // Callbacks
        container.register<BotCallbacks>("BotCallbacks", { useClass: BotCallbacks });
        container.register<BundleCallbacks>("BundleCallbacks", { useClass: BundleCallbacks });
        container.register<ClientLogCallbacks>("ClientLogCallbacks", { useClass: ClientLogCallbacks });
        container.register<CustomizationCallbacks>("CustomizationCallbacks", { useClass: CustomizationCallbacks });
        container.register<DataCallbacks>("DataCallbacks", { useClass: DataCallbacks });
        container.register<DialogueCallbacks>("DialogueCallbacks", { useClass: DialogueCallbacks });
        container.register<GameCallbacks>("GameCallbacks", { useClass: GameCallbacks });
        container.register<HandbookCallbacks>("HandbookCallbacks", { useClass: HandbookCallbacks });
        container.register<HealthCallbacks>("HealthCallbacks", { useClass: HealthCallbacks });
        container.register<HideoutCallbacks>("HideoutCallbacks", { useClass: HideoutCallbacks });
        container.register<HttpCallbacks>("HttpCallbacks", { useClass: HttpCallbacks });
        container.register<InraidCallbacks>("InraidCallbacks", { useClass: InraidCallbacks });
        container.register<InsuranceCallbacks>("InsuranceCallbacks", { useClass: InsuranceCallbacks });
        container.register<InventoryCallbacks>("InventoryCallbacks", { useClass: InventoryCallbacks });
        container.register<ItemEventCallbacks>("ItemEventCallbacks", { useClass: ItemEventCallbacks });
        container.register<LauncherCallbacks>("LauncherCallbacks", { useClass: LauncherCallbacks });
        container.register<LocationCallbacks>("LocationCallbacks", { useClass: LocationCallbacks });
        container.register<MatchCallbacks>("MatchCallbacks", { useClass: MatchCallbacks });
        container.register<ModCallbacks>("ModCallbacks", { useClass: ModCallbacks });
        container.register<PostDBModLoader>("PostDBModLoader", { useClass: PostDBModLoader });
        container.register<NoteCallbacks>("NoteCallbacks", { useClass: NoteCallbacks });
        container.register<NotifierCallbacks>("NotifierCallbacks", { useClass: NotifierCallbacks });
        container.register<PresetBuildCallbacks>("PresetBuildCallbacks", { useClass: PresetBuildCallbacks });
        container.register<PresetCallbacks>("PresetCallbacks", { useClass: PresetCallbacks });
        container.register<ProfileCallbacks>("ProfileCallbacks", { useClass: ProfileCallbacks });
        container.register<QuestCallbacks>("QuestCallbacks", { useClass: QuestCallbacks });
        container.register<RagfairCallbacks>("RagfairCallbacks", { useClass: RagfairCallbacks });
        container.register<RepairCallbacks>("RepairCallbacks", { useClass: RepairCallbacks });
        container.register<SaveCallbacks>("SaveCallbacks", { useClass: SaveCallbacks });
        container.register<TradeCallbacks>("TradeCallbacks", { useClass: TradeCallbacks });
        container.register<TraderCallbacks>("TraderCallbacks", { useClass: TraderCallbacks });
        container.register<WeatherCallbacks>("WeatherCallbacks", { useClass: WeatherCallbacks });
        container.register<WishlistCallbacks>("WishlistCallbacks", { useClass: WishlistCallbacks });
    }

    private registerServices(container: DependencyContainer): void
    {
        // Services
        container.register<ImageRouteService>("ImageRouteService", ImageRouteService, { lifecycle: Lifecycle.Singleton });
        container.register<FenceService>("FenceService", FenceService, { lifecycle: Lifecycle.Singleton });
        container.register<PlayerService>("PlayerService", { useClass: PlayerService });
        container.register<PaymentService>("PaymentService", { useClass: PaymentService });
        container.register<InsuranceService>("InsuranceService", InsuranceService, { lifecycle: Lifecycle.Singleton });
        container.register<TraderAssortService>("TraderAssortService", TraderAssortService, { lifecycle: Lifecycle.Singleton });
        container.register<RagfairPriceService>("RagfairPriceService", RagfairPriceService, { lifecycle: Lifecycle.Singleton });
        container.register<RagfairCategoriesService>("RagfairCategoriesService", RagfairCategoriesService, { lifecycle: Lifecycle.Singleton });
        container.register<RagfairOfferService>("RagfairOfferService", RagfairOfferService, { lifecycle: Lifecycle.Singleton });
        container.register<RagfairLinkedItemService>("RagfairLinkedItemService", RagfairLinkedItemService, { lifecycle: Lifecycle.Singleton });
        container.register<RagfairRequiredItemsService>("RagfairRequiredItemsService", RagfairRequiredItemsService, { lifecycle: Lifecycle.Singleton });
        container.register<NotificationService>("NotificationService", NotificationService, { lifecycle: Lifecycle.Singleton });
        container.register<MatchLocationService>("MatchLocationService", MatchLocationService, { lifecycle: Lifecycle.Singleton });
        container.register<ModCompilerService>("ModCompilerService", ModCompilerService);
        container.register<HashCacheService>("HashCacheService", HashCacheService, { lifecycle: Lifecycle.Singleton });
        container.register<LocaleService>("LocaleService", LocaleService, { lifecycle: Lifecycle.Singleton });
        container.register<ProfileFixerService>("ProfileFixerService", ProfileFixerService);
        container.register<RepairService>("RepairService", RepairService);
        container.register<BotLootCacheService>("BotLootCacheService", BotLootCacheService, { lifecycle: Lifecycle.Singleton });
        container.register<CustomItemService>("CustomItemService", CustomItemService);
        container.register<BotEquipmentFilterService>("BotEquipmentFilterService", BotEquipmentFilterService);
        container.register<ProfileSnapshotService>("ProfileSnapshotService", ProfileSnapshotService, { lifecycle: Lifecycle.Singleton });
        container.register<ItemFilterService>("ItemFilterService", ItemFilterService, { lifecycle: Lifecycle.Singleton });
        container.register<BotGenerationCacheService>("BotGenerationCacheService", BotGenerationCacheService, { lifecycle: Lifecycle.Singleton });
        container.register<LocalisationService>("LocalisationService", LocalisationService, { lifecycle: Lifecycle.Singleton });
        container.register<CustomLocationWaveService>("CustomLocationWaveService", CustomLocationWaveService, { lifecycle: Lifecycle.Singleton });
        container.register<OpenZoneService>("OpenZoneService", OpenZoneService, { lifecycle: Lifecycle.Singleton });
        container.register<ItemBaseClassService>("ItemBaseClassService", ItemBaseClassService, { lifecycle: Lifecycle.Singleton });
        container.register<BotEquipmentModPoolService>("BotEquipmentModPoolService", BotEquipmentModPoolService, { lifecycle: Lifecycle.Singleton });
        container.register<BotWeaponModLimitService>("BotWeaponModLimitService", BotWeaponModLimitService, { lifecycle: Lifecycle.Singleton });
        container.register<SeasonalEventService>("SeasonalEventService", SeasonalEventService, { lifecycle: Lifecycle.Singleton });
        container.register<MatchBotDetailsCacheService>("MatchBotDetailsCacheService", MatchBotDetailsCacheService, { lifecycle: Lifecycle.Singleton });
        container.register<RagfairTaxService>("RagfairTaxService", RagfairTaxService, { lifecycle: Lifecycle.Singleton });
        container.register<TraderPurchasePersisterService>("TraderPurchasePersisterService", TraderPurchasePersisterService);
        container.register<PmcChatResponseService>("PmcChatResponseService", PmcChatResponseService);
        container.register<GiftService>("GiftService", GiftService);
        container.register<MailSendService>("MailSendService", MailSendService);
    }

    private registerServers(container: DependencyContainer): void
    {
        // Servers
        container.register<DatabaseServer>("DatabaseServer", DatabaseServer, { lifecycle: Lifecycle.Singleton });
        container.register<HttpServer>("HttpServer", HttpServer, { lifecycle: Lifecycle.Singleton });
        container.register<WebSocketServer>("WebSocketServer", WebSocketServer, { lifecycle: Lifecycle.Singleton });
        container.register<RagfairServer>("RagfairServer", RagfairServer);
        container.register<SaveServer>("SaveServer", SaveServer, { lifecycle: Lifecycle.Singleton });
        container.register<ConfigServer>("ConfigServer", ConfigServer, { lifecycle: Lifecycle.Singleton });
        container.register<HttpBufferHandler>("HttpBufferHandler", HttpBufferHandler, {lifecycle: Lifecycle.Singleton});
    }

    private registerControllers(container: DependencyContainer): void
    {
        // Controllers
        container.register<BotController>("BotController", { useClass: BotController });
        container.register<ClientLogController>("ClientLogController", { useClass: ClientLogController });
        container.register<CustomizationController>("CustomizationController", { useClass: CustomizationController });
        container.register<DialogueController>("DialogueController", { useClass: DialogueController });
        container.register<GameController>("GameController", { useClass: GameController });
        container.register<HandbookController>("HandbookController", { useClass: HandbookController });
        container.register<HealthController>("HealthController", { useClass: HealthController });
        container.register<HideoutController>("HideoutController", { useClass: HideoutController });
        container.register<InraidController>("InraidController", { useClass: InraidController });
        container.register<InsuranceController>("InsuranceController", { useClass: InsuranceController });
        container.register<InventoryController>("InventoryController", { useClass: InventoryController });
        container.register<LauncherController>("LauncherController", { useClass: LauncherController });
        container.register<LocationController>("LocationController", { useClass: LocationController });
        container.register<MatchController>("MatchController", MatchController);
        container.register<NoteController>("NoteController", { useClass: NoteController });
        container.register<NotifierController>("NotifierController", { useClass: NotifierController });
        container.register<PresetBuildController>("PresetBuildController", { useClass: PresetBuildController });
        container.register<PresetController>("PresetController", { useClass: PresetController });
        container.register<ProfileController>("ProfileController", { useClass: ProfileController });
        container.register<QuestController>("QuestController", { useClass: QuestController });
        container.register<RagfairController>("RagfairController", { useClass: RagfairController });
        container.register<RepairController>("RepairController", { useClass: RepairController });
        container.register<RepeatableQuestController>("RepeatableQuestController", { useClass: RepeatableQuestController });
        container.register<TradeController>("TradeController", { useClass: TradeController });
        container.register<TraderController>("TraderController", { useClass: TraderController });
        container.register<WeatherController>("WeatherController", { useClass: WeatherController });
        container.register<WishlistController>("WishlistController", WishlistController);
    }

    private registerListTypes(container: DependencyContainer): void
    {
        container.register("OnLoadModService", { useValue: new OnLoadModService(container) });
        container.register("HttpListenerModService", { useValue: new HttpListenerModService(container) });
        container.register("OnUpdateModService", { useValue: new OnUpdateModService(container) });
        container.register("DynamicRouterModService", { useValue: new DynamicRouterModService(container) });
        container.register("StaticRouterModService", { useValue: new StaticRouterModService(container) });

        container.registerType("OnLoad", "DatabaseImporter");
        container.registerType("OnLoad", "PostDBModLoader");
        container.registerType("OnLoad", "HandbookCallbacks");
        container.registerType("OnLoad", "HttpCallbacks");
        container.registerType("OnLoad", "PresetCallbacks");
        container.registerType("OnLoad", "SaveCallbacks");
        container.registerType("OnLoad", "TraderCallbacks"); // must occur prior to RagfairCallbacks
        container.registerType("OnLoad", "RagfairPriceService");
        container.registerType("OnLoad", "RagfairCallbacks");
        container.registerType("OnLoad", "ModCallbacks");
        container.registerType("OnLoad", "GameCallbacks");

        container.registerType("OnUpdate", "DialogueCallbacks");
        container.registerType("OnUpdate", "HideoutCallbacks");
        container.registerType("OnUpdate", "TraderCallbacks");
        container.registerType("OnUpdate", "RagfairCallbacks");
        container.registerType("OnUpdate", "InsuranceCallbacks");
        container.registerType("OnUpdate", "SaveCallbacks");

        container.registerType("StaticRoutes", "BotStaticRouter");
        container.registerType("StaticRoutes", "ClientLogStaticRouter");
        container.registerType("StaticRoutes", "CustomizationStaticRouter");
        container.registerType("StaticRoutes", "DataStaticRouter");
        container.registerType("StaticRoutes", "DialogStaticRouter");
        container.registerType("StaticRoutes", "GameStaticRouter");
        container.registerType("StaticRoutes", "HealthStaticRouter");
        container.registerType("StaticRoutes", "InraidStaticRouter");
        container.registerType("StaticRoutes", "InsuranceStaticRouter");
        container.registerType("StaticRoutes", "ItemEventStaticRouter");
        container.registerType("StaticRoutes", "LauncherStaticRouter");
        container.registerType("StaticRoutes", "LocationStaticRouter");
        container.registerType("StaticRoutes", "WeatherStaticRouter");
        container.registerType("StaticRoutes", "MatchStaticRouter");
        container.registerType("StaticRoutes", "QuestStaticRouter");
        container.registerType("StaticRoutes", "RagfairStaticRouter");
        container.registerType("StaticRoutes", "PresetStaticRouter");
        container.registerType("StaticRoutes", "BundleStaticRouter");
        container.registerType("StaticRoutes", "NotifierStaticRouter");
        container.registerType("StaticRoutes", "ProfileStaticRouter");
        container.registerType("StaticRoutes", "TraderStaticRouter");

        container.registerType("DynamicRoutes", "BotDynamicRouter");
        container.registerType("DynamicRoutes", "BundleDynamicRouter");
        container.registerType("DynamicRoutes", "CustomizationDynamicRouter");
        container.registerType("DynamicRoutes", "DataDynamicRouter");
        container.registerType("DynamicRoutes", "HttpDynamicRouter");
        container.registerType("DynamicRoutes", "InraidDynamicRouter");
        container.registerType("DynamicRoutes", "LocationDynamicRouter");
        container.registerType("DynamicRoutes", "NotifierDynamicRouter");
        container.registerType("DynamicRoutes", "TraderDynamicRouter");

        container.registerType("IERouters", "CustomizationItemEventRouter");
        container.registerType("IERouters", "HealthItemEventRouter");
        container.registerType("IERouters", "HideoutItemEventRouter");
        container.registerType("IERouters", "InsuranceItemEventRouter");
        container.registerType("IERouters", "InventoryItemEventRouter");
        container.registerType("IERouters", "NoteItemEventRouter");
        container.registerType("IERouters", "PresetBuildItemEventRouter");
        container.registerType("IERouters", "QuestItemEventRouter");
        container.registerType("IERouters", "RagfairItemEventRouter");
        container.registerType("IERouters", "RepairItemEventRouter");
        container.registerType("IERouters", "TradeItemEventRouter");
        container.registerType("IERouters", "WishlistItemEventRouter");

        container.registerType("Serializer", "ImageSerializer");
        container.registerType("Serializer", "BundleSerializer");
        container.registerType("Serializer", "NotifySerializer");

        // Registering these starts the server...?
        container.registerType("SaveLoadRouter", "HealthSaveLoadRouter");
        container.registerType("SaveLoadRouter", "InraidSaveLoadRouter");
        container.registerType("SaveLoadRouter", "InsuranceSaveLoadRouter");
        container.registerType("SaveLoadRouter", "ProfileSaveLoadRouter");
    }

    private async importDatabase(): Promise<void>
    {
        this.importerUtil = this.container.resolve<ImporterUtil>("ImporterUtil");
        this.databaseServer = this.container.resolve<DatabaseServer>("DatabaseServer");

        // Read the data from the JSON files.
        const databaseDir = path.resolve("./assets/database");
        const dataToImport = await this.importerUtil.loadAsync<IDatabaseTables>(`${databaseDir}/`);

        // Save the data to memory.
        this.databaseServer.setTables(dataToImport);
    }
}
