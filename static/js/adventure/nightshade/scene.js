function Scene(loader, assets) {
  return {
    image: loader.addImage(assets+'/background.png'),
    layer: [loader.addImage(assets+'/layer-0.png')],
    interaction: [],
    hero: {
        image: loader.addImage(assets+'/hero.png'),
        height: 33,
        width: 12,
        frames: 6,
        layer: 0,
        position: {
            x: 70,
            y: 65,
            facing: 'S'
        }
    },
    padding: {
      top: 9,
      bottom: 24,
      left: 0,
      right: -16
    },
    thing: [
      {
        top: 46,
        left: 141,
        width: 20,
        height: 50,
        click: function(font, scene, context) {
          say([{text: 'Oh, that\'s easy - you just fire the staff of Ra..', align: 'SW'},
               {text: 'No! Whoops!', align: 'SW'},
               {text: 'Darn, Darn, Darn!', align: 'SW'},
               {text: 'You realize you picked a terrible day to quit huffing glue...', align: 'S'}],
              font, scene, context);
        }
      },
      {
        top: 61,
        left: 175,
        width: 18,
        height: 40,
        click: function(font, scene, context) {
          say([{text: 'Gosh! A puddle of water! (Eww - It\'s got things living in it!)', align: 'S'}],
              font, scene, context);
        }
      }
    ]
  };
}
