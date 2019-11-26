import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from '../Service/API/api.service';

@Component({
  selector: 'logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router, private api: APIService) {
    this.api.Logout().subscribe((data)=>{
      window.location.replace("/");
    });
  }

  ngOnInit() {
  }

}