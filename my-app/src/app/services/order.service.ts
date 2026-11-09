import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Order } from '../models/order.model';
@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private api: ApiService) {}
  getOrders() { return from(this.api.request<Order[]>('/api/orders')); }
  getUserOrders(userId: string) { return this.getOrders().pipe(map(orders => orders.filter(o => o.userId === userId))); }
  getOrderById(id: string) { return this.getOrders().pipe(map(orders => orders.find(o => o.id === id))); }
  createOrder(data: Partial<Order>) { return from(this.api.request<Order>('/api/orders', 'POST', data)); }
  updateOrderStatus(id: string, status: string) { return from(this.api.request('/api/orders/' + encodeURIComponent(id) + '/status', 'PUT', { status })); }
}
