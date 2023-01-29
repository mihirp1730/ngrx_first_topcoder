import { ChangeDetectionStrategy, Component, Input, OnChanges, SecurityContext, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'apollo-rich-text-viewer',
  templateUrl: './rich-text-viewer.component.html',
  styleUrls: ['./rich-text-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RichTextViewerComponent implements OnChanges {
  @Input()
  content = '';

  constructor(public domSanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.content.currentValue) {
      this.content = this.domSanitizer.sanitize(SecurityContext.HTML, changes.content.currentValue) || '';
    }
  }
}
