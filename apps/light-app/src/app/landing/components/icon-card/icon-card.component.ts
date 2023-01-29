import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'apollo-icon-card',
  templateUrl: './icon-card.component.html',
  styleUrls: ['./icon-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconCardComponent {
  public cards = [
    {
      icon: 'icon-find',
      title: 'Find',
      description:
        'The Asset Transaction enables you to discover global data by removing the market and data silos in our industry, leading to better decisions, faster responses, and improved efficiency.'
    },
    {
      icon: 'icon-connect',
      title: 'Connect',
      description: 'Open to all users and data types, you can easily connect with the growing number of global content providers.'
    },
    {
      icon: 'icon-utilize',
      title: 'Utilize',
      description:
        'Eliminate the need for costly and time-consuming data transfers by instantly downloading your entitled data for use anywhere to integrate into your workflows in the cloud or on-prem.'
    }
  ];
}
