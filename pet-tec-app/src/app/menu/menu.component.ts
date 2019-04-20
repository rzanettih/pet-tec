import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  openMenu(menuID){
      let objMenu = document.getElementById(menuID);
      if(objMenu.classList.length == 1) {
          objMenu.classList.add('open');
      } else {
          objMenu.classList.remove('open');
      }
  }

}
