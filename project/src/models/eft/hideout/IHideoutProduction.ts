import { MinMax } from "@spt/models/common/MinMax";

export interface IHideoutProductionData {
    recipes: IHideoutProduction[];
    scavRecipes: IScavRecipe[];
    cultistRecipes: ICultistRecipe[];
}

export interface IHideoutProduction {
    _id: string;
    areaType: number;
    requirements: Requirement[];
    productionTime: number;
    /** Tpl of item being crafted */
    endProduct: string;
    isEncoded: boolean;
    locked: boolean;
    needFuelForAllProductionTime: boolean;
    continuous: boolean;
    count: number;
    productionLimitCount: number;
}

export interface Requirement {
    templateId?: string;
    count?: number;
    isEncoded?: boolean;
    isFunctional?: boolean;
    type: string;
    areaType?: number;
    requiredLevel?: number;
    resource?: number;
    questId?: string;
}

export type IScavRecipe = {
    _id: string;
    requirements: Requirement[];
    productionTime: number;
    endProducts: IEndProducts;
};

export interface IEndProducts {
    Common: MinMax;
    Rare: MinMax;
    Superrare: MinMax;
}

export type ICultistRecipe = {
    _id: string;
};
