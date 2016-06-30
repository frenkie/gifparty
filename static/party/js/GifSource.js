var GifSource = function ( tag ) {

    this.tag = tag;
    this.data = null;
    this.ready = false;
   	this.gifs = [];

    this.searchOffset = 0;
   	this.searchTotal = 0;

    this.MIN_GIF_PRELOAD = 5;
   	this.MAX_GIF_COUNT = 100;

    this.fetch().then( this.preloadGifs.bind( this ) );
};

GifSource.prototype = {

    displayRandomGif: function ( $container ) {

        var gif;

        if ( this.ready && this.gifs.length ) {

            gif = this.gifs[ Math.round( Math.random() * ( this.gifs.length-1 ) ) ];

            if ( gif && gif.src ) {

                $container[ 0 ].style.backgroundImage = "url('"+ gif.src +"')";
            }
        }
    },

    fetch: function () {

        var deferred = new $.Deferred();

        $.ajax({
            url: '/gifs/'+ this.tag +'?limit='+ this.MAX_GIF_COUNT +'&offset='+ this.searchOffset

        }).then(function ( data ) {
            if ( data && data.pagination.total_count >= this.MIN_GIF_PRELOAD ) {

                this.searchTotal = data.pagination.total_count;
                this.searchOffset += data.pagination.count;

                if(this.searchOffset >= this.searchTotal){
               		this.searchOffset = 0;
               	}

                this.data = data.data;

                deferred.resolve();

            } else {
                deferred.reject();
            }
        }.bind( this ), deferred.reject );

        return deferred.promise();
    },

    preloadGifs: function () {
        for ( var index in this.data ) {
            this.preloadGif( this.data[ index ].images.original.url );
        }
    },

    preloadGif: function ( url ) {

       	var img = new Image();

        img.addEventListener( 'load', function () {

            this.gifs.push( img );

            if( this.gifs.length > this.MAX_GIF_COUNT){
                this.gifs.shift();
            }

            this.ready = this.gifs.length >= this.MIN_GIF_PRELOAD;

        }.bind( this ) );

       	img.addEventListener( 'error', function () {

       	});

       	img.src = url;
    }
};