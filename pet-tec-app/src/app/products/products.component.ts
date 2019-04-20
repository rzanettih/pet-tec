import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';
import { ProductsService } from '../shared/products.service';
import { ToastrService } from 'ngx-toastr';
import { DateHelper } from '../shared/date-helper.model';
import { Product } from '../shared/product.model';


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  private isUpdate: boolean = false;
  constructor(private productService: ProductsService, private msg: ToastrService, private modalService: BsModalService) { }

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
    this.isUpdate = false;
  }

  formSubmit(form: NgForm) {
    // let dataForm = form.value;
    if(!this.isUpdate && document.getElementById("existing-code-label").style.display == "none") {
      this.saveProduct();
      this.resetForm(form);
    }

    if(this.isUpdate) {
      this.saveProduct();
      this.resetForm(form);
    }
    
  }

  saveProduct() {
    this.productService.productInContext.id = this.productService.productInContext.id.toUpperCase().trim();
    this.productService.productInContext.productName = this.productService.productInContext.productName.toUpperCase().trim();
    this.productService.productInContext.timestamp = DateHelper.currentTimestamp;
    this.productService.productInContext.dateAdded = DateHelper.currentDate;
    this.productService.productInContext.isActive = true;

    this.productService.SaveItemInContext();
    this.msg.success("Produto salvo");
  }

  onFilter(event: any) {
    if(event && event.target) {
      this.productService.filterListByText(event.target.value);
    }
  }

  validateIdBeingEntered(event?: any) {
    if(event && event.target) {
      document.getElementById("existing-code-label").style.display = this.productService.isIdExisting(event.target.value) && !this.isUpdate ? 'block' : 'none';
    } else {
      document.getElementById("existing-code-label").style.display = 'none';
    }
  }

  onEditProduct(product: Product) {
    this.validateIdBeingEntered();
    this.productService.productInContext = Object.assign({}, product);
    this.isUpdate = true;
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  cancelEdit() {
    this.resetForm();
  }

  private productToDelete: Product;

  onDeleteProduct(product: Product, modal: TemplateRef<any>) {
    this.productToDelete = product;
    this.openModal(modal);
  }

  private modalRef: BsModalRef;

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-sm', keyboard: true});
  }
 
  confirmDel(): void {
    this.productService.DeleteItem(this.productToDelete);
    this.msg.success("Produto excluído");
    this.cancelDel();
  }
 
  cancelDel(): void {
    this.modalRef.hide();
    this.productToDelete = null;
  }

}
