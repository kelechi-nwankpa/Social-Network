const express = require("express");
const app = express();
const mongoose = require("mongoose");
const {MONGOURI} = require('./valuekeys.js')
const PORT = 5000;

//       OR
// require("./models/user")

// app.use(express.json())
// app.use(require("./routes/authen"))
// app.use(require('./routes/post.js'))
// app.use(require('./routes/user.js'))


mongoose.connect(MONGOURI);

mongoose.connection.on('connected', () => {
    console.log("We are connected to the Mongo DB server")
})

mongoose.connection.on('error', () => {
    console.log("We are not connected to the Mongo DB server")
})



require("./models/user.js");
require("./models/post");

const authen = require('./routes/authen.js') //always make sure the require model is above the route dependencies
const post = require('./routes/post.js')
const user = require('./routes/user.js')

app.use(express.json())
app.use(authen);
app.use(post);
app.use(user);

//EWCfVNreMgOs5EzU MongoDB password


app.get('/', (req, res) => {
    res.send("Hello World");
})

app.listen(PORT, () =>  {
    console.log("Server is running at",PORT)
})