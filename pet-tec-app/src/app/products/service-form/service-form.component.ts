import { Component, OnInit } from '@angular/core';
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
  //#endregion
  
  constructor(private productservice: ProductsService) { }

  private resetForm(form?: NgForm) {
    if(form) form.resetForm();
    this.serviceInContext = {
      id: null,
      productName: null,
      type: "S",
      isActive: null,
      dateAdded: null,
      timestamp: null,
      price: null,
      qtty: null,
      inventoryList: null
    };
  }


  ngOnInit() {
    this.resetForm();
  }

  public setProductForUpdate(product: Product) {

  }

  private showProfit(costAmount: number, priceAmount: number) : string {
    return costAmount && costAmount > 0 ? `Lucro: ${(((priceAmount - costAmount)/costAmount) * 100).toFixed(0)}%` : 'Informe custo e preço para calculo de lucro';
  }

  private onSubmit(form: NgForm) {
    console.log([form, this.serviceInContext]);
    this.serviceInContext.productName = this.serviceInContext.productName.trim().toUpperCase();
    this.productservice.SaveProduct(this.serviceInContext, savedService => {
      console.log(savedService);
    });
  }

}
