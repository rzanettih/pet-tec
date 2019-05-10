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

  //todo: add product in context
  //todo: remove the 'save' button in case the product is being updaged in a modal and enable the ability to trigger the 'save' from parent component

  
  @Output() ProductAdded: EventEmitter<Product> = new EventEmitter();

  onProductAdded(product: Product) {
    this.ProductAdded.emit(product);
  }

  private _productForUpdate: Product;
  @Input()
  set ProductForUpdate(product: Product) {
    this._productForUpdate = product;
    this.fillFormForEdit();
  }
  get ProductForUpdate() : Product {
    return this._productForUpdate ? this._productForUpdate : null;
  }

  @Output() ProductUpdated: EventEmitter<Product> = new EventEmitter();

  onProductUpdated(product: Product) {
    this.ProductUpdated.emit(product);
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

  resetForm() {
    this._removeFormValidators();
    try {
      this._formProduct.resetForm();
    } catch {}
    this.productForm.reset();
    // this.productForm.markAsUntouched();
    this._addFormValidators();
  }

  //#endregion

  constructor(private productservice: ProductsService) { }

  ngOnInit() {
    this.resetForm();
    this.productForm.controls.id.valueChanges.subscribe(value => this.onIdChange(value));
  }

  fillFormForEdit(){
    if(this._productForUpdate && this._productForUpdate.id) {
      //TODO: Fill form
      this.productForm.controls.id.setValue(this._productForUpdate.id);
      console.log(this._productForUpdate.id);
      console.log("Chegou no componente certo") ;
      //this.productForm.controls.id = this._productForUpdate.id;
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
      qtty: this.formQtty,
      inventoryList: [this.getInventoryFilled()]
    }
  }

  getInventoryFilled() : Inventory {
    return {
      qtty: this.formQtty,
      cost: this.formCost,
      price: this.formPrice,
      dateAdded: DateHelper.currentDate,
      timestamp: DateHelper.currentTimestamp
    };
  }

  onSubmit(){
    let productSave = this.getProductFilled();

    this.productservice.SaveProduct(productSave, productSaved => {
      this.onProductAdded(productSaved);
      this.resetForm();
    });
    
  }

  showProfit(costAmount: number, priceAmount: number) : string {
    return `Lucro: ${(((priceAmount - costAmount)/costAmount) * 100).toFixed(0)}%`;
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
