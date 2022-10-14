import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiUrl : string = 'http://localhost:3000';

  constructor(public http: HttpClient) { }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    //return throwError(() => new Error('Something bad happened; please try again later.'));

    // Return the above error, to be handled at the component level
    return throwError(() => error);
  }

  getPlayers() {
    return this.http.get<Player[]>(`${this.apiUrl}/user`, {withCredentials: true})
    .pipe(catchError(this.handleError))
  }

  getPlayer(): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/user/me`, {withCredentials: true})
    .pipe(catchError(this.handleError))
  }

  updatePlayerUsername(username: string, id: string) {
    return this.http.patch<Player>(
      `${this.apiUrl}/user/${id}/updatename`, { name: username }, {withCredentials: true}
    ).pipe(catchError(this.handleError))
  }

  updateAvatar(avatar: File) {
    let formdata = new FormData();
    formdata.append('image', avatar);
    return this.http.post<Player>(
      `${this.apiUrl}/user/uploadfile`, formdata, {withCredentials: true}
    ).pipe(catchError(this.handleError))
  }

  disable2fa() {
    return this.http.post<object>(
      `${this.apiUrl}/2fa/turn-off`, {}, {withCredentials: true}
    ).pipe(catchError(this.handleError))
  }

  enable2fa(code: string) {
    return this.http.post<object>(`${this.apiUrl}/2fa/turn-on`, {code: code}, {withCredentials: true})
    .pipe(catchError(this.handleError));
  }

  generateQRCode() {
    return this.http.post(`${this.apiUrl}/2fa/generate`, {}, {withCredentials: true, responseType: "blob"})
    .pipe(catchError(this.handleError))
  }

  getFriendRequests() {
    return this.http.get<FriendRequest[]>(`${this.apiUrl}/friends/getfriendrequests`, {withCredentials: true})
    .pipe(catchError(this.handleError))
  }

  declineFriendRequest(requestId: string) {
    return this.http.post<boolean>(`${this.apiUrl}/friends/declineRequest/${requestId}`, {}, {withCredentials: true})
    .pipe(catchError(this.handleError))
  }

  acceptFriendRequest(requestId: string) {
    return this.http.post<boolean>(`${this.apiUrl}/friends/acceptRequest/${requestId}`, {}, {withCredentials: true})
    .pipe(catchError(this.handleError))
  }

  getPlayerFriends() {
    return this.http.get<FriendRequest[]>(`${this.apiUrl}/friends/friends`, {withCredentials: true})
    .pipe(catchError(this.handleError))
  }

  sendFriendRequest(playerId: string) {
    return this.http.post<FriendRequest>(`${this.apiUrl}/friends/sendRequest/${playerId}`, {}, {withCredentials: true})
    .pipe(catchError(this.handleError))
  }
}
