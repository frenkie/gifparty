# gifparty

Combines Gifs from [Giphy](http://giphy.com) and sounds from your PC's inputs into an
epic and eclectic party visualizer.

## installation

Do an `npm install`. Get an API key from https://developers.giphy.com/. 
We'll be using the v1 API which is still in use.

Copy `config.example.json` to `config.json` and put the key in the right property.

```json
  "settings": {
    "giphyApiKey": "your_key"
  },
```

Run `npm run debug` to get a self restarting server that serves a home page,
visualizer and remote on [localhost:8080](http://localhost:8080)