module.exports = function(caption, items, cb) {
  var Menu = require('terminal-menu');
  var menu = Menu({width: 29, x: 4, y: 2});
  menu.reset();
  menu.write(caption + '\n');
  menu.write('-------------------------\n');

  for (var i = 0; i < items.length; i++) {
    menu.add(items[i]);
  }

  menu.on('select', function(label, index) {
    //menu.close();
    cb(index);
  });
  process.stdin.pipe(menu.createStream()).pipe(process.stdout);

  process.stdin.setRawMode(true);
  menu.on('close', function() {
    process.stdin.setRawMode(false);
    process.stdin.end();
  });

  return menu;
};
