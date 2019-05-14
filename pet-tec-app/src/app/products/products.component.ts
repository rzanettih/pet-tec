import { Component, OnInit, TemplateRef, ViewChild, ElementRef, Directive } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NgForm } from '@angular/forms';
import { ProductsService } from '../shared/products.service';
import { ToastrService } from 'ngx-toastr';
import { DateHelper } from '../shared/date-helper.model';
import { Product } from '../shared/product.model';
import { ProductFormComponent } from './product-form/product-form.component';
import { ServiceFormComponent } from './service-form/service-form.component';


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

  //#region Fields and Properties
    
  // somente um pop-up vai abrir por vez, entao tudo bem ter um objeto geral para todas
  private modalRef: BsModalRef;

  //#endregion

  constructor(private productService: ProductsService, private msg: ToastrService, private modalService: BsModalService) { 
    this._productForEdit = null;
  }

  ngOnInit() {
    this.productService.GetAllProducts().then(_ => {
      this.productService.filterListByText("");
    });
  }

  onFilter(event: any) {
    if(event && event.target) {
      this.productService.filterListByText(event.target.value);
    }
  }

  private _productForEdit: Product;
  onEditProduct(product: Product, productModal: TemplateRef<any>, serviceModal: TemplateRef<any>) {
    this._productForEdit = product;
    this.modalRef = this.modalService.show(product.type == "P" ? productModal : serviceModal, {class: 'modal-lg', keyboard: true});
  }

  onProductFormModalLoaded(productFormComponent: ProductFormComponent) {
    productFormComponent.showProductForEditing(this._productForEdit);
  }

  onServiceFormModalLoaded(serviceFormComponent: ServiceFormComponent) {
    serviceFormComponent.showServiceForEditing(this._productForEdit);
  }

  onProductFormClosed(){
    this._productForEdit = null;
  }

  editCancel() {
    this.modalRef.hide();
  }

  private productToDelete: Product;
  
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
    this.msg.success(`${product.type == "S" ? 'Serviço' : 'Produto'} salvo com sucesso`);
  }

  onProductUpdated(product: Product) {
    console.log('Chegou no onProductUpdated do componente pai');
    this.onProductAdded(product);
    this.modalRef.hide();
  }

}
