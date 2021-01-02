function Font(loader, assets) {
  return {
          frame: {
            image: loader.addImage(assets+'/frame.png'),
            size: {
              height: 37,
              width: 37
            },
            height: function(linesHeight) {
              return this.margin.top+this.padding.y+linesHeight+this.padding.y+this.margin.bottom;
            },
            width: function(linesWidth) {
              return this.margin.left+this.padding.x+linesWidth+this.padding.x+this.margin.right;
            },
            margin: {
              top: -4,
              bottom: 12,
              left: 0,
              right: 16
            },
            padding: {
              x: 0,
              y: 0
            },
            slice: {
              left: 16,
              right: 21,
              top: 16,
              bottom: 21
            },
            fillStyle: "#8b7300"
          },
          height: function(numberLines) {
            return (numberLines*8)-1;
          },
          image: loader.addImage(assets+'/font.png'),
          charWidth: 6,
          charHeight: 7,
          lineHeight: 8,
          map: 'abcdefghijklmnopqrstuvwxyz.?!,\'-")(ABCDEFGHIJKLMNOPQRSTUVWXYZ░',
          widths: {
            'a':6,'b':6,'c':6,'d':6,'e':6,
            'f':6,'g':6,'h':6,'i':6,'j':6,
            'k':6,'l':6,'m':6,'n':6,'o':6,
            'p':6,'q':6,'r':6,'s':6,'t':6,
            'u':6,'v':6,'w':6,'x':6,'y':6,'z':6,
            '.':6,'?':6,'!':6,',':6,"'":6,
            '-':6,'"':6,')':6,'(':6,
            'A':6,'B':6,'C':6,'D':6,'E':6,
            'F':6,'G':6,'H':6,'I':6,'J':6,
            'K':6,'L':6,'M':6,'N':6,'O':6,
            'P':6,'Q':6,'R':6,'S':6,'T':6,
            'U':6,'V':6,'W':6,'X':6,'Y':6,'Z':6,
            '░':6
          }
      };
}
