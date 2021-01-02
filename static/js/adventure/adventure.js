function getPosition(event, screen) {
  var bounds = screen.getBoundingClientRect();
  return {
     x: Math.floor(((event.clientX - bounds.left)/screen.clientWidth)*screen.width),
     y: Math.floor(((event.clientY - bounds.top)/screen.clientHeight)*screen.height)
  };
}
function hasCollided(position, thing) {
  return position.y >= thing.top &&
         position.y <= thing.top + thing.height &&
         position.x >= thing.left &&
         position.x <= thing.left + thing.width;
}
function clickClear(next) {
  return {
           top: 0,
           left: 0,
           width: 320,
           height: 200,
           click: function(font, scene, context) {
             drawScene(scene, context);
             scene.thing.shift();
             if(next) {
               next();
             }
           }
         };
}
function say(dialog, font, scene, context) {
  var message = dialog.shift();
  if(message) {
    drawScene(scene, context);
    drawMessage(message.text, message.align, font, scene, context);
    scene.thing.unshift(clickClear(function() {
      say(dialog, font, scene, context);
    }));
  }
}
function drawScene(scene, context) {
  var depth;
  for(depth = 0; depth < scene.layer.length; depth++) {
    context.drawImage(scene.layer[depth], 0, 0, 320, 200, 0, 0, 320, 200);
    if(scene.hero && scene.hero.layer == depth) {
      drawHero(scene.hero, context);
    }
  }
}
function drawHero(hero, context) {
  //Sprites are organized vertically:
  //East
  //West
  //South
  //North
  var x = 0, y = "EWSN".indexOf(hero.position.facing)*hero.height;
  context.drawImage(hero.image, x, y, hero.width, hero.height, hero.position.x, hero.position.y, hero.width, hero.height);
}
function drawBorder(frame, width, height, top, left, context) {
  var offsetX = top+frame.slice.left+frame.padding.x,
      offsetY = left+frame.slice.top+frame.padding.y;

  if(frame.hasOwnProperty('image')) {
      //Draw Frame
      //Top Left
      context.drawImage(frame.image, 0, 0,
                                     frame.slice.left, frame.slice.top,
                                     top, left,
                                     frame.slice.left, frame.slice.top);
      //Top
      context.drawImage(frame.image, frame.slice.left+1, 0,
                                     frame.slice.right-frame.slice.left-2, frame.slice.top,
                                     top+frame.slice.left, left,
                                     width+(frame.padding.x*2), frame.slice.top);
      //Top Right
      context.drawImage(frame.image, frame.slice.right, 0,
                                     frame.size.width-frame.slice.right, frame.slice.top,
                                     top+frame.slice.left+width+(frame.padding.x*2), left,
                                     frame.size.width-frame.slice.right, frame.slice.top);

      //Left
      context.drawImage(frame.image, 0, frame.slice.top+1,
                                     frame.slice.left, frame.slice.bottom-frame.slice.top-2,
                                     top, left+frame.slice.top,
                                     frame.slice.left, height+(frame.padding.y*2));

      //Right
      context.drawImage(frame.image, frame.slice.right, frame.slice.top+1,
                                     frame.size.width-frame.slice.right, frame.slice.bottom-frame.slice.top-1,
                                     top+frame.slice.left+width+(frame.padding.x*2), left+frame.slice.top,
                                     frame.size.width-frame.slice.right, height+(frame.padding.y*2));

      //Bottom Left
      context.drawImage(frame.image, 0, frame.slice.bottom,
                                     frame.slice.left, frame.size.height-frame.slice.bottom,
                                     top, left+height+frame.slice.top+(frame.padding.y*2),
                                     frame.slice.left, frame.size.height-frame.slice.bottom);
      //Bottom
      context.drawImage(frame.image, frame.slice.left+1, frame.slice.bottom+1,
                                     frame.slice.right-frame.slice.left-2, frame.size.height-frame.slice.bottom-1,
                                     top+frame.slice.left, left+height+frame.slice.top+(frame.padding.y*2)+1,
                                     width+(frame.padding.x*2), frame.size.height-frame.slice.bottom-1);
      //Bottom Right
      context.drawImage(frame.image, frame.slice.right, frame.slice.bottom,
                                     frame.size.width-frame.slice.right, frame.size.height-frame.slice.bottom,
                                     top+frame.slice.left+width+(frame.padding.x*2), left+height+frame.slice.top+(frame.padding.y*2),
                                     frame.size.width-frame.slice.right, frame.size.height-frame.slice.bottom);
  }
  if(frame.hasOwnProperty('fillStyle')) {
      //Draw Center
      context.fillStyle = frame.fillStyle;
      context.fillRect(top+frame.slice.left, left+frame.slice.top, width+(frame.padding.x*2), height+(frame.padding.y*2)+1);
  }
  return {x : offsetX, y: offsetY};
}

//Orientation
//NW | N | NE
//---+---+---
// W | C | E
//---+---+---
//SW | S | SE

function drawMessage(text, position, font, scene, context) {
    var offsetX,
        offsetY,
        corner = {x: scene.padding.left, y: scene.padding.top},
        lines = [],
        line = { words: [], size: 0},
        words = text.split(' '),
        l, w, c, word, i, widestLine = 0, currentLine;

    for(w = 0; w < words.length; w++) {
        word = {text: words[w], size: 0};
        for(c = 0; c < word.text.length; c++) {
            try {
                if(font.map.indexOf(word.text.charAt(c)) == -1) {
                    throw new Error('Unmapped char');
                }
                word.size += (font.widths[word.text.charAt(c)]+1);
            } catch(error) {
                word.size += font.widths['â–‘']+1;
            }
        }
        if(line.size+word.size < 220) {
            line.words.push(word);
            line.size += word.size;
        } else {
            lines.push(line);
            if(widestLine < line.size) {
                widestLine = line.size;
            }
            line = { words: [word], size: word.size };
        }
    }
    lines.push(line);
    for(l = 0; l < lines.length; l++) {
        currentLine = lines[l].size+((lines[l].words.length-1)*3);
        if(widestLine < currentLine) {
            widestLine = currentLine;
        }
    }

    switch(position) {
      case 'NW':
        //Default
        break;
      case 'N':
        corner.x = Math.floor((320-font.frame.width(widestLine))/2);
        corner.y = scene.padding.top;
        break;
      case 'NE':
        corner.x = 320-font.frame.width(widestLine)-font.frame.margin.right;
        break;
      case 'W':
        corner.y = Math.floor((200-font.frame.height(font.height(lines.length)))/2);
        break;
      case 'C':
        corner.y = Math.floor((200-font.frame.height(font.height(lines.length)))/2);
        corner.x = Math.floor((320-font.frame.width(widestLine))/2);
        break;
      case 'E':
        corner.y = Math.floor((200-font.frame.height(font.height(lines.length)))/2);
        corner.x = 320-font.frame.width(widestLine)-font.frame.margin.right;
        break;
      case 'SW':
        corner.y = 200-font.frame.height(font.height(lines.length))-scene.padding.bottom;
        break;
      case 'S':
        corner.y = 200-font.frame.height(font.height(lines.length))-scene.padding.bottom;
        corner.x = Math.floor((320-font.frame.width(widestLine))/2);
        break;
      case 'SE':
        corner.y = 200-font.frame.height(font.height(lines.length))-scene.padding.bottom;
        corner.x = 320-font.frame.width(widestLine)-font.frame.margin.right;
        break;
    }

    corner = drawBorder(font.frame, widestLine, font.height(lines.length), corner.x, corner.y, context);

    offsetX = corner.x;
    offsetY = corner.y;

    for(l = 0; l < lines.length; l++) {
        line = lines[l];
        for(w = 0; w < line.words.length; w++) {
            word = line.words[w];
            for(c = 0; c < word.text.length; c++) {
                try {
                    if(font.map.indexOf(word.text.charAt(c)) == -1) {
                      throw new Error('Unmapped char');
                    }
                    context.drawImage(font.image,
                                      font.map.indexOf(word.text.charAt(c))*font.charWidth, 0,
                                      font.widths[word.text.charAt(c)], font.charHeight,
                                      offsetX, offsetY,
                                      font.widths[word.text.charAt(c)], font.charHeight);
                    offsetX += (font.widths[word.text.charAt(c)]+1);
                } catch(error) {
                    context.drawImage(font.image,
                                      font.map.indexOf('â–‘')*font.charWidth, 0,
                                      font.widths['â–‘'], font.charHeight,
                                      offsetX, offsetY,
                                      font.widths['â–‘'], font.charHeight);
                    offsetX += (font.widths['â–‘']+1);
                }
            }
            offsetX += 3;
        }
        offsetX = corner.x;
        offsetY += font.lineHeight;
    }
}

function HeroEngine(astar) {
    var graphSettings = {
            size: 5,
            mid: 3
        },
        simplifyPath = function(start, complexPath, end) {
            var previous = complexPath[1],
                simplePath = [start, {x:(previous.y*graphSettings.size)+graphSettings.mid, y:(previous.x*graphSettings.size)+graphSettings.mid}],
                i, classification, previousClassification;
            for(i = 1; i < (complexPath.length - 1); i++) {
                classification = (complexPath[i].x-previous.x).toString()+':'+(complexPath[i].y-previous.y).toString();
                if(classification !== previousClassification) {
                    simplePath.push({x:(complexPath[i].y*graphSettings.size)+graphSettings.mid, y:(complexPath[i].x*graphSettings.size)+graphSettings.mid});
                } else {
                    simplePath[simplePath.length-1]={x:(complexPath[i].y*graphSettings.size)+graphSettings.mid, y:(complexPath[i].x*graphSettings.size)+graphSettings.mid};
                }
                previous = complexPath[i];
                previousClassification = classification;
            }
            simplePath.push(end);
            return simplePath;
        };
    return {};
}
