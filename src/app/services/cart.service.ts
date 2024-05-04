import { EventEmitter, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Dish } from '../models/dish';
import { Cart } from '../models/cart';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  baseUrl: string = 'https://localhost:7092/api';

  httpHeader = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  cartUpdated: EventEmitter<void> = new EventEmitter<void>();

  constructor(private httpClient: HttpClient) {}

  httpError(error: HttpErrorResponse) {
    let msg = '';
    if (error.error instanceof ErrorEvent) {
      msg = error.error.message;
    } else {
      msg = 'Error code:${error.status}\nMessage:${error.message}';
    }
    return throwError(msg);
  }

  getCartById(cId: string): Observable<Cart> {
    return this.httpClient
      .get<Cart>(`${this.baseUrl}/carts/${cId}`)
      .pipe(catchError(this.httpError));
  }

  getCartByUserId(userId: string): Observable<Cart> {
    return this.httpClient
      .get<Cart>(`${this.baseUrl}/carts?userId=${userId}`)
      .pipe(catchError(this.httpError));
  }

  updateCart(cart: Cart): Observable<Cart> {
    console.log('updated cart:', cart);
    this.cartUpdated.emit();
    return this.httpClient
      .put<Cart>(`${this.baseUrl}/carts/${cart.id}`, cart, this.httpHeader)
      .pipe(catchError(this.httpError));
  }

  addCart(cart: Cart): Observable<Cart> {
    return this.httpClient
      .post<Cart>(`${this.baseUrl}/carts/`, cart, this.httpHeader)
      .pipe(catchError(this.httpError));
  }
}
