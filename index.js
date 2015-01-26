var request = require('./request');
var menu = require('./test');

var fs = require('fs');

var config = JSON.parse(fs.readFileSync('./config.json'));

var TOKEN = config.token;

var images;
var image;
var droplets;
var droplet;

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
    //console.log(d);
    //console.log(c);
  }, function(d) {
    console.log('Can\'t reboot');
    console.log(d);
  });
};

var createDroplet = function(zone) {
  request({
      url: 'droplets',
      token: TOKEN,
      method: 'POST',
      data: {
        name: config.dropletName,
        region: zone,
        size: '512mb', // todo
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

request({
    url: 'droplets?page=1&per_page=10',
    token: TOKEN,
    method: 'GET'
  },
  /**
   * @param { {droplets: Array.<{}>}} d
   */
  function(d) {
    droplets = d.droplets;
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
            //console.log(image.regions.join(' '));

            //menu.addDelimiter('-', 40, 'Select region');

            //for (i = 0; i < image.regions.length; i++) {
            //  menu.addItem(
            //    image.regions[i],
            //    (function(z) {
            //      return createDroplet.bind(this, z);
            //    })(image.regions[i])
            //  );
            //}

            //menu.start();
            var m = menu(
              'Select region',
              image.regions,
              function(index) {
                m.close();
                createDroplet(image.regions[index]);
              }
            );

          } else {
            console.log('Can\'t find image');
          }
        }, function(d) {
          console.log('Can\'t get image list');
          console.log(d);
        });


    }
  }, function(d) {
    console.log('Can\'t get droplet list');
    console.log(d);
  });
