# ostkit.js & express tutorial

## Getting Started

This is a tutorial for beginners. If you know a thing or two about programming you can skip to __Usage__ .

### 1) node.js
You need [node.js](https://nodejs.org/) to follow this tutorial. Please read [the install instructions first](https://nodejs.org/en/download/package-manager/)

### 2) preparation
Create a directory for your project ...
```bash
mkdir ostdemo
cd ostdemo
```

... then initialize [npm](npmjs.org) (just press enter at at all prompts)...
```bash
npm init
```

... and install the required packages.
```bash
npm install ostkit express --save
```

### 3) code
We need to write some JavaScript to work with ostkit.js. I recommend using [Visual Studio Code](https://code.visualstudio.com/) for JavaScript, but you can use any editor you like.

### 4) simple server
We will interact with OSt KIT through a web interface. That's why we installed express. express makes it easy to write web applications with node.js.

Our first server will not do much ...

```js
// app.js
const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(3000, () => console.log('Example app listening on port 3000!'))
```

... run your server ...
```bash
node app.js
```

... you can now point your browser to [http://localhost:3000](http://localhost:3000) and see your first web application. Unfortunately it is very static. No information from OST KIT yet.

### 5) connect OST KIT
Your [kit.ost.com console](https://kit.ost.com/) has a [tab labeled Developers](https://kit.ost.com/developer-api-console). You need to click on the "SHOW KEYS" Button to reveal your API credentials __!!DO NOT SHARE YOUR SECRET WITH ANYONE!!__.

Now update your app.js to look like this:

```js
// app.js
const express = require('express')
const app = express()

const Ostkit = require("ostkit");                             // tell node.js that you need ostkit.js
const ost=new Ostkit("YOUR_API_KEY", "YOUR_API_SECRET");      // initialize the API connection

app.get('/', (req, res) => {                                  // when URL is the root of your server
    ost.transactiontypesList().then((data) => {               // call /transaction-types/list method and...
        var result = "Your Token: "+data.client_tokens.name;  // write client_tokens.name to "result"
        res.send(result);                                     // and return "result" to the browser
    })  
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
```

... restart node (press [CTRL]+[C] to stop it) ...

```bash
node app.js
```

and go to to [http://localhost:3000](http://localhost:3000) again.

```
Your Token: Reward Token (RWD)
```

