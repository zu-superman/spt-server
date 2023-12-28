import { IMagazineTemplateAmmoItem } from "../profile/IAkiProfile"

export interface ISetMagazineRequest
{
    Id: string
    Name: string
    Caliber: string
    items: IMagazineTemplateAmmoItem[]
    TopCount: number
    BottomCount: number
}