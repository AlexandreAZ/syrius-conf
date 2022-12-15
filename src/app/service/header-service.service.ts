import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderServiceService {

  public headerTitle = new BehaviorSubject('Title');
  
  constructor() { }

  setTitle(headerTitle: string) {
    this.headerTitle.next(headerTitle);
  }
}
