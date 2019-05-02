import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Product } from 'src/app/shared/product.model';
import { InventoryControlComponent } from '../inventory-control/inventory-control.component';

@Component({
  selector: 'app-product-list-item',
  templateUrl: './product-list-item.component.html',
  styleUrls: ['./product-list-item.component.css']
})
export class ProductListItemComponent implements OnInit {

  constructor() { }

  private _productItem: Product;
  @Input()
  set productItem(productItem: Product) {
    this._productItem = productItem;
  }
  get productItem() : Product {
    return this._productItem ? this._productItem : new Product();
  }

  @Output() delete: EventEmitter<Product> = new EventEmitter();

  @Output() edit: EventEmitter<Product> = new EventEmitter();

  @ViewChild('itemInventory') itemInventory: InventoryControlComponent;

  onDelete() {
    this.delete.emit(this.productItem);
  }

  onEdit() {
    this.edit.emit(this.productItem);
  }

  addInventory() {
    this.itemInventory.addInventory();
  }

  listInventory() {
    this.itemInventory.showInventoryList();
  }

  ngOnInit() {
  }

}
