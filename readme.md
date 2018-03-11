# OVH-FACT

This tool allow you to download all your OVH.com invoices.

## Installation

* You need Ruby 2.x.x and nodeJS 5.x.x
* Clone this repository and go to the cloned folder
* npm install

## Configuration

Go to [https://api.ovh.com/createToken/?GET=/me/*](https://api.ovh.com/createToken/?GET=/me/*) to generate new credentials.
Then create a .env file in your folder

````
APP_KEY     = "<YOUR APP KEY>"
APP_SECRET  = "<YOUR SECRET>"
CONSUMER_KEY= "<YOUR CONSUMER KEY>"
````


## Usage

* `node app.js > list.csv` will generate a list.csv file containing all your invoices (take some times)
* `ruby process.rb 2016` will export all 2016 invoices from the list.csv as PDF

## Todo

* Add date range to filter invoices export
