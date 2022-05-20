# OVH-FACT

This tool allow you to download all your OVH.com invoices.

## Installation

- Clone this repository and go to the cloned folder
- pnpm install

## Configuration

Go to [https://api.ovh.com/createToken/?GET=/me/\*](https://api.ovh.com/createToken/?GET=/me/*) to generate new credentials.

Only the following routes are needed:

- /me/bill
- /me/bill/\*

Then create a .env file in your folder

```
APP_ENDPOINT = "<YOUR APP ENDPOINT>"
APP_KEY     = "<YOUR APP KEY>"
APP_SECRET  = "<YOUR SECRET>"
CONSUMER_KEY= "<YOUR CONSUMER KEY>"
```

### About endpoints

- OVH Europe: ovh-eu (default)
- OVH North-America: ovh-ca
- RunAbove: runabove-ca
- SoYouStart Europe: soyoustart-eu
- SoYouStart North-America: soyoustart-ca
- Kimsufi Europe: kimsufi-eu
- Kimsufi North-America: kimsufi-ca

## Usage

You might want to edit our script, since the upload part is not yet decoupled.

- node index.js
