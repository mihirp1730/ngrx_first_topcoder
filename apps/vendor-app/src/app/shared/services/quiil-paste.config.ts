/* istanbul ignore file */
import * as Quill from 'quill';
import * as Delta from 'quill-delta';
import * as sanitizeHtml from 'sanitize-html';

const Clipboard = Quill.import('modules/clipboard');

export default class PasteClipboard extends Clipboard {
  [x: string]: any;
  container: any;
  quill: any;
  onPaste(e) {
    if (e.defaultPrevented || !this.quill.isEnabled()) return;
    const range = this.quill.getSelection();
    let delta = new Delta().retain(range.index);
    if (e && e.clipboardData && e.clipboardData.types && e.clipboardData.getData) {
      let text = (e.originalEvent || e).clipboardData.getData('text/html');
      if (!text) {
        text = (e.originalEvent || e).clipboardData.getData('text/plain');
      }
      const cleanedText = this.convert(sanitizeHtml(text,{
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ])
      }));
      e.stopPropagation();
      e.preventDefault();
      delta = delta.concat(cleanedText).delete(range.length);
      this.quill.updateContents(delta, Quill.sources.USER);
      this.quill.setSelection(delta.length() - range.length, Quill.sources.SILENT);
      return false;
    }
  }
}
