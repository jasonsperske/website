function Scene(loader, assets) {
  return {
    layer: [
        loader.addImage(assets+'/layer-0.png'),
        loader.addImage(assets+'/layer-1.png')
    ],
    interaction: [
        loader.addImage(assets+'/click-0.png'),
        loader.addImage(assets+'/click-1.png')
    ],
    hero: {
        image: loader.addImage(assets+'/hero.png'),
        height: 33,
        width: 12,
        frames: 6,
        layer: 0,
        position: {
            x: 180,
            y: 120,
            facing: 'N'
        }
    },
    image: loader.addImage(assets+'/background.png'),
    padding: {
      top: 9,
      bottom: 24,
      left: 0,
      right: 0
    },
    thing: [
      {
        top: 57,
        left: 110,
        width: 15,
        height: 20,
        click: function(font, scene, context) {
          say([{text: 'Hey! How did you find me?', align: 'C'},
               {text: 'I think they played King\'s Quest III', align: 'SW'},
               {text: 'HEY GWYDION! If you aren\'t making my lunch RIGHT NOW you are going to get IT!', align: 'E'},
               {text: 'You think now is a good time to start making that cookie', align: 'C'}],
              font, scene, context);
        }
      }
    ]
  };
}
