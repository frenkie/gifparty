var GifSource = function ( tag, quality ) {

    this.active = false;

    this.MIN_GIF_PRELOAD = 4;
   	this.MAX_GIF_PRELOAD_BATCH_COUNT = 4;
   	this.MAX_GIF_COUNT = 15;
    this.FETCH_REFRESH_TIMEOUT = 30000;
    this.QUALITY_LOW = 'low';
    this.QUALITY_HIGH = 'high';

    this.tag = tag;
    this.quality = quality || this.QUALITY_LOW;

    this.data = null;
    this.ready = false;
   	this.gifs = [];

    this.searchOffset = 0;
   	this.searchTotal = 0;

    this.preloadCount = 0; // including gifs with errors

    //this.update();
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

        this.lastFetch = Date.now();

        console.log( '(re)fetching GIFs for '+ this.tag );

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

        var preloadBatchCount = 0;

        console.log( 'preloading GIFs for '+ this.tag +', current amount: '+ this.gifs.length );

        this.preloadCount = 0;

        if ( this.active && this.gifs.length < this.MAX_GIF_COUNT ) {
            for ( var index in this.data ) {

                preloadBatchCount++;

                this.preloadGif(
                        this.data[ index ]
                            .images[ this.quality === this.QUALITY_HIGH ? 'original' : 'fixed_height' ]
                            .url
                );

                delete this.data[ index ];

                if ( preloadBatchCount >= this.MAX_GIF_PRELOAD_BATCH_COUNT ) {
                    break;
                }
            }
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

            this.preloadCount++;

            if ( this.preloadCount === this.MAX_GIF_PRELOAD_BATCH_COUNT ) {
                this.preloadGifs();
            }

        }.bind( this ) );

       	img.addEventListener( 'error', function () {

            this.preloadCount++;

            if ( this.preloadCount === this.MAX_GIF_PRELOAD_BATCH_COUNT ) {
                this.preloadGifs();
            }

       	}.bind( this ) );

       	img.src = url;
    },

    setActive: function ( to ) {
        this.active = to;

        if ( this.active ) {

            this.fetch().then( this.preloadGifs.bind( this ) );

        } else {
            // clear images from memory
            console.log( 'clearing images from memory for tag '+ this.tag );

            this.data = null;
            this.ready = false;

            this.searchOffset = 0;
           	this.searchTotal = 0;

            this.preloadCount = 0;

            this.gifs.forEach( function ( image ) {
                image = null;
            });

            this.gifs = [];
        }
    },

    update: function () {
        requestAnimationFrame( this.update.bind( this ) );

        if ( Date.now() - this.lastFetch >= this.FETCH_REFRESH_TIMEOUT  ) {
            this.lastFetch = Date.now();

            if ( this.active ) {
                this.fetch().then( this.preloadGifs.bind( this ) );
            }
        }
    }
};