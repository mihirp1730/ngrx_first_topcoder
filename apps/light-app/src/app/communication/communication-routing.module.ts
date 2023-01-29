import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CommunicationContainerComponent } from './communication-container/communication-container.component';
import { CommunicationChatComponent } from './communication-chat/communication-chat.component';

export const layoutRoutes: Routes = [
  {
    path: '',
    component: CommunicationContainerComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CommunicationChatComponent
      },
      {
        path: ':id',
        component: CommunicationChatComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(layoutRoutes)],
  exports: [RouterModule]
})
export class CommunicationRoutingModule {}
