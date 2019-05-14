import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm, FormGroup, FormControl } from '@angular/forms';
import { Product } from 'src/app/shared/product.model';
import { ProductsService } from 'src/app/shared/products.service';


@Component({
  selector: 'app-service-form',
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.css']
})
export class ServiceFormComponent implements OnInit {

  //#region Fields and properties
  private serviceInContext: Product;

  @Output() ServiceAdded: EventEmitter<Product> = new EventEmitter();

  onServiceAdded(service: Product) {
    this.ServiceAdded.emit(service);
  }

  get formProfit() : number {
    return this.serviceInContext.cost && this.serviceInContext.cost > 0 ? (((this.serviceInContext.price - this.serviceInContext.cost)/this.serviceInContext.cost) * 100) : null;
  }

  private _isUpdate: boolean = false;

  
  //TODO: Implement this when update the service
  @Output() ServiceUpdated: EventEmitter<Product> = new EventEmitter();
  onServiceUpdated(product: Product) {
    this.ServiceUpdated.emit(product);
  }

  @Output() ServiceFormLoaded: EventEmitter<void> = new EventEmitter();
  onServiceFormLoaded() {
    this.ServiceFormLoaded.emit();
  }

  @Output() ServiceFormClosed: EventEmitter<void> = new EventEmitter();
  onServiceFormClosed() {
    this.ServiceFormClosed.emit();
  }
  //#endregion
  
  constructor(private productservice: ProductsService) { }

  private resetForm(form?: NgForm) {
    if(form) {
      form.resetForm();
      form.reset();
    }

    this.serviceInContext = {
      id: null,
      productName: null,
      type: "S",
      isActive: null,
      dateAdded: null,
      timestamp: null,
      price: null,
      cost: null,
      qtty: null,
      inventoryList: null
    };
  }


  ngOnInit() {
    this.resetForm();
    this.onServiceFormLoaded();
  }

  ngOnDestroy() {
    this._isUpdate = false;
    this.serviceInContext = null;
    this.onServiceFormClosed();
  }

  public showServiceForEditing(product: Product) {
    // Isso e pra nao ficar alterando o mesmo objeto que esta sendo exibido na tela do componente pai
    Object.assign(this.serviceInContext, product);
    this._isUpdate = true;
  }

  private showProfit(costAmount: number, priceAmount: number) : string {
    return costAmount && costAmount > 0 ? `Lucro: ${(((priceAmount - costAmount)/costAmount) * 100).toFixed(0)}%` : 'Informe custo e preço para calculo de lucro';
  }

  public SaveService() {
    this.serviceInContext.productName = this.serviceInContext.productName.trim().toUpperCase();
    this.serviceInContext.isActive = true;

    this.productservice.SaveProduct(this.serviceInContext, savedService => {

      if(!this._isUpdate) {
        this.onServiceAdded(savedService);
        this.resetForm();
      } else {
        
        this.onServiceUpdated(savedService);
      } 
      
    });
  }

}
