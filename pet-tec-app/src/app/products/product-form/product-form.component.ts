import { Component, OnInit, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import {FormControl, Validators, FormGroup, NgForm } from '@angular/forms';
import { ProductsService } from 'src/app/shared/products.service';
import { Product } from 'src/app/shared/product.model';
import { DateHelper } from 'src/app/shared/date-helper.model';
import { Inventory } from 'src/app/shared/inventory.model';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {

  //#region Inputs, Outputs and Events

  @Output() ProductFormLoaded: EventEmitter<void> = new EventEmitter();
  onProductFormLoaded() {
    this.ProductFormLoaded.emit();
  }

  @Output() ProductFormClosed: EventEmitter<void> = new EventEmitter();
  onProductFormClosed() {
    this.ProductFormClosed.emit();
  }

  //TODO: Mais facil ter somente um produto nesse contexto
  @Output() ProductAdded: EventEmitter<Product> = new EventEmitter();
  onProductAdded(product: Product) {
    this.ProductAdded.emit(product);
  }

  @Output() ProductUpdated: EventEmitter<Product> = new EventEmitter();
  onProductUpdated(product: Product) {
    this.ProductUpdated.emit(product);
  }

  private _isUpdate: boolean = false;
  private _productInContext: Product;
  get ProductInContext() : Product {
    return this._productInContext ? this._productInContext : null;
  }

  //#endregion
  
  //#region Form fields & controls
  
  @ViewChild('formProduct') _formProduct: NgForm;

  private productForm = new FormGroup({
    id: new FormControl(''),
    name: new FormControl(''),
    qtInventory: new FormControl(''),
    cost: new FormControl(''),
    price: new FormControl('')
  });

  private _removeFormValidators() {
    this.productForm.clearValidators();
  }

  private _addFormValidators() {
    this.productForm.controls.id.setValidators([Validators.required]);
    this.productForm.controls.name.setValidators([Validators.required]);
    this.productForm.controls.qtInventory.setValidators([Validators.min(0)]);
    this.productForm.controls.price.setValidators([Validators.min(0)]);
  }

  get formID() : string {
    return this.productForm.controls.id.value.trim().toUpperCase()
  }

  get formProductName() : string {
    return this.productForm.controls.name.value.trim().toUpperCase();
  }

  get formQtty() : number {
    return this.productForm.controls.qtInventory.value && !isNaN(this.productForm.controls.qtInventory.value) ? this.productForm.controls.qtInventory.value : null;
  }

  get formCost() : number {
    return this.productForm.controls.cost.value && !isNaN(this.productForm.controls.cost.value) ? this.productForm.controls.cost.value : null;
  }

  get formPrice() : number {
    return this.productForm.controls.price.value && !isNaN(this.productForm.controls.price.value) ? this.productForm.controls.price.value : null;
  }

  get formProfit() : number {
    return this.formCost ? (((this.formPrice - this.formCost)/this.formCost) * 100) : null;
  }

  resetForm() {
    this._removeFormValidators();
    try {
      this._formProduct.resetForm();
    } catch {}
    this.productForm.reset();
    this._addFormValidators();
  }

  //#endregion

  constructor(private productservice: ProductsService) { }

  ngOnInit() {
    this.resetForm();
    this.productForm.controls.id.valueChanges.subscribe(value => this.onIdChange(value));
    this.onProductFormLoaded();
  }

  ngOnDestroy() {
    this._isUpdate = false;
    this._productInContext = null;
    this.onProductFormClosed();
  }

  showProductForEditing(product: Product){
    if(product && product.id) {
      this._productInContext = product;
      this._isUpdate = true;
      this.productForm.controls.name.setValue(this._productInContext.productName);
    }
  }

  getProductFilled() : Product {
    return {
      id: this.formID,
      productName: this.formProductName,
      type: "P",
      isActive: true,
      timestamp: DateHelper.currentTimestamp,
      dateAdded: DateHelper.currentDate,
      price: this.formPrice,
      cost: this.formCost,
      qtty: this.formQtty,
      profit: this.formProfit,
      inventoryList: [this.getInventoryFilled()] //fixme: essa linha pode ser que de problema se o produto estiver sendo editado
    }
  }

  getInventoryFilled() : Inventory {
    return {
      qtty: this.formQtty,
      cost: this.formCost,
      price: this.formPrice,
      profit: this.formProfit,
      dateAdded: DateHelper.currentDate,
      timestamp: DateHelper.currentTimestamp
    };
  }

  public SaveProduct() {
    if(!this._isUpdate) {
      this._productInContext = this.getProductFilled();

      this.productservice.SaveProduct(this._productInContext, productSaved => {
        this.onProductAdded(productSaved);
        this.resetForm();
      });
    } else {
      this._productInContext.productName = this.formProductName;
      this.productservice.UpdateProductName(this._productInContext.id, this._productInContext.productName, _ => {
        this.onProductUpdated(this._productInContext);
      });
    }
  }
  
  private onSubmit(){
    this.SaveProduct();
  }

  showProfit(costAmount: number, priceAmount: number) : string {
    return `Lucro: ${this.formProfit.toFixed(0)}%`;
  }

  onIdChange(value: string) {
    if(value && value != "") {
      if(this.productservice.isIdExisting(value)) 
        this.productForm.controls.id.setErrors({duplicated: "O código do produto já existe"});
      

      if(!this.productservice.isIdExisting(value) && value.trim() != "") 
        this.productForm.controls.id.clearValidators();

      this.productForm.controls.id.setValidators([Validators.required]);
    }
  }

}
