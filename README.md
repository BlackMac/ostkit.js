# ostkit.js

[![Build Status](https://travis-ci.org/BlackMac/ostkit.js.svg?branch=master)](https://travis-ci.org/BlackMac/ostkit.js)

promise based client for [OST KIT](https://kit.ost.com)

## Installation

Using npm:

```bash
npm install ostkit --save
```

Using yarn:

```bash
yarn add ostkit --save
```

## Usage

Check out the [tutorial for beginners!](https://github.com/BlackMac/ostkit.js/blob/master/TUTORIAL.md)

List users
```js
var Ostkit=require("ostkit")

var ok = new Ostkit("YOUR_API_KEY", "YOUR_API_SECRET");

ok.usersList().then((res) => {
    console.log(res)
});
```

Create a user
```js
var Ostkit=require("ostkit")

var ok = new Ostkit("YOUR_API_KEY", "YOUR_API_SECRET");

ok.usersCreate({name: "Stefan"}).then((res) => {
    console.log(res)
}).catch((e) => {
    console.log("Err", e.response.data.err)
});
```

## Supported Methods

* __usersCreate__`({name})`
* __usersEdit__`({uuid, name})`
* __usersList__`({page_no = 1, filter = "all", order_by = "creation_time", order="desc"})`
* __usersAirdropDrop__`({amount, list_type})`
* __usersAirdropStatus__`({airdrop_uuid})`
* __transactiontypesCreate__`({name, kind, currency_type, currency_value, commission_percent})`
* __transactiontypesEdit__`({client_transaction_id, name, kind, currency_type, currency_value, commission_percent})`
* __transactiontypesList__`()`
* __transactiontypesExecute__`({from_uuid, to_uuid, transaction_kind})`
* __transactiontypesStatus__`({transaction_uuids})`

## FIRMAMENT

ostkit.js is part of my OST KIT⍺ Phase II Project [FIRMAMENT](http://firmamentbot.com) to support ostkit.js you can send donations (ETH or OST) to 0xacAAc9a6348D478B5c3512B7C06D6BB2620F963B