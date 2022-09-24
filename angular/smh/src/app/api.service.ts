import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiUrl : string = 'http://localhost:3000';

  constructor(public http: HttpClient) { }

  getUsers(): void {
    this.http.get(`${this.apiUrl}/user`, {withCredentials: true}).subscribe(
      (data: object) => { console.debug(data)}
    )
  }

  getPlayer(): void {
    this.http.get(`${this.apiUrl}/user/me`, {withCredentials: true}).subscribe(
      (data: object) => { console.debug(data)}
    )
  }

  getFriendRequests(): void {
    this.http.get(`${this.apiUrl}/friends/getfriendsrequests`, {withCredentials: true}).subscribe(
      (data: object) => { console.debug(data)}
    )
  }

  getPlayerFriends(): void {
    this.http.get(`${this.apiUrl}/friends/friends`, {withCredentials: true}).subscribe(
      (data: object) => { console.debug(data)}
    )
  }
}
