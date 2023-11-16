import { DependencyContainer, Lifecycle } from "tsyringe";

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
import { AkiHttpListener } from "@spt-aki/servers/http/AkiHttpListener";
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
import { VFS } from "@spt-aki/utils/VFS";
import { Watermark, WatermarkLocale } from "@spt-aki/utils/Watermark";
import { WinstonMainLogger } from "@spt-aki/utils/logging/WinstonMainLogger";
import { WinstonRequestLogger } from "@spt-aki/utils/logging/WinstonRequestLogger";

/**
 * Handle the registration of classes to be used by the Dependency Injection code
 */
export class Container
{
    public static registerPostLoadTypes(container: DependencyContainer, childContainer: DependencyContainer): void
    {
        container.register<AkiHttpListener>("AkiHttpListener", AkiHttpListener, { lifecycle: Lifecycle.Singleton });
        childContainer.registerType("HttpListener", "AkiHttpListener");
    }

    public static registerTypes(con: DependencyContainer): void
    {
        con.register("ApplicationContext", ApplicationContext, { lifecycle: Lifecycle.Singleton });
        Container.registerUtils(con);
        Container.registerRouters(con);
        Container.registerGenerators(con);
        Container.registerHelpers(con);
        Container.registerLoaders(con);
        Container.registerCallbacks(con);
        Container.registerServers(con);
        Container.registerServices(con);
        Container.registerControllers(con);
    }

    public static registerListTypes(con: DependencyContainer): void
    {
        con.register("OnLoadModService", { useValue: new OnLoadModService(con) });
        con.register("HttpListenerModService", { useValue: new HttpListenerModService(con) });
        con.register("OnUpdateModService", { useValue: new OnUpdateModService(con) });
        con.register("DynamicRouterModService", { useValue: new DynamicRouterModService(con) });
        con.register("StaticRouterModService", { useValue: new StaticRouterModService(con) });

        con.registerType("OnLoad", "DatabaseImporter");
        con.registerType("OnLoad", "PostDBModLoader");
        con.registerType("OnLoad", "HandbookCallbacks");
        con.registerType("OnLoad", "HttpCallbacks");
        con.registerType("OnLoad", "PresetCallbacks");
        con.registerType("OnLoad", "SaveCallbacks");
        con.registerType("OnLoad", "TraderCallbacks"); // Must occur prior to RagfairCallbacks
        con.registerType("OnLoad", "RagfairPriceService");
        con.registerType("OnLoad", "RagfairCallbacks");
        con.registerType("OnLoad", "ModCallbacks");
        con.registerType("OnLoad", "GameCallbacks");
        con.registerType("OnUpdate", "DialogueCallbacks");
        con.registerType("OnUpdate", "HideoutCallbacks");
        con.registerType("OnUpdate", "TraderCallbacks");
        con.registerType("OnUpdate", "RagfairCallbacks");
        con.registerType("OnUpdate", "InsuranceCallbacks");
        con.registerType("OnUpdate", "SaveCallbacks");

        con.registerType("StaticRoutes", "BotStaticRouter");
        con.registerType("StaticRoutes", "ClientLogStaticRouter");
        con.registerType("StaticRoutes", "CustomizationStaticRouter");
        con.registerType("StaticRoutes", "DataStaticRouter");
        con.registerType("StaticRoutes", "DialogStaticRouter");
        con.registerType("StaticRoutes", "GameStaticRouter");
        con.registerType("StaticRoutes", "HealthStaticRouter");
        con.registerType("StaticRoutes", "InraidStaticRouter");
        con.registerType("StaticRoutes", "InsuranceStaticRouter");
        con.registerType("StaticRoutes", "ItemEventStaticRouter");
        con.registerType("StaticRoutes", "LauncherStaticRouter");
        con.registerType("StaticRoutes", "LocationStaticRouter");
        con.registerType("StaticRoutes", "WeatherStaticRouter");
        con.registerType("StaticRoutes", "MatchStaticRouter");
        con.registerType("StaticRoutes", "QuestStaticRouter");
        con.registerType("StaticRoutes", "RagfairStaticRouter");
        con.registerType("StaticRoutes", "PresetStaticRouter");
        con.registerType("StaticRoutes", "BundleStaticRouter");
        con.registerType("StaticRoutes", "NotifierStaticRouter");
        con.registerType("StaticRoutes", "ProfileStaticRouter");
        con.registerType("StaticRoutes", "TraderStaticRouter");
        con.registerType("DynamicRoutes", "BotDynamicRouter");
        con.registerType("DynamicRoutes", "BundleDynamicRouter");
        con.registerType("DynamicRoutes", "CustomizationDynamicRouter");
        con.registerType("DynamicRoutes", "DataDynamicRouter");
        con.registerType("DynamicRoutes", "HttpDynamicRouter");
        con.registerType("DynamicRoutes", "InraidDynamicRouter");
        con.registerType("DynamicRoutes", "LocationDynamicRouter");
        con.registerType("DynamicRoutes", "NotifierDynamicRouter");
        con.registerType("DynamicRoutes", "TraderDynamicRouter");

        con.registerType("IERouters", "CustomizationItemEventRouter");
        con.registerType("IERouters", "HealthItemEventRouter");
        con.registerType("IERouters", "HideoutItemEventRouter");
        con.registerType("IERouters", "InsuranceItemEventRouter");
        con.registerType("IERouters", "InventoryItemEventRouter");
        con.registerType("IERouters", "NoteItemEventRouter");
        con.registerType("IERouters", "PresetBuildItemEventRouter");
        con.registerType("IERouters", "QuestItemEventRouter");
        con.registerType("IERouters", "RagfairItemEventRouter");
        con.registerType("IERouters", "RepairItemEventRouter");
        con.registerType("IERouters", "TradeItemEventRouter");
        con.registerType("IERouters", "WishlistItemEventRouter");

        con.registerType("Serializer", "ImageSerializer");
        con.registerType("Serializer", "BundleSerializer");
        con.registerType("Serializer", "NotifySerializer");
        con.registerType("SaveLoadRouter", "HealthSaveLoadRouter");
        con.registerType("SaveLoadRouter", "InraidSaveLoadRouter");
        con.registerType("SaveLoadRouter", "InsuranceSaveLoadRouter");
        con.registerType("SaveLoadRouter", "ProfileSaveLoadRouter");
    }

    private static registerUtils(con: DependencyContainer): void
    {
        // Utils
        con.register<App>("App", App, { lifecycle: Lifecycle.Singleton });
        con.register<DatabaseImporter>("DatabaseImporter", DatabaseImporter, { lifecycle: Lifecycle.Singleton });
        con.register<HashUtil>("HashUtil", HashUtil, { lifecycle: Lifecycle.Singleton });
        con.register<ImporterUtil>("ImporterUtil", ImporterUtil, { lifecycle: Lifecycle.Singleton });
        con.register<HttpResponseUtil>("HttpResponseUtil", HttpResponseUtil);
        con.register<EncodingUtil>("EncodingUtil", EncodingUtil, { lifecycle: Lifecycle.Singleton });
        con.register<JsonUtil>("JsonUtil", JsonUtil);
        con.register<WinstonMainLogger>("WinstonLogger", WinstonMainLogger, { lifecycle: Lifecycle.Singleton });
        con.register<WinstonRequestLogger>("RequestsLogger", WinstonRequestLogger, { lifecycle: Lifecycle.Singleton });
        con.register<MathUtil>("MathUtil", MathUtil, { lifecycle: Lifecycle.Singleton });
        con.register<ObjectId>("ObjectId", ObjectId);
        con.register<RandomUtil>("RandomUtil", RandomUtil, { lifecycle: Lifecycle.Singleton });
        con.register<TimeUtil>("TimeUtil", TimeUtil, { lifecycle: Lifecycle.Singleton });
        con.register<VFS>("VFS", VFS, { lifecycle: Lifecycle.Singleton });
        con.register<WatermarkLocale>("WatermarkLocale", WatermarkLocale, { lifecycle: Lifecycle.Singleton });
        con.register<Watermark>("Watermark", Watermark, { lifecycle: Lifecycle.Singleton });
        con.register<IAsyncQueue>("AsyncQueue", AsyncQueue, { lifecycle: Lifecycle.Singleton });
        con.register<HttpFileUtil>("HttpFileUtil", HttpFileUtil, { lifecycle: Lifecycle.Singleton });
        con.register<ModLoadOrder>("ModLoadOrder", ModLoadOrder, { lifecycle: Lifecycle.Singleton });
        con.register<ModTypeCheck>("ModTypeCheck", ModTypeCheck, { lifecycle: Lifecycle.Singleton });
    }

    private static registerRouters(con: DependencyContainer): void
    {
        // Routers
        con.register<HttpRouter>("HttpRouter", HttpRouter, { lifecycle: Lifecycle.Singleton });
        con.register<ImageRouter>("ImageRouter", ImageRouter);
        con.register<EventOutputHolder>("EventOutputHolder", EventOutputHolder, { lifecycle: Lifecycle.Singleton });
        con.register<ItemEventRouter>("ItemEventRouter", ItemEventRouter);

        // Dynamic routes
        con.register<BotDynamicRouter>("BotDynamicRouter", { useClass: BotDynamicRouter });
        con.register<BundleDynamicRouter>("BundleDynamicRouter", { useClass: BundleDynamicRouter });
        con.register<CustomizationDynamicRouter>("CustomizationDynamicRouter", {
            useClass: CustomizationDynamicRouter,
        });
        con.register<DataDynamicRouter>("DataDynamicRouter", { useClass: DataDynamicRouter });
        con.register<HttpDynamicRouter>("HttpDynamicRouter", { useClass: HttpDynamicRouter });
        con.register<InraidDynamicRouter>("InraidDynamicRouter", { useClass: InraidDynamicRouter });
        con.register<LocationDynamicRouter>("LocationDynamicRouter", { useClass: LocationDynamicRouter });
        con.register<NotifierDynamicRouter>("NotifierDynamicRouter", { useClass: NotifierDynamicRouter });
        con.register<TraderDynamicRouter>("TraderDynamicRouter", { useClass: TraderDynamicRouter });

        // Item event routes
        con.register<CustomizationItemEventRouter>("CustomizationItemEventRouter", {
            useClass: CustomizationItemEventRouter,
        });
        con.register<HealthItemEventRouter>("HealthItemEventRouter", { useClass: HealthItemEventRouter });
        con.register<HideoutItemEventRouter>("HideoutItemEventRouter", { useClass: HideoutItemEventRouter });
        con.register<InsuranceItemEventRouter>("InsuranceItemEventRouter", { useClass: InsuranceItemEventRouter });
        con.register<InventoryItemEventRouter>("InventoryItemEventRouter", { useClass: InventoryItemEventRouter });
        con.register<NoteItemEventRouter>("NoteItemEventRouter", { useClass: NoteItemEventRouter });
        con.register<PresetBuildItemEventRouter>("PresetBuildItemEventRouter", {
            useClass: PresetBuildItemEventRouter,
        });
        con.register<QuestItemEventRouter>("QuestItemEventRouter", { useClass: QuestItemEventRouter });
        con.register<RagfairItemEventRouter>("RagfairItemEventRouter", { useClass: RagfairItemEventRouter });
        con.register<RepairItemEventRouter>("RepairItemEventRouter", { useClass: RepairItemEventRouter });
        con.register<TradeItemEventRouter>("TradeItemEventRouter", { useClass: TradeItemEventRouter });
        con.register<WishlistItemEventRouter>("WishlistItemEventRouter", { useClass: WishlistItemEventRouter });

        // save load routes
        con.register<HealthSaveLoadRouter>("HealthSaveLoadRouter", { useClass: HealthSaveLoadRouter });
        con.register<InraidSaveLoadRouter>("InraidSaveLoadRouter", { useClass: InraidSaveLoadRouter });
        con.register<InsuranceSaveLoadRouter>("InsuranceSaveLoadRouter", { useClass: InsuranceSaveLoadRouter });
        con.register<ProfileSaveLoadRouter>("ProfileSaveLoadRouter", { useClass: ProfileSaveLoadRouter });

        // Route serializers
        con.register<BundleSerializer>("BundleSerializer", { useClass: BundleSerializer });
        con.register<ImageSerializer>("ImageSerializer", { useClass: ImageSerializer });
        con.register<NotifySerializer>("NotifySerializer", { useClass: NotifySerializer });

        // Static routes
        con.register<BotStaticRouter>("BotStaticRouter", { useClass: BotStaticRouter });
        con.register<BundleStaticRouter>("BundleStaticRouter", { useClass: BundleStaticRouter });
        con.register<ClientLogStaticRouter>("ClientLogStaticRouter", { useClass: ClientLogStaticRouter });
        con.register<CustomizationStaticRouter>("CustomizationStaticRouter", { useClass: CustomizationStaticRouter });
        con.register<DataStaticRouter>("DataStaticRouter", { useClass: DataStaticRouter });
        con.register<DialogStaticRouter>("DialogStaticRouter", { useClass: DialogStaticRouter });
        con.register<GameStaticRouter>("GameStaticRouter", { useClass: GameStaticRouter });
        con.register<HealthStaticRouter>("HealthStaticRouter", { useClass: HealthStaticRouter });
        con.register<InraidStaticRouter>("InraidStaticRouter", { useClass: InraidStaticRouter });
        con.register<InsuranceStaticRouter>("InsuranceStaticRouter", { useClass: InsuranceStaticRouter });
        con.register<ItemEventStaticRouter>("ItemEventStaticRouter", { useClass: ItemEventStaticRouter });
        con.register<LauncherStaticRouter>("LauncherStaticRouter", { useClass: LauncherStaticRouter });
        con.register<LocationStaticRouter>("LocationStaticRouter", { useClass: LocationStaticRouter });
        con.register<MatchStaticRouter>("MatchStaticRouter", { useClass: MatchStaticRouter });
        con.register<NotifierStaticRouter>("NotifierStaticRouter", { useClass: NotifierStaticRouter });
        con.register<PresetStaticRouter>("PresetStaticRouter", { useClass: PresetStaticRouter });
        con.register<ProfileStaticRouter>("ProfileStaticRouter", { useClass: ProfileStaticRouter });
        con.register<QuestStaticRouter>("QuestStaticRouter", { useClass: QuestStaticRouter });
        con.register<RagfairStaticRouter>("RagfairStaticRouter", { useClass: RagfairStaticRouter });
        con.register<TraderStaticRouter>("TraderStaticRouter", { useClass: TraderStaticRouter });
        con.register<WeatherStaticRouter>("WeatherStaticRouter", { useClass: WeatherStaticRouter });
    }

    private static registerGenerators(con: DependencyContainer): void
    {
        // Generators
        con.register<BotGenerator>("BotGenerator", BotGenerator);
        con.register<BotWeaponGenerator>("BotWeaponGenerator", BotWeaponGenerator);
        con.register<BotLootGenerator>("BotLootGenerator", BotLootGenerator);
        con.register<BotInventoryGenerator>("BotInventoryGenerator", BotInventoryGenerator);
        con.register<LocationGenerator>("LocationGenerator", { useClass: LocationGenerator });
        con.register<PMCLootGenerator>("PMCLootGenerator", PMCLootGenerator, { lifecycle: Lifecycle.Singleton });
        con.register<ScavCaseRewardGenerator>("ScavCaseRewardGenerator", ScavCaseRewardGenerator, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<ScavCaseRewardGenerator>("ScavCaseRewardGenerator", ScavCaseRewardGenerator, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<RagfairAssortGenerator>("RagfairAssortGenerator", { useClass: RagfairAssortGenerator });
        con.register<RagfairOfferGenerator>("RagfairOfferGenerator", { useClass: RagfairOfferGenerator });
        con.register<WeatherGenerator>("WeatherGenerator", { useClass: WeatherGenerator });
        con.register<PlayerScavGenerator>("PlayerScavGenerator", { useClass: PlayerScavGenerator });
        con.register<LootGenerator>("LootGenerator", { useClass: LootGenerator });
        con.register<FenceBaseAssortGenerator>("FenceBaseAssortGenerator", { useClass: FenceBaseAssortGenerator });
        con.register<BotLevelGenerator>("BotLevelGenerator", { useClass: BotLevelGenerator });
        con.register<BotEquipmentModGenerator>("BotEquipmentModGenerator", { useClass: BotEquipmentModGenerator });
        con.register<RepeatableQuestGenerator>("RepeatableQuestGenerator", { useClass: RepeatableQuestGenerator });

        con.register<BarrelInventoryMagGen>("BarrelInventoryMagGen", { useClass: BarrelInventoryMagGen });
        con.register<ExternalInventoryMagGen>("ExternalInventoryMagGen", { useClass: ExternalInventoryMagGen });
        con.register<InternalMagazineInventoryMagGen>("InternalMagazineInventoryMagGen", {
            useClass: InternalMagazineInventoryMagGen,
        });
        con.register<UbglExternalMagGen>("UbglExternalMagGen", { useClass: UbglExternalMagGen });

        con.registerType("InventoryMagGen", "BarrelInventoryMagGen");
        con.registerType("InventoryMagGen", "ExternalInventoryMagGen");
        con.registerType("InventoryMagGen", "InternalMagazineInventoryMagGen");
        con.registerType("InventoryMagGen", "UbglExternalMagGen");
    }

    private static registerHelpers(con: DependencyContainer): void
    {
        // Helpers
        con.register<AssortHelper>("AssortHelper", { useClass: AssortHelper });
        con.register<BotHelper>("BotHelper", { useClass: BotHelper });
        con.register<BotGeneratorHelper>("BotGeneratorHelper", { useClass: BotGeneratorHelper });
        con.register<ContainerHelper>("ContainerHelper", ContainerHelper);
        con.register<DialogueHelper>("DialogueHelper", { useClass: DialogueHelper });
        con.register<DurabilityLimitsHelper>("DurabilityLimitsHelper", { useClass: DurabilityLimitsHelper });
        con.register<GameEventHelper>("GameEventHelper", GameEventHelper);
        con.register<HandbookHelper>("HandbookHelper", HandbookHelper, { lifecycle: Lifecycle.Singleton });
        con.register<HealthHelper>("HealthHelper", { useClass: HealthHelper });
        con.register<HideoutHelper>("HideoutHelper", { useClass: HideoutHelper });
        con.register<InRaidHelper>("InRaidHelper", { useClass: InRaidHelper });
        con.register<InventoryHelper>("InventoryHelper", { useClass: InventoryHelper });
        con.register<PaymentHelper>("PaymentHelper", PaymentHelper);
        con.register<ItemHelper>("ItemHelper", { useClass: ItemHelper });
        con.register<PresetHelper>("PresetHelper", PresetHelper, { lifecycle: Lifecycle.Singleton });
        con.register<ProfileHelper>("ProfileHelper", { useClass: ProfileHelper });
        con.register<QuestHelper>("QuestHelper", { useClass: QuestHelper });
        con.register<QuestConditionHelper>("QuestConditionHelper", QuestConditionHelper);
        con.register<RagfairHelper>("RagfairHelper", { useClass: RagfairHelper });
        con.register<RagfairSortHelper>("RagfairSortHelper", { useClass: RagfairSortHelper });
        con.register<RagfairSellHelper>("RagfairSellHelper", { useClass: RagfairSellHelper });
        con.register<RagfairOfferHelper>("RagfairOfferHelper", { useClass: RagfairOfferHelper });
        con.register<RagfairServerHelper>("RagfairServerHelper", { useClass: RagfairServerHelper });
        con.register<RepairHelper>("RepairHelper", { useClass: RepairHelper });
        con.register<TraderHelper>("TraderHelper", TraderHelper);
        con.register<TraderAssortHelper>("TraderAssortHelper", TraderAssortHelper, { lifecycle: Lifecycle.Singleton });
        con.register<TradeHelper>("TradeHelper", { useClass: TradeHelper });
        con.register<NotifierHelper>("NotifierHelper", { useClass: NotifierHelper });
        con.register<UtilityHelper>("UtilityHelper", UtilityHelper);
        con.register<WeightedRandomHelper>("WeightedRandomHelper", { useClass: WeightedRandomHelper });
        con.register<HttpServerHelper>("HttpServerHelper", { useClass: HttpServerHelper });
        con.register<NotificationSendHelper>("NotificationSendHelper", { useClass: NotificationSendHelper });
        con.register<SecureContainerHelper>("SecureContainerHelper", { useClass: SecureContainerHelper });
        con.register<ProbabilityHelper>("ProbabilityHelper", { useClass: ProbabilityHelper });
        con.register<BotWeaponGeneratorHelper>("BotWeaponGeneratorHelper", { useClass: BotWeaponGeneratorHelper });
        con.register<BotDifficultyHelper>("BotDifficultyHelper", { useClass: BotDifficultyHelper });
        con.register<RepeatableQuestHelper>("RepeatableQuestHelper", { useClass: RepeatableQuestHelper });
    }

    private static registerLoaders(con: DependencyContainer): void
    {
        // Loaders
        con.register<BundleLoader>("BundleLoader", BundleLoader, { lifecycle: Lifecycle.Singleton });
        con.register<PreAkiModLoader>("PreAkiModLoader", PreAkiModLoader, { lifecycle: Lifecycle.Singleton });
        con.register<PostAkiModLoader>("PostAkiModLoader", PostAkiModLoader, { lifecycle: Lifecycle.Singleton });
    }

    private static registerCallbacks(con: DependencyContainer): void
    {
        // Callbacks
        con.register<BotCallbacks>("BotCallbacks", { useClass: BotCallbacks });
        con.register<BundleCallbacks>("BundleCallbacks", { useClass: BundleCallbacks });
        con.register<ClientLogCallbacks>("ClientLogCallbacks", { useClass: ClientLogCallbacks });
        con.register<CustomizationCallbacks>("CustomizationCallbacks", { useClass: CustomizationCallbacks });
        con.register<DataCallbacks>("DataCallbacks", { useClass: DataCallbacks });
        con.register<DialogueCallbacks>("DialogueCallbacks", { useClass: DialogueCallbacks });
        con.register<GameCallbacks>("GameCallbacks", { useClass: GameCallbacks });
        con.register<HandbookCallbacks>("HandbookCallbacks", { useClass: HandbookCallbacks });
        con.register<HealthCallbacks>("HealthCallbacks", { useClass: HealthCallbacks });
        con.register<HideoutCallbacks>("HideoutCallbacks", { useClass: HideoutCallbacks });
        con.register<HttpCallbacks>("HttpCallbacks", { useClass: HttpCallbacks });
        con.register<InraidCallbacks>("InraidCallbacks", { useClass: InraidCallbacks });
        con.register<InsuranceCallbacks>("InsuranceCallbacks", { useClass: InsuranceCallbacks });
        con.register<InventoryCallbacks>("InventoryCallbacks", { useClass: InventoryCallbacks });
        con.register<ItemEventCallbacks>("ItemEventCallbacks", { useClass: ItemEventCallbacks });
        con.register<LauncherCallbacks>("LauncherCallbacks", { useClass: LauncherCallbacks });
        con.register<LocationCallbacks>("LocationCallbacks", { useClass: LocationCallbacks });
        con.register<MatchCallbacks>("MatchCallbacks", { useClass: MatchCallbacks });
        con.register<ModCallbacks>("ModCallbacks", { useClass: ModCallbacks });
        con.register<PostDBModLoader>("PostDBModLoader", { useClass: PostDBModLoader });
        con.register<NoteCallbacks>("NoteCallbacks", { useClass: NoteCallbacks });
        con.register<NotifierCallbacks>("NotifierCallbacks", { useClass: NotifierCallbacks });
        con.register<PresetBuildCallbacks>("PresetBuildCallbacks", { useClass: PresetBuildCallbacks });
        con.register<PresetCallbacks>("PresetCallbacks", { useClass: PresetCallbacks });
        con.register<ProfileCallbacks>("ProfileCallbacks", { useClass: ProfileCallbacks });
        con.register<QuestCallbacks>("QuestCallbacks", { useClass: QuestCallbacks });
        con.register<RagfairCallbacks>("RagfairCallbacks", { useClass: RagfairCallbacks });
        con.register<RepairCallbacks>("RepairCallbacks", { useClass: RepairCallbacks });
        con.register<SaveCallbacks>("SaveCallbacks", { useClass: SaveCallbacks });
        con.register<TradeCallbacks>("TradeCallbacks", { useClass: TradeCallbacks });
        con.register<TraderCallbacks>("TraderCallbacks", { useClass: TraderCallbacks });
        con.register<WeatherCallbacks>("WeatherCallbacks", { useClass: WeatherCallbacks });
        con.register<WishlistCallbacks>("WishlistCallbacks", { useClass: WishlistCallbacks });
    }

    private static registerServices(con: DependencyContainer): void
    {
        // Services
        con.register<ImageRouteService>("ImageRouteService", ImageRouteService, { lifecycle: Lifecycle.Singleton });

        con.register<FenceService>("FenceService", FenceService, { lifecycle: Lifecycle.Singleton });
        con.register<PlayerService>("PlayerService", { useClass: PlayerService });
        con.register<PaymentService>("PaymentService", { useClass: PaymentService });
        con.register<InsuranceService>("InsuranceService", InsuranceService, { lifecycle: Lifecycle.Singleton });
        con.register<TraderAssortService>("TraderAssortService", TraderAssortService, {
            lifecycle: Lifecycle.Singleton,
        });

        con.register<RagfairPriceService>("RagfairPriceService", RagfairPriceService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<RagfairCategoriesService>("RagfairCategoriesService", RagfairCategoriesService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<RagfairOfferService>("RagfairOfferService", RagfairOfferService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<RagfairLinkedItemService>("RagfairLinkedItemService", RagfairLinkedItemService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<RagfairRequiredItemsService>("RagfairRequiredItemsService", RagfairRequiredItemsService, {
            lifecycle: Lifecycle.Singleton,
        });

        con.register<NotificationService>("NotificationService", NotificationService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<MatchLocationService>("MatchLocationService", MatchLocationService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<ModCompilerService>("ModCompilerService", ModCompilerService);
        con.register<HashCacheService>("HashCacheService", HashCacheService, { lifecycle: Lifecycle.Singleton });
        con.register<LocaleService>("LocaleService", LocaleService, { lifecycle: Lifecycle.Singleton });
        con.register<ProfileFixerService>("ProfileFixerService", ProfileFixerService);
        con.register<RepairService>("RepairService", RepairService);
        con.register<BotLootCacheService>("BotLootCacheService", BotLootCacheService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<CustomItemService>("CustomItemService", CustomItemService);
        con.register<BotEquipmentFilterService>("BotEquipmentFilterService", BotEquipmentFilterService);
        con.register<ProfileSnapshotService>("ProfileSnapshotService", ProfileSnapshotService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<ItemFilterService>("ItemFilterService", ItemFilterService, { lifecycle: Lifecycle.Singleton });
        con.register<BotGenerationCacheService>("BotGenerationCacheService", BotGenerationCacheService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<LocalisationService>("LocalisationService", LocalisationService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<CustomLocationWaveService>("CustomLocationWaveService", CustomLocationWaveService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<OpenZoneService>("OpenZoneService", OpenZoneService, { lifecycle: Lifecycle.Singleton });
        con.register<ItemBaseClassService>("ItemBaseClassService", ItemBaseClassService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<BotEquipmentModPoolService>("BotEquipmentModPoolService", BotEquipmentModPoolService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<BotWeaponModLimitService>("BotWeaponModLimitService", BotWeaponModLimitService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<SeasonalEventService>("SeasonalEventService", SeasonalEventService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<MatchBotDetailsCacheService>("MatchBotDetailsCacheService", MatchBotDetailsCacheService, {
            lifecycle: Lifecycle.Singleton,
        });
        con.register<RagfairTaxService>("RagfairTaxService", RagfairTaxService, { lifecycle: Lifecycle.Singleton });
        con.register<TraderPurchasePersisterService>("TraderPurchasePersisterService", TraderPurchasePersisterService);
        con.register<PmcChatResponseService>("PmcChatResponseService", PmcChatResponseService);
        con.register<GiftService>("GiftService", GiftService);
        con.register<MailSendService>("MailSendService", MailSendService);
    }

    private static registerServers(con: DependencyContainer): void
    {
        // Servers
        con.register<DatabaseServer>("DatabaseServer", DatabaseServer, { lifecycle: Lifecycle.Singleton });
        con.register<HttpServer>("HttpServer", HttpServer, { lifecycle: Lifecycle.Singleton });
        con.register<WebSocketServer>("WebSocketServer", WebSocketServer, { lifecycle: Lifecycle.Singleton });
        con.register<RagfairServer>("RagfairServer", RagfairServer);
        con.register<SaveServer>("SaveServer", SaveServer, { lifecycle: Lifecycle.Singleton });
        con.register<ConfigServer>("ConfigServer", ConfigServer, { lifecycle: Lifecycle.Singleton });
    }

    private static registerControllers(con: DependencyContainer): void
    {
        // Controllers
        con.register<BotController>("BotController", { useClass: BotController });
        con.register<ClientLogController>("ClientLogController", { useClass: ClientLogController });
        con.register<CustomizationController>("CustomizationController", { useClass: CustomizationController });
        con.register<DialogueController>("DialogueController", { useClass: DialogueController });
        con.register<GameController>("GameController", { useClass: GameController });
        con.register<HandbookController>("HandbookController", { useClass: HandbookController });
        con.register<HealthController>("HealthController", { useClass: HealthController });
        con.register<HideoutController>("HideoutController", { useClass: HideoutController });
        con.register<InraidController>("InraidController", { useClass: InraidController });
        con.register<InsuranceController>("InsuranceController", { useClass: InsuranceController });
        con.register<InventoryController>("InventoryController", { useClass: InventoryController });
        con.register<LauncherController>("LauncherController", { useClass: LauncherController });
        con.register<LocationController>("LocationController", { useClass: LocationController });
        con.register<MatchController>("MatchController", MatchController);
        con.register<NoteController>("NoteController", { useClass: NoteController });
        con.register<NotifierController>("NotifierController", { useClass: NotifierController });
        con.register<PresetBuildController>("PresetBuildController", { useClass: PresetBuildController });
        con.register<PresetController>("PresetController", { useClass: PresetController });
        con.register<ProfileController>("ProfileController", { useClass: ProfileController });
        con.register<QuestController>("QuestController", { useClass: QuestController });
        con.register<RagfairController>("RagfairController", { useClass: RagfairController });
        con.register<RepairController>("RepairController", { useClass: RepairController });
        con.register<RepeatableQuestController>("RepeatableQuestController", { useClass: RepeatableQuestController });
        con.register<TradeController>("TradeController", { useClass: TradeController });
        con.register<TraderController>("TraderController", { useClass: TraderController });
        con.register<WeatherController>("WeatherController", { useClass: WeatherController });
        con.register<WishlistController>("WishlistController", WishlistController);
    }
}
