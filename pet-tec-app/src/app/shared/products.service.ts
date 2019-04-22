import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Product } from './product.model';
import { Inventory } from './inventory.model';
import { DateHelper } from './date-helper.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private _productsDBNode: string = "products";
  private _inventoryDBNode: string = "inventory";

  private _allProducts: Product[];
  public get allProducts() : Product[] {
    return this._allProducts;
  }

  private _filteredProducts: Product[];
  public get filteredProducts() : Product[] {
    return this._filteredProducts;
  }

  public productInContext: Product;

  constructor(private dataBase: AngularFirestore) { }

  public GetAllProducts() : Promise<Product[]> {

    return new Promise(resolve => {
      this.dataBase.collection(this._productsDBNode, ref => ref.orderBy('productName', 'asc')).snapshotChanges().subscribe(dbReturnArray => {
        this._filteredProducts = this._allProducts = dbReturnArray.map(item => {
          return {
            id: item.payload.doc.id,
            ...item.payload.doc.data()
          } as Product; 
        });
      });

      resolve(this._allProducts);

    });
  }

  filterListByText(text: string) : Promise<number> {
    
    return new Promise((result) => {
      let qtt: number = 0;

      if(this._allProducts)
        this._filteredProducts = this._allProducts.map(product => {
          if(product.productName.toLowerCase().indexOf(text.toLowerCase()) >= 0 
              || product.id.toLowerCase().indexOf(text.toLowerCase()) >=0 
              || (product.type == "S" && 'servi'.indexOf(text.trim().toLowerCase()) >= 0)
              || (product.type == "P" && 'produ'.indexOf(text.trim().toLowerCase()) >= 0)
              || text.trim() == "") {
              
                qtt++;
                return product;
          }

        });

      result(qtt);
    });

  }

  isIdExisting(id: string) : boolean {
    return this._allProducts.findIndex(x => x.id.toLocaleLowerCase() === id.toLocaleLowerCase()) >= 0;
  }

  public SaveItemInContext() {
    let id = this.productInContext.id;
    delete this.productInContext.id;
    this.dataBase.collection(this._productsDBNode).doc(id).set(this.productInContext);
  }

  public DeleteItem(product: Product) {
    if(product)
      this.dataBase.doc(this._productsDBNode + '/' + product.id).delete().then(() => {
        this.GetAllProducts();
      });
  }

  public addInventory(product: Product, inventory: Inventory) {
    inventory.date = inventory.date && inventory.date != "" ? new Date(inventory.date).toLocaleDateString("pt-BR") : null;
    inventory.dateAdded = DateHelper.currentDate;
    inventory.timestamp = DateHelper.currentTimestamp;
    
    if(!product.inventoryList) product.inventoryList = new Array();
    product.inventoryList.push(inventory);

    if(product.id) {
      this.saveInventory(product.id, inventory);
    }

    console.log([product, inventory]);

  }

  public saveInventory(productId: string, inventory: Inventory) {
    if(productId && productId != "" && inventory) {
      delete inventory.id;
      // Add the productID to the property in the dataBase but not interesting for the object here
      inventory["productID"] = productId;
      this.dataBase.collection(this._inventoryDBNode).add(inventory).then(ref => {
        inventory.id = ref.id;
      });
      delete inventory["productID"];
    }
  }

  public getInventory(product: Product) {
    if(product && product.id) {
      // orderBy('timestamp', 'desc')
      this.dataBase.collection(this._inventoryDBNode, ref => ref.where("productID", "==", product.id).orderBy('timestamp', 'desc')).snapshotChanges().subscribe(dbReturnArray => {
        product.inventoryList = dbReturnArray.map(item => {
          return {
            id: item.payload.doc.id,
            ...item.payload.doc.data()
          } as Inventory; 
        });
      });
    }
    
  }

  

}
