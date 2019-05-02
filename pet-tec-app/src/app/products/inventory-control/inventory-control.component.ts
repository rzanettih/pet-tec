import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Product } from 'src/app/shared/product.model';
import { NgForm } from '@angular/forms';
import { Inventory } from 'src/app/shared/inventory.model';
import { ProductsService } from 'src/app/shared/products.service';

@Component({
  selector: 'app-inventory-control',
  templateUrl: './inventory-control.component.html',
  styleUrls: ['./inventory-control.component.css']
})
export class InventoryControlComponent implements OnInit {

  constructor(private productService: ProductsService) { }

  private _productItem: Product;
  @Input()
  set productItem(productItem: Product) {
    this._productItem = productItem;
    this.getInventory();
  }
  get productItem() : Product {
    return this._productItem ? this._productItem : new Product();
  }

  // string = 1 for showing and anything else for not showing
  @Input()
  public showButtons: string;

  private inventoryInContext: Inventory;
  private acionAdd: boolean;
  private showList: boolean;

  ngOnInit() {
    this.resetForm();
    this.showList = false;
  }

  resetForm(form?: NgForm) {
    if(form) form.resetForm();
    this.inventoryInContext = {
      id: null,
      qtty: null,
      cost: null,
      price: null,
      date: null,
      invoice: null,
      dateAdded: null,
      timestamp: null
    };
    this.acionAdd = false;
  }

  getInventory() {
    this.productService.getInventory(this._productItem);
  }

  formAddInventorySubmit(form: NgForm) {
    this.productService.addInventory(this._productItem, Object.assign({}, this.inventoryInContext));
    this.resetForm();
  }

  addInventory(){
    console.log("call addInventory()");
  }

  showInventoryList(){
    console.log("call listInventory()");
  }

}
