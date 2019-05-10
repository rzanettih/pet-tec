import { Component, OnInit, TemplateRef, ViewChild, ElementRef, Directive } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';
import { ProductsService } from '../shared/products.service';
import { ToastrService } from 'ngx-toastr';
import { DateHelper } from '../shared/date-helper.model';
import { Product } from '../shared/product.model';
import { ProductFormComponent } from './product-form/product-form.component';


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
    this.productService.GetAllProducts().then(_ => {
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

  //#region Remove when both Products and Services are Done
  // TODO: Remove when both Products and Services are Done
  // validateIdBeingEntered(event?: any) {
  //   if(event && event.target) {
  //     document.getElementById("existing-code-label").style.display = this.productService.isIdExisting(event.target.value) && !this.isUpdate ? 'block' : 'none';
  //   } else {
  //     document.getElementById("existing-code-label").style.display = 'none';
  //   }
  // }
  //#endregion
  // @ViewChild(ProductFormComponent) _productFormEdit: ProductFormComponent;
  onEditProduct(product: Product, template: TemplateRef<any>, productFormEdit: any) {
    //#region Remove when both Products and Services are Done
    // TODO: Remove when both Products and Services are Done
    // this.validateIdBeingEntered();
    // this.productService.productInContext = Object.assign({}, product);
    // this.isUpdate = true;
    // document.body.scrollTop = 0;
    // document.documentElement.scrollTop = 0;
    //#endregion
    this.modalRef = this.modalService.show(template, {class: 'modal-lg', keyboard: true});
    console.log('Hora de editar. O formulario e o produto sao: ');
    console.log([productFormEdit, product]);

    // this._productFormEdit.ProductForUpdate = product;
  }

  

  editCancel() {
    this.modalRef.hide();
  }

  private productToDelete: Product;
  
  // somente um pop-up vai abrir por vez
  private modalRef: BsModalRef;

  onDeleteProduct(product: Product, modal: TemplateRef<any>) {
    this.productToDelete = product;
    this.openModal(modal);
  }
  

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-sm', keyboard: true});
  }
 
  confirmDel() {
    this.productService.DeleteItem(this.productToDelete);
    this.msg.success("Produto excluído");
    this.cancelDel();
  }
 
  cancelDel() {
    this.modalRef.hide();
    this.productToDelete = null;
  }


  onProductAdded(product: Product) {
    this.msg.success("Produto salvo com sucesso");
  }

  onProductUpdated(product: Product) {
    this.onProductAdded(product);
  }

}
