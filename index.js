var request = require('./lib/request');
var Menu = require('./lib/menu');

var Deffered = require('./lib/waiter');

var fs = require('fs');

var config;

if (fs.existsSync('./config_d.json')) {
  config = JSON.parse(fs.readFileSync('./config_d.json'));
} else {
  config = JSON.parse(fs.readFileSync('./config.json'));
}

var TOKEN = config.token;

var images;
var image;
var droplets;
var droplet;
var zones;

var rebootDroplet = function(id) {
  request({
    url: 'droplets/' + id + '/actions',
    token: TOKEN,
    method: 'POST',
    data: {
      type: 'power_cycle'
    }
  }, function(d, c) {
    console.log('Rebooted');
  }, function(d) {
    console.log('Can\'t reboot');
    console.log(d);
  });
};

var createDroplet = function(zone, size) {
  request({
      url: 'droplets',
      token: TOKEN,
      method: 'POST',
      data: {
        name: config.dropletName,
        region: zone,
        size: size,
        image: image.id,
        ssh_keys: [],
        backups: false,
        ipv6: false,
        private_networking: false,
        user_data: ''
      }
    },
    /**
     * @param { {droplet: {id: number}}} r
     */
    function(r) {
      if (r !== undefined && r.id !== 'unprocessable_entity') {
        console.log('CREATED');
        setTimeout(function() {
          request({
              url: 'droplets/' + r.droplet.id,
              token: TOKEN,
              method: 'GET'
            },
            /**
             * @param { {droplet: {networks: {v4: Array.<{ip_address: string}>}}}} d
             */
            function(d) {
              console.log(d.droplet.networks.v4[0].ip_address);
            }, function(d) {
              console.log('Can\'t get new droplet data');
              console.log(d);
            });
          setTimeout(function() {
            rebootDroplet(r.droplet.id);
          }, 20000);
        }, 60000);
      } else {
        console.log('Some error on create');
        console.log(JSON.stringify(r));
      }
    }, function(d) {
      console.log('Can\'t create droplet');
      console.log(d);
    });

};

var dropletsDef = new Deffered();
var zonesDef = new Deffered();

dropletsDef.awaitDeferred(zonesDef);

request({
    url: 'droplets?page=1&per_page=10',
    token: TOKEN,
    method: 'GET'
  },
  /**
   * @param { {droplets: Array.<{}>}} d
   */
  function(d) {
    dropletsDef.callback(d);
  }, function(d) {
    console.log('Can\'t get droplet list');
    console.log(d);
  });

request({
    url: 'regions',
    token: TOKEN,
    method: 'GET'
  },
  function(d) {
    zonesDef.callback(d);
  }, function(d) {
    console.log('Can\'t get regions list');
    console.log(d);
  });

dropletsDef.addCallback(function(d) {
  droplets = d.droplets;
});
zonesDef.addCallback(function(d) {
  zones = d.regions;
});

dropletsDef.addCallback(function() {
  for (var i = 0; i < droplets.length; i++) {
    if (droplets[i].name === config.dropletName) {
      droplet = droplets[i];
      break;
    }
  }
  if (droplet !== undefined) {
      request({
        url: 'droplets/' + droplet.id,
        token: TOKEN,
        method: 'DELETE'
      }, function(d, c) {
        console.log(d);
        console.log(c);
        console.log('DELETED');
      }, function(d) {
        console.log(d);
        console.log('DELETED');
      });
  } else {
    request({
        url: 'images?page=1&per_page=10',
        token: TOKEN,
        method: 'GET'
      },
      /**
       * @param { {regions: Array.<string>}} d
       */
      function(d) {
        /**
         * @type { {regions: Array.<string>}}
         */
        images = d.images;
        var i;
        for (i = 0; i < images.length; i++) {
          if (images[i].name === config.imageName) {
            image = images[i];
            break;
          }
        }
        if (image !== undefined) {
          var names = [];
          var aZones = [];
          for (i = 0; i < image.regions.length; i++) {
            for (var j = 0; j < zones.length; j++) {
              if (image.regions[i] == zones[j].slug && zones[j].available) {
                names.push(zones[j].name);
                aZones.push(zones[j]);
              }
            }
          }
          var m = new Menu(
            'Select region',
            names,
            function(index) {
              m.close();
              var currentZone = aZones[index];

              var m2 = new Menu(
                'Select size',
                currentZone.sizes,
                function(index) {
                  m2.close();
                  createDroplet(currentZone.slug, currentZone.sizes[index]);
                }
              );
              m2.render();
            }
          );
          m.render();
        } else {
          console.log('Can\'t find image');
        }
      }, function(d) {
        console.log('Can\'t get image list');
        console.log(d);
      });
  }
});
