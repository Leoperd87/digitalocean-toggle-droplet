#digitalocean-toggle-droplet
Create or destroy droplet on DigitalOcean from image

#Usage
Setup your DigitalOcean API token (you can find or create it [here]), droplet name and [image name] in `config.json` file
And then:
```sh
npm install
node ./index.js
```
If droplet with this name exist it would be removed.

If droplet didn't exist it would be created.

[here]:https://cloud.digitalocean.com/settings/applications
[image name]:https://cloud.digitalocean.com/images
