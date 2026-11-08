import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Order } from '../models/order.model';
import { MOCK_ORDERS } from '../data/orders.data';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/orders';
  private orders: Order[] = [];

  constructor(private http: HttpClient) {
    this.initOrders();
  }

  private initOrders() {
    const saved = localStorage.getItem('tqg_orders');
    if (saved) {
      try {
        this.orders = JSON.parse(saved);
      } catch (e) {
        this.orders = [...MOCK_ORDERS];
      }
    } else {
      this.orders = [...MOCK_ORDERS];
      this.saveOrders();
    }
  }

  private saveOrders() {
    localStorage.setItem('tqg_orders', JSON.stringify(this.orders));
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl).pipe(
      tap(data => {
        if (data && data.length > 0) {
          this.orders = data;
          this.saveOrders();
        }
      }),
      catchError(() => of(this.orders))
    );
  }

  getUserOrders(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}?userId=${encodeURIComponent(userId)}`).pipe(
      catchError(() => of(this.orders.filter(o => o.userId === userId)))
    );
  }

  getOrderById(id: string): Observable<Order | undefined> {
    const local = this.orders.find(o => o.id === id);
    return of(local);
  }

  createOrder(orderData: Partial<Order>): Observable<Order> {
    const newOrder: Order = {
      id: orderData.id || 'TQG' + Math.floor(1000 + Math.random() * 9000),
      userId: orderData.userId || 'guest',
      customerName: orderData.customerName || '',
      customerPhone: orderData.customerPhone || '',
      customerEmail: orderData.customerEmail || '',
      address: orderData.address || '',
      paymentMethod: orderData.paymentMethod || 'COD',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      shipping: orderData.shipping || 0,
      discount: orderData.discount || 0,
      total: orderData.total || 0,
      status: 'Đang xử lý',
      date: new Date().toISOString().split('T')[0]
    };

    return this.http.post<Order>(this.apiUrl, newOrder).pipe(
      tap(saved => {
        this.orders.unshift(saved || newOrder);
        this.saveOrders();
      }),
      catchError(() => {
        this.orders.unshift(newOrder);
        this.saveOrders();
        return of(newOrder);
      })
    );
  }

  updateOrderStatus(id: string, status: string): Observable<boolean> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status }).pipe(
      tap(() => {
        const order = this.orders.find(o => o.id === id);
        if (order) {
          order.status = status as any;
          this.saveOrders();
        }
      }),
      catchError(() => {
        const order = this.orders.find(o => o.id === id);
        if (order) {
          order.status = status as any;
          this.saveOrders();
          return of(true);
        }
        return of(false);
      }),
      () => of(true)
    );
  }
}
