import { Component, OnInit, Input } from '@angular/core';
import { Product } from 'src/app/shared/product.model';

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

  ngOnInit() {
  }

}
