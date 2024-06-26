import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { Observable } from 'rxjs';
import { Dish } from '../../models/dish';
import { Cart } from '../../models/cart';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order';
import { UserService } from '../../services/user.service';
import { CartDish } from '../../models/cartDish';
import { DishOrder } from '../../models/dishorder';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  cart: Cart = new Cart('', 0, [], []);
  cartId: number = 0;
  order: Order = new Order('', '', 0, '', [], [], []);
  tempDish: Dish = new Dish("","",0,"","",false);
  tempDishOrder: DishOrder = new DishOrder(0,this.tempDish,0, new Order("","",0,"",[],[],[]),0);

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private messageService: MessageService
  ) {
    console.log('cart constructor called');
  }

  ngOnInit(): void {
    console.log('cart ngOnInit called');
    console.log(localStorage.getItem('userId'));
    if (localStorage.getItem('userId') != null) {
      var cartId = localStorage.getItem('userId')
        ? localStorage.getItem('userId')
        : '0';
      this.cartId = parseInt(cartId ? cartId : '0');

      this.cartService.getCartById(this.cartId.toString()).subscribe((data) => {
      //  console.log(data);
        var tempCart = new Cart("0",0,[],[])
        tempCart = data;
      //  console.log(tempCart)
        this.cart.id = tempCart.id.toString();
    //    console.log(tempCart.Amount)
        this.cart.Amount = tempCart.Amount;  
        this.cart.user_id = tempCart.user_id; 
        tempCart.cartDishes.forEach(cd => {
        //  console.log(cd.Dish)
          this.cart.arrDishes.push(cd.Dish?cd.Dish:new Dish("0","",0,"","",true))
          this.cart.quantity.push(cd.quantity)
        });
        console.log('cart details:', this.cart);

        this.cartService.refreshTheCart(this.cart)

        this.cartService.getTheRefreshedCart().subscribe((data)=>{
            this.cart = data;
        })
      });
    }
  }

  IncreaseQty(index: number) {
    this.cart.quantity[index]++;
    this.cart.Amount += this.cart.arrDishes[index].price;
  }

  DecreaseQty(index: number) {
    this.cart.quantity[index]--;
    this.cart.Amount -= this.cart.arrDishes[index].price;

    if (this.cart.quantity[index] == 0) {
      this.cart.quantity.splice(index, 1);
     this.cart.arrDishes.splice(index, 1);
      if (this.cart.quantity.length == 0) {
        this.onSaveCart();
      }
    }
  }

  Checkout() {
    this.orderService.getOrders().subscribe((data) => {
      this.order.id = "0";

      this.order.orderDate = new Date().toLocaleDateString();
      this.order.userId = this.cart.user_id.toString();
      this.order.orderAmount = this.cart.Amount;
      console.log(this.cart.arrDishes)

      this.cart.arrDishes.forEach((arrdish, i) => {
        this.tempDishOrder = new DishOrder(0,this.tempDish,0, new Order("","",0,"",[],[],[]),0)
        this.tempDishOrder.dish = arrdish;
        this.tempDishOrder.dishId = parseInt(arrdish.id);
        this.tempDishOrder.quantity = this.cart.quantity[i];
        console.log(this.tempDishOrder)
        this.order.dishOrders.push(this.tempDishOrder);
        console.log(this.order.dishOrders);
      });

      console.log(this.order.dishOrders);

      this.cart.arrDishes.forEach((dish) => {
        this.order.arrDishes.push(dish);
      });

      this.cart.quantity.forEach((qty) => {
        this.order.quantity.push(qty);
      });

      console.log("order to be added:", this.order);

      this.orderService.addOrder(this.order).subscribe((data) => {
        console.log(data);
        this.messageService.add({
          key: 'tr',
          severity: 'success',
          summary: 'Success',
          detail: 'Your order is placed!',
        });
        this.onResetCart();
      });

      
    });
  }

  onResetCart() {
    this.cart.quantity = [];
    this.cart.arrDishes = [];
    this.cart.Amount = 0;
    this.cart.cartDishes = [];

    try{
      this.cartService.updateCart(this.cart).subscribe(() => {
        console.log('new cart: ', this.cart);
        localStorage.setItem('restaurantSelected', '');
        // this.cartService.refreshTheCart(this.cart)

        this.messageService.add({
          key: 'tr',
          severity: 'info',
          summary: 'Info',
          detail: 'Cart is reset!',
        });
      });
    }
    catch(error){
      console.log("Error while resetting cart:",error)
    }
    

    
  }

  onSaveCart() {
    this.cart.cartDishes = []

    for(var i=0;i<this.cart.arrDishes.length;i++){
      this.cart.cartDishes.push(new CartDish(parseInt(this.cart.arrDishes[i].id),this.cart.quantity[i],parseInt(this.cart.id)))
    }

    try{
      this.cartService.updateCart(this.cart).subscribe(() => {
        console.log('current cart: ', this.cart);
        // this.cartService.refreshTheCart(this.cart)
        this.messageService.add({
          key: 'tr',
          severity: 'success',
          summary: 'Success',
          detail: 'Cart saved successfully!',
        });
      });
    }
    catch(error){
      console.log("Error while saving cart to backend:",error)
    }
    
    

    
    
  }
}
