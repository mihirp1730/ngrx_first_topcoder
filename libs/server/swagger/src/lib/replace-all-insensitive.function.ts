/**
 * Replaces a substring of some base string, with other string.
 * The search of the substring to replace is **case insensitive**.
 * Also, it manages to replace most RegEx characters as well.
 * See https://stackoverflow.com/a/7313467/
 *
 * @param baseStr String to make the replacement on.
 * @param substrToReplace Case insensitive substring to replace.
 * @param replaceWith String that will replace `substrToReplace`.
 */
export function replaceAllInsensitive(baseStr: string, substrToReplace: string, replaceWith: string): string {
  const esc = substrToReplace.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const reg = new RegExp(esc, 'ig');
  return baseStr.replace(reg, replaceWith);
}
