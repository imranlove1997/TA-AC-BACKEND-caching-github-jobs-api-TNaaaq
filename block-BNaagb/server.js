const express = require('express');
const axios = require('axios');
const redis = require('redis');
const port = 4000;

const url = "https://swapi.dev/api/people/";

const app = express();
const client = redis.client(6379);

client.on('error', (err) => console.error(err));

app.get('/', (req, res) => {
    res.send('Welcome to Star Wars');
})

var cacheCheck = (req, res, next) => {
    const id = req.params.id;
    client.get(id, async (err, data) => {
        if(err) throw err;
        if(!data) return next();
        res.json({[id]: JSON.parse(data), info: 'server cache'});
    });
}

app.get('/people/:id', cacheCheck, async (req, res, next) => {
    const { id } = req.params;
    const character = await axios.get(url + id);
    client.setex(id, 600, JSON.stringify(character.data));
    res.json({[id]: character.data, info: 'api conection'});
});

app.listen(port, () => {
    try {
        console.log(`connect to : ${port}`)
    } catch (error) {
        console.error('connection error');
    }
})