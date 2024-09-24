import { IInventory } from "@spt/models/eft/common/tables/IBotBase";
import { GenerationData } from "@spt/models/eft/common/tables/IBotType";
import { ITemplateItem } from "@spt/models/eft/common/tables/ITemplateItem";

export class InventoryMagGen {
    constructor(
        private magCounts: GenerationData,
        private magazineTemplate: ITemplateItem,
        private weaponTemplate: ITemplateItem,
        private ammoTemplate: ITemplateItem,
        private pmcInventory: IInventory,
    ) {}

    public getMagCount(): GenerationData {
        return this.magCounts;
    }

    public getMagazineTemplate(): ITemplateItem {
        return this.magazineTemplate;
    }

    public getWeaponTemplate(): ITemplateItem {
        return this.weaponTemplate;
    }

    public getAmmoTemplate(): ITemplateItem {
        return this.ammoTemplate;
    }

    public getPmcInventory(): IInventory {
        return this.pmcInventory;
    }
}
