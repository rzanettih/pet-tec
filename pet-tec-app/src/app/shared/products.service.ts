import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Product } from './product.model';
import { Inventory } from './inventory.model';
import { DateHelper } from './date-helper.model';
import { async } from 'q';
import { resolve } from 'url';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  //#region DB Tables/Nodes
  private _productsDBNode: string = "products";
  private _inventoryDBNode: string = "inventory";
  //#endregion

  //#region Public properties
  private _allProducts: Product[];
  public get allProducts() : Product[] {
    return this._allProducts;
  }

  private _filteredProducts: Product[];
  public get filteredProducts() : Product[] {
    return this._filteredProducts;
  }

  // public productInContext: Product;
  //#endregion

  constructor(private dataBase: AngularFirestore) { }

  public GetAllProducts() : Promise<Product[]> {

    return new Promise(resolve => {

      this.dataBase.collection(this._productsDBNode, ref => ref.orderBy('productName', 'asc')).snapshotChanges().subscribe(dbReturnArray => {
        console.warn('Accessed DB to get all products');
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

  //#region Delete this once product in context is removed from here
  // public SaveItemInContext() {
  //   let id = this.productInContext.id;
  //   delete this.productInContext.id;
  //   this.dataBase.collection(this._productsDBNode).doc(id).set(this.productInContext);
  // }
  //#endregion

  public UpdateProductName(productID: string, productName: string, afterSaveCallBack?) {
    this.dataBase.doc(`${this._productsDBNode}/${productID}`).update({"productName":productName}).then(_ => {
      console.warn("Accessed DB to save a product");
      afterSaveCallBack();
    });
  }
  
  public SaveProduct(product: Product, afterSaveCallBack?) {
    let id = product.id && product.id != "" ? product.id : this.dataBase.createId();
    delete product.id;

    if(!product.dateAdded) product.dateAdded = DateHelper.currentDate;
    if(!product.timestamp) product.timestamp = DateHelper.currentTimestamp;

    let inventoryList: Inventory[] = product.inventoryList;
    delete product.inventoryList;

    if(!product.cost) delete product.cost;
    if(!product.price) delete product.price;
    if(!product.qtty) delete product.qtty;

    this.dataBase.collection(this._productsDBNode).doc(id).set(product).then(_ => {
      product["id"] = id;
      console.warn("Accessed DB to save a product");

      if(inventoryList && inventoryList.length == 1 && this.isInventoryGoodToBeSaved(inventoryList[0])){
        this.saveInventory(product.id, inventoryList[0], savedInventory => {
          inventoryList[0].id = savedInventory.id;
          product["inventoryList"] = inventoryList;
          if(afterSaveCallBack) afterSaveCallBack(product);
        });
      } else {
        if(afterSaveCallBack) afterSaveCallBack(product);
      }

    });
  }

  public DeleteItem(product: Product) {
    if(product) {
      this._deleteAllInventoryOfAProduct(product.id).then(_ => {
        this.dataBase.doc(this._productsDBNode + '/' + product.id).delete().then(() => {
          this.GetAllProducts();
        });
      });
      
    }
  }

  private async _deleteAllInventoryOfAProduct(productID: string) {
    this.dataBase.collection(this._inventoryDBNode, ref => ref.where("productID", "==", productID)).get().forEach(value => {
      value.forEach(doc => {
        doc.ref.delete();
      });
    }).then(result => {
      return result;
    })
  }

 /**
 * @obsolete addInventory is obsolete
 */
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

  public isInventoryGoodToBeSaved(inventory: Inventory) { 
    return (inventory && (inventory.qtty || inventory.cost || inventory.price));
  }
  
  public saveInventory(productId: string, inventory: Inventory, afterSaveCallBack?) {
    // basic information for the inventory is either qtty or cost or price
    if(productId && productId != "" && this.isInventoryGoodToBeSaved(inventory)) {
      
      // remove the property from the object so it generates automatically in the DB
      delete inventory.id;
      
      // Add the productID to the property in the dataBase but not interesting for the object in the code base model
      inventory["productID"] = productId;

      this.dataBase.collection(this._inventoryDBNode).add(inventory).then(ref => {
        console.warn(`Accessed DB to save an inventory of the ID "${ref.id}"`);
        inventory.id = ref.id;
        if(afterSaveCallBack) afterSaveCallBack(inventory);
      });

      delete inventory["productID"];

    }
  }

  public getInventory(product: Product) {
    if(product && product.id) {
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
