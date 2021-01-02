function Font(loader, assets) {
  return {
          frame: {
            image: loader.addImage(assets+'/frame.png'),
            size: {
              height: 12,
              width: 12
            },
            height: function(linesHeight) {
              return this.margin.top+this.padding.y+linesHeight+this.padding.y+this.margin.bottom;
            },
            width: function(linesWidth) {
              return this.margin.left+this.padding.x+linesWidth+this.padding.x+this.margin.right;
            },
            margin: {
              top: 4,
              bottom: 4,
              left: 4,
              right: 2
            },
            padding: {
              x: 2,
              y: 2
            },
            slice: {
              left: 4,
              right: 8,
              top: 4,
              bottom: 8
            },
            fillStyle: "#fff"
          },
          height: function(numberLines) {
            return (numberLines*12)-4;
          },
          image: loader.addImage(assets+'/font.png'),
          charWidth: 8,
          charHeight: 8,
          lineHeight: 8,
          map: 'abcdefghijklmnopqrstuvwxyz."\',:!ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>-;[]░@#$%^&*()+?/\\`~|',
          widths: {
            'a':7,'b':7,'c':6,'d':7,'e':6,
            'f':6,'g':7,'h':7,'i':4,'j':6,
            'k':7,'l':4,'m':7,'n':6,'o':6,
            'p':7,'q':7,'r':7,'s':6,'t':5,
            'u':7,'v':6,'w':7,'x':7,'y':6,'z':6,
            'A':6,'B':7,'C':7,'D':7,'E':7,
            'F':7,'G':7,'H':6,'I':4,'J':7,
            'K':7,'L':5,'M':7,'N':7,'O':7,
            'P':7,'Q':6,'R':7,'S':6,'T':6,
            'U':6,'V':6,'W':7,'X':7,'Y':6,'Z':7,
            ',':3,'.':2,'!':4,'[':3,'-':4,
            ']':3,'\'':3,'"':5,'░':8,
            '0':7,'1':6,'2':6,'3':6,'4':7,
            '5':6,'6':6,'7':6,'8':6,'9':6,
            ':':2,';':3,'<':5,'>':5,'@':7,
            '#':7,'$':6,'%':7,'^':7,'&':7,
            '*':7,'(':4,')':4,'+':6,'?':6,
            '/':7,'\\':7,'`':3,'~':7,'|':2
          }
      };
}
