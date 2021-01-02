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
            x: 150,
            y: 110,
            facing: 'W'
        }
    },
    padding: {
      top: 10,
      bottom: 0,
      left: 0,
      right: 0
    },
    thing: [
      {
        top: 139,
        left: 102,
        width: 5,
        height: 5,
        click: function(font, scene, context) {
          say([{text: 'Hi Terry!', align: 'E'},
               {text: 'Hi Cathy.', align: 'W'},
               {text: 'Nice day for a quest!', align: 'E'},
               {text: 'It\'s always a nice day for treasure hunting.' , align: 'W'}],
              font, scene, context);
        }
      },
      {
        top: 45,
        left: 233,
        width: 40,
        height: 22,
        click: function(font, scene, context) {
          say([{text: 'Off in the distance you see a castle. Perhaps you can find out what land you are now on.', align: 'C'}],
              font, scene, context);
        }
      }
    ]
  };
}
