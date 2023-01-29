import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersnapComponent } from './usersnap/usersnap.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    UsersnapComponent
  ],
  exports: [UsersnapComponent]
})
export class AppUsersnapModule {}
