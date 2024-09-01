# dump sql schema
sudo mysql < schema.sql

# run the software-collections' system test
sudo npm test

# enable the software-collections' system with pm2
sudo pm2 start npm --name "Software-Collections" -i 1 -- start # start with cluster mode and with one app
echo -e "\ncurrent pm2 list"
sudo pm2 list
