import { Inventory } from './inventory.model';

export class Product {
    id: string;
    productName: string;
    type: string;
    isActive: boolean;
    dateAdded?: string;
    timestamp?: number;
    price?: number;
    cost?: number;
    qtty?: number;
    profit?: number;
    inventoryList?: Inventory[]
}
