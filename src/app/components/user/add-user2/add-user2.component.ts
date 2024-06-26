import { Component } from '@angular/core';
import { User } from '../../../models/user';
import { Address } from '../../../models/address';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../services/user.service';
import {
  dobValidator,
  passwordValidator,
} from '../../../helpers/customValidation';
import { CartService } from '../../../services/cart.service';
import { Cart } from '../../../models/cart';

@Component({
  selector: 'app-add-user2',
  templateUrl: './add-user2.component.html',
  styleUrl: './add-user2.component.scss',
})
export class AddUser2Component {
  validMsg: boolean = false;
  tempUser: User = new User(
    '',
    '',
    '',
    '',
    '',
    '',
    new Date(),
    new Address('', '', '', '', '', '', '')
  );
  tempAddr: Address = new Address('', '', '', '', '', '', '');

  idUpdated: number = 0;

  addUserForm: FormGroup;

  cart: Cart = new Cart('', 0, [], []);

  firstName: AbstractControl;
  lastName: AbstractControl;
  email: AbstractControl;
  password: AbstractControl;
  con_password: AbstractControl;
  date_of_birth: AbstractControl;
  houseno: AbstractControl;
  street: AbstractControl;
  area: AbstractControl;
  city: AbstractControl;
  pincode: AbstractControl;
  country: AbstractControl;

  constructor(
    fb: FormBuilder,
    private userService: UserService,
    private cartService: CartService
  ) {
    this.addUserForm = fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      con_password: ['', Validators.required],
      date_of_birth: [
        '',
        Validators.compose([Validators.required, dobValidator]),
      ],
      houseno: ['', Validators.required],
      street: ['', Validators.required],
      area: ['', Validators.required],
      city: ['', Validators.required],
      pincode: ['', Validators.required],
      country: ['', Validators.required],
    });

    this.firstName = this.addUserForm.controls['firstName'];
    this.lastName = this.addUserForm.controls['lastName'];
    this.email = this.addUserForm.controls['email'];
    this.password = this.addUserForm.controls['password'];
    this.con_password = this.addUserForm.controls['con_password'];
    this.date_of_birth = this.addUserForm.controls['date_of_birth'];
    this.houseno = this.addUserForm.controls['houseno'];
    this.street = this.addUserForm.controls['street'];
    this.area = this.addUserForm.controls['area'];
    this.city = this.addUserForm.controls['city'];
    this.pincode = this.addUserForm.controls['pincode'];
    this.country = this.addUserForm.controls['country'];

    this.con_password.valueChanges.subscribe(() => {
      this.con_password.setValidators([
        Validators.required,
        passwordValidator(this.password),
      ]);
      this.con_password.updateValueAndValidity();
    });
  }

  onSubmit(addUserFormValue: any): void {
    try {
      if (this.addUserForm.valid) {
        this.validMsg = true;
        this.userService.getUsers().subscribe((data) => {
          // const largestId = Math.max(...data.map((item) => parseInt(item.id)));
          // console.log(largestId);
          // this.idUpdated = largestId + 1;
          this.tempAddr = new Address(
            "0",
            addUserFormValue.houseno,
            addUserFormValue.street,
            addUserFormValue.area,
            addUserFormValue.city,
            addUserFormValue.pincode,
            addUserFormValue.country
          );
          this.tempUser = new User(
            "0",
            addUserFormValue.firstName,
            addUserFormValue.lastName,
            addUserFormValue.email,
            addUserFormValue.password,
            'user',
            addUserFormValue.date_of_birth,
            this.tempAddr
          );
        //  this.cart.id = this.idUpdated.toString();
          localStorage.setItem('restaurantSelected', '');
          // this.cartService
          //   .addCart(new Cart(this.idUpdated.toString(), 0, [], []))
          //   .subscribe((data) => {
          //     console.log(
          //       'Created cart for user:',
          //       this.tempUser.firstName,
          //       data
          //     );
          //   });
          console.log(this.tempUser)
          this.userService.addUser(this.tempUser).subscribe((data) => {
            console.log("successfully registered user");
          });
         // window.location.reload();
        });
      } else this.markFormGroupTouched(this.addUserForm);
  } catch(e) {
    console.log("Unable to add user", e);
  }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
