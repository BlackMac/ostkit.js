var Ostkit=require("../index.js")

var ok = new Ostkit("", "");

ok.usersCreate({name: "Stefan"}).then((res) => {
    console.log(res)
}).catch((e) => {
    console.log("Err", e.response.data.err)
});