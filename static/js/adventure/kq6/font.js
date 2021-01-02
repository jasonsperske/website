function Font(loader, assets) {
  return {
          frame: {
            image: loader.addImage(assets+'/frame.png'),
            size: {
              height: 21,
              width: 21
            },
            height: function(linesHeight) {
              return this.margin.top+this.padding.y+linesHeight+this.padding.y+this.margin.bottom;
            },
            width: function(linesWidth) {
              return this.margin.left+this.padding.x+linesWidth+this.padding.x+this.margin.right;
            },
            margin: {
              top: 7,
              bottom: 7,
              left: 7,
              right: 4
            },
            padding: {
              x: 8,
              y: 3
            },
            slice: {
              left: 7,
              right: 14,
              top: 7,
              bottom: 14
            },
            fillStyle: "rgb(252, 196, 84)"
          },
          image: loader.addImage(assets+'/font.png'),
          height: function(numberLines) {
            return (numberLines*12)-4;
          },
          charWidth: 8,
          charHeight: 8,
          lineHeight: 8,
          map: '©™!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~░',
          widths: {
            'a':5,'b':4,'c':4,'d':4,'e':4,
            'f':3,'g':4,'h':4,'i':1,'j':2,
            'k':4,'l':1,'m':7,'n':4,'o':4,
            'p':4,'q':4,'r':4,'s':4,'t':3,
            'u':5,'v':5,'w':5,'x':5,'y':4,'z':3,
            'A':4,'B':4,'C':4,'D':4,'E':4,
            'F':4,'G':5,'H':5,'I':3,'J':5,
            'K':5,'L':4,'M':5,'N':5,'O':4,
            'P':4,'Q':4,'R':4,'S':4,'T':5,
            'U':4,'V':5,'W':5,'X':5,'Y':5,'Z':5,
            '░':8,',':2,'.':1,'!':1,'?':3,
            '&':3,'$':3,'#':5,'@':7,'[':2,
            '{':3,'}':3,'/':4,'\\':4,'=':3,
            '+':5,'-':3,'*':5,']':2,'\'':2,'"':3,
            '0':4,'1':3,'2':4,'3':4,'4':4,
            '5':4,'6':4,'7':4,'8':4,'9':4,
            '_':3,'~':4,'`':2,'|':1,'%':5,
            ':':1,';':2,'^':3,'<':3,'>':3,
            '©':8,'™':5,'(':3,')':3
          }
      };
}
