import { Component, OnInit, Input } from '@angular/core';
import {FormControl, FormGroupDirective, NgForm, Validators, FormGroup, ValidatorFn, AbstractControl} from '@angular/forms';
import { ProductsService } from 'src/app/shared/products.service';


@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {

  constructor(private productservice: ProductsService) { }
  
  private productForm = new FormGroup({
    id: new FormControl('', [
      Validators.required
    ]),
    name: new FormControl('', [
      Validators.required
    ]),
    qtInventory: new FormControl(''),
    cost: new FormControl(''),
    price: new FormControl(''),
  });



  ngOnInit() {
  }

  onSubmit(){
    console.log(this.productForm);
  }

  onIdChange(event: any) {
    
    if(this.productservice.isIdExisting(event.target.value) && this.productForm.controls.id.touched) {
      this.productForm.controls.id.setErrors({"duplicated": "teste de erro"});
    }

    // if(!this.productservice.isIdExisting(event.target.value) && this.productForm.controls.id.touched) {
    //   this.productForm.controls.id.cl
    // }


    console.log(`this.productservice.isIdExisting(event.target.value): ${}`);
    
    console.log();
    
    console.log(this.productservice.allProducts);
  }

}
