import { IEquipmentBuild, IWeaponBuild } from "../../../models/eft/profile/IAkiProfile";

export interface IUserBuildsResponse
{
    weaponBuilds: IWeaponBuild[]
    equipmentBuilds: IEquipmentBuild[]
}