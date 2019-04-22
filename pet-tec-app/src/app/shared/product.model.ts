import { Inventory } from './inventory.model';

export class Product {
    id: string;
    productName: string;
    type: string;
    isActive: boolean;
    dateAdded: string;
    timestamp: number;
    inventoryList?: Inventory[]
}
