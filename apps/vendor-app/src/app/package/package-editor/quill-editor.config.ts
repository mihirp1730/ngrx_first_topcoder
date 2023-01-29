export const editorConfig = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ size: ['small', false, 'large', 'huge'] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }], // it includes colors in both colors and background array
    [{ align: [] }], // it includes 'left,center,right,justify' alignments
    ['clean', 'link', 'image']
  ]
};
