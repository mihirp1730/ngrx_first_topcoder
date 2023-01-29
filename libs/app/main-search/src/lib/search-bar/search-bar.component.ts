import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'apollo-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  @Input() showClearSearch = false;
  @Input() searchValue: string;
  @Input() filterCount = 0;
  @Output() searchInfo: EventEmitter<string> = new EventEmitter<string>();
  @Output() clearInfo: EventEmitter<void> = new EventEmitter<void>();
  @Output() showLayers: EventEmitter<void> = new EventEmitter<void>();
  @Output() toggleMenu: EventEmitter<void> = new EventEmitter<void>();

  public onShowSearchInfo(term: string): void {
    this.searchInfo.emit(term);
  }

  public onHideSearchInfo(): void {
    this.clearInfo.emit();
  }

  public onShowlayerInfo(): void {
    this.showLayers.emit();
  }

  public onToggleMenu(): void {
    this.toggleMenu.emit();
  }
}
