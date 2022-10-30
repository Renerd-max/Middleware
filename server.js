const express = require('express');
const app = express();
const path = require('path');
const {logger} = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');
const PORT = process.env.PORT || 3500;

//we use app.use to use middleware. middleware are functions between the request and response method.
//the below built-in middle ware is used to handle form data. 

app.use(express.urlencoded({extended: false}));

//the below built-in middleware is used to handle JSON

app.use(express.json());

//the below built-in middleware is used to handle static files. e.g is images. Our static files needs to be in the public folder.

app.use(express.static(path.join(__dirname, '/public')));

//the below custom middleware logs activities to the log folder.
app.use(logger);

//Cross Origin Resource Sharing (Cors) allows your files accessible from third parties.
//first, to prevent access from unauthorized domains, you need to create a white list: Your website, your server, and your localhost. You should leave only your website url(s) after development.
const whitelist = ["https://www.yourdomainname.com", "https://yourdomainname.com", "http://yourdomainname.com", "http://127.0.0.1:5500", "http://localhost:3500"];
const corsOptions = {
    origin: (origin, callback) => {
        //remove "|| !origin" after development.

        if (whitelist.indexOf(origin) !== -1 || !origin ) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));

app.get('^/$|/index(.html)?', (req, res) => {
    //res.sendFile('./views/index.html', { root: __dirname });
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/new-page(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'new-page.html'));
});

app.get('/old-page(.html)?', (req, res) => {
    res.redirect(301, '/new-page.html'); //302 by default
});

// Route handlers
app.get('/hello(.html)?', (req, res, next) => {
    console.log('attempted to load hello.html');
    next()
}, (req, res) => {
    res.send('Hello World!');
});


// chaining route handlers
const one = (req, res, next) => {
    console.log('one');
    next();
}

const two = (req, res, next) => {
    console.log('two');
    next();
}

const three = (req, res) => {
    console.log('three');
    res.send('Finished!');
}

app.get('/chain(.html)?', [one, two, three]);

//wec can use app.all to specify all extension types because it accepts regular expression.
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({error: 'Page not found (404)'});
    } else {
        res.type('txt').send("404. Page not found");
    }
})

//custom middleware to handle error, instead of the default.

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));