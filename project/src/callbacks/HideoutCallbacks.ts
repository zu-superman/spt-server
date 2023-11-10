import { inject, injectable } from "tsyringe";

import { HideoutController } from "@spt-aki/controllers/HideoutController";
import { OnUpdate } from "@spt-aki/di/OnUpdate";
import { IPmcData } from "@spt-aki/models/eft/common/IPmcData";
import { IHandleQTEEventRequestData } from "@spt-aki/models/eft/hideout/IHandleQTEEventRequestData";
import { IHideoutCancelProductionRequestData } from "@spt-aki/models/eft/hideout/IHideoutCancelProductionRequestData";
import { IHideoutContinuousProductionStartRequestData } from "@spt-aki/models/eft/hideout/IHideoutContinuousProductionStartRequestData";
import { IHideoutImproveAreaRequestData } from "@spt-aki/models/eft/hideout/IHideoutImproveAreaRequestData";
import { IHideoutPutItemInRequestData } from "@spt-aki/models/eft/hideout/IHideoutPutItemInRequestData";
import { IHideoutScavCaseStartRequestData } from "@spt-aki/models/eft/hideout/IHideoutScavCaseStartRequestData";
import { IHideoutSingleProductionStartRequestData } from "@spt-aki/models/eft/hideout/IHideoutSingleProductionStartRequestData";
import { IHideoutTakeItemOutRequestData } from "@spt-aki/models/eft/hideout/IHideoutTakeItemOutRequestData";
import { IHideoutTakeProductionRequestData } from "@spt-aki/models/eft/hideout/IHideoutTakeProductionRequestData";
import { IHideoutToggleAreaRequestData } from "@spt-aki/models/eft/hideout/IHideoutToggleAreaRequestData";
import { IHideoutUpgradeCompleteRequestData } from "@spt-aki/models/eft/hideout/IHideoutUpgradeCompleteRequestData";
import { IHideoutUpgradeRequestData } from "@spt-aki/models/eft/hideout/IHideoutUpgradeRequestData";
import { IRecordShootingRangePoints } from "@spt-aki/models/eft/hideout/IRecordShootingRangePoints";
import { IItemEventRouterResponse } from "@spt-aki/models/eft/itemEvent/IItemEventRouterResponse";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { IHideoutConfig } from "@spt-aki/models/spt/config/IHideoutConfig";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";

@injectable()
export class HideoutCallbacks implements OnUpdate
{
    protected hideoutConfig: IHideoutConfig;

    constructor(
        @inject("HideoutController") protected hideoutController: HideoutController, // TODO: delay needed
        @inject("ConfigServer") protected configServer: ConfigServer,
    )
    {
        this.hideoutConfig = this.configServer.getConfig(ConfigTypes.HIDEOUT);
    }

    /**
     * Handle HideoutUpgrade event
     */
    public upgrade(pmcData: IPmcData, body: IHideoutUpgradeRequestData, sessionID: string): IItemEventRouterResponse
    {
        return this.hideoutController.startUpgrade(pmcData, body, sessionID);
    }

    /**
     * Handle HideoutUpgradeComplete event
     */
    public upgradeComplete(
        pmcData: IPmcData,
        body: IHideoutUpgradeCompleteRequestData,
        sessionID: string,
    ): IItemEventRouterResponse
    {
        return this.hideoutController.upgradeComplete(pmcData, body, sessionID);
    }

    /**
     * Handle HideoutPutItemsInAreaSlots
     */
    public putItemsInAreaSlots(
        pmcData: IPmcData,
        body: IHideoutPutItemInRequestData,
        sessionID: string,
    ): IItemEventRouterResponse
    {
        return this.hideoutController.putItemsInAreaSlots(pmcData, body, sessionID);
    }

    /**
     * Handle HideoutTakeItemsFromAreaSlots event
     */
    public takeItemsFromAreaSlots(
        pmcData: IPmcData,
        body: IHideoutTakeItemOutRequestData,
        sessionID: string,
    ): IItemEventRouterResponse
    {
        return this.hideoutController.takeItemsFromAreaSlots(pmcData, body, sessionID);
    }

    /**
     * Handle HideoutToggleArea event
     */
    public toggleArea(
        pmcData: IPmcData,
        body: IHideoutToggleAreaRequestData,
        sessionID: string,
    ): IItemEventRouterResponse
    {
        return this.hideoutController.toggleArea(pmcData, body, sessionID);
    }

    /**
     * Handle HideoutSingleProductionStart event
     */
    public singleProductionStart(
        pmcData: IPmcData,
        body: IHideoutSingleProductionStartRequestData,
        sessionID: string,
    ): IItemEventRouterResponse
    {
        return this.hideoutController.singleProductionStart(pmcData, body, sessionID);
    }

    /**
     * Handle HideoutScavCaseProductionStart event
     */
    public scavCaseProductionStart(
        pmcData: IPmcData,
        body: IHideoutScavCaseStartRequestData,
        sessionID: string,
    ): IItemEventRouterResponse
    {
        return this.hideoutController.scavCaseProductionStart(pmcData, body, sessionID);
    }

    /**
     * Handle HideoutContinuousProductionStart
     */
    public continuousProductionStart(
        pmcData: IPmcData,
        body: IHideoutContinuousProductionStartRequestData,
        sessionID: string,
    ): IItemEventRouterResponse
    {
        return this.hideoutController.continuousProductionStart(pmcData, body, sessionID);
    }

    /**
     * Handle HideoutTakeProduction event
     */
    public takeProduction(
        pmcData: IPmcData,
        body: IHideoutTakeProductionRequestData,
        sessionID: string,
    ): IItemEventRouterResponse
    {
        return this.hideoutController.takeProduction(pmcData, body, sessionID);
    }

    /**
     * Handle HideoutQuickTimeEvent
     */
    public handleQTEEvent(
        pmcData: IPmcData,
        request: IHandleQTEEventRequestData,
        sessionId: string,
    ): IItemEventRouterResponse
    {
        return this.hideoutController.handleQTEEventOutcome(sessionId, pmcData, request);
    }

    /**
     * Handle client/game/profile/items/moving - RecordShootingRangePoints
     */
    public recordShootingRangePoints(
        pmcData: IPmcData,
        request: IRecordShootingRangePoints,
        sessionId: string,
    ): IItemEventRouterResponse
    {
        return this.hideoutController.recordShootingRangePoints(sessionId, pmcData, request);
    }

    /**
     * Handle client/game/profile/items/moving - RecordShootingRangePoints
     */
    public improveArea(
        pmcData: IPmcData,
        request: IHideoutImproveAreaRequestData,
        sessionId: string,
    ): IItemEventRouterResponse
    {
        return this.hideoutController.improveArea(sessionId, pmcData, request);
    }

    /**
     * Handle client/game/profile/items/moving - HideoutCancelProductionCommand
     */
    public cancelProduction(
        pmcData: IPmcData,
        request: IHideoutCancelProductionRequestData,
        sessionId: string,
    ): IItemEventRouterResponse
    {
        return this.hideoutController.cancelProduction(sessionId, pmcData, request);
    }

    public async onUpdate(timeSinceLastRun: number): Promise<boolean>
    {
        if (timeSinceLastRun > this.hideoutConfig.runIntervalSeconds)
        {
            this.hideoutController.update();
            return true;
        }
        return false;
    }

    public getRoute(): string
    {
        return "aki-hideout";
    }
}
