import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ProductsService } from '../shared/products.service';
import { ToastrService } from 'ngx-toastr';
import { DateHelper } from '../shared/date-helper.model';


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  private isUpdate: boolean = false;
  constructor(private productService: ProductsService, private msg: ToastrService) { }

  ngOnInit() {
    this.resetForm();
    this.productService.GetAllProducts().then(allItems => {
      this.productService.filterListByText("");
    });
  }

  resetForm(form?: NgForm) {
    if(form) form.resetForm();
    this.productService.productInContext = {
      id: null,
      productName: null,
      type: "P",
      isActive: null,
      dateAdded: null,
      timestamp: null
    };
  }

  formSubmit(form: NgForm) {
    // let dataForm = form.value;
    if(!this.isUpdate && document.getElementById("existing-code-label").style.display == "none") {
      this.productService.productInContext.id = this.productService.productInContext.id.toUpperCase().trim();
      this.productService.productInContext.productName = this.productService.productInContext.productName.toUpperCase().trim();
      this.productService.productInContext.timestamp = DateHelper.currentTimestamp;
      this.productService.productInContext.dateAdded = DateHelper.currentDate;
      this.productService.productInContext.isActive = true;

      this.productService.SaveItemInContext();
      this.resetForm(form);
      this.msg.success("Produto salvo");
    }
  }

  onFilter(event: any) {
    if(event && event.target){
      this.productService.filterListByText(event.target.value);
    }
  }

  validateIdBeingEntered(event: any) {
    if(event && event.target) {
      document.getElementById("existing-code-label").style.display = this.productService.isIdExisting(event.target.value) ? 'block' : 'none';
    }
  }

}
