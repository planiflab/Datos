L.TileLayer.Argenmap = L.TileLayer.extend({
  /**
   * Constant: URL_HASH_FACTOR
   * {Float} Used to hash URL param strings for multi-WMS server selection.
   *         Set to the Golden Ratio per Knuth's recommendation.
   */
  IGN_CACHES : [
    'http://wms.ign.gob.ar/geoserver/gwc/service/tms/1.0.0'
  ],
  cache: null,
  initialize: function (options) {
    this.cache = new this.CacheDeCliente();
    this.options = L.Util.extend({}, this.options, options, {
      tms:true,
      attribution: ' Topónimos, datos topográficos - 2013  <a target="_blank" href="http://www.ign.gob.ar/argenmap/argenmap.jquery/docs/#datosvectoriales">IGN Argentina // Calles - OpenStreetMap</a>',
    });
    L.TileLayer.prototype.initialize.call(this, undefined, this.options);
  },
  getTileUrl: function( tilePoint ) {
    var baseURL = '',
      cached=false,
      zoom = this._getZoomForUrl();

      var tile = {
        x: tilePoint.x,
        y: tilePoint.y - 823
      };

    baseURL = this.selectURL(tile.x + '' + tile.y),
    cached = this.cache.recuperar(tile.x,tile.y,zoom);

    if(cached) {
      return cached;
    }
    var layerName = "capabaseargenmap@EPSG%3A3857@png";
    if (this.options.layer !== undefined) {
      layerName = this.options.layer;
    }
    var url = baseURL + "/" + layerName + "/" + zoom + "/" + tile.x + '/' + tile.y + ".png";
    this.cache.guardar(tile.x,tile.y,zoom,url);
    return url;
  },
  /**
   * Method: selectUrl
   * selectUrl() implements the standard floating-point multiplicative
   *     hash function described by Knuth, and hashes the contents of the
   *     given param string into a float between 0 and 1. This float is then
   *     scaled to the size of the provided urls array, and used to select
   *     a URL.
   *
   * Parameters:
   * paramString - {String}
   * urls - {Array(String)}
   *
   * Returns:
   * {String} An entry from the urls array, deterministically selected based
   *          on the paramString.
   */
  selectURL: function(paramString) {
    var product = 1,
      URL_HASH_FACTOR = (Math.sqrt(5) - 1) / 2,
      i,
      len,
      urls = this.IGN_CACHES;
    len = paramString.length;
    for (i = 0, len; i < len; i++) {
      product *= paramString.charCodeAt(i) * URL_HASH_FACTOR;
      product -= Math.floor(product);
    }
    return urls[Math.floor(product * urls.length)];
  },
  /**
   * Clase de cache interna de urls
   */
  CacheDeCliente : function()
  {
    this.MAX_TILES = 150;
    this.cache = [];
    this.cacheRef = {};

    /**
     * Recupera un tile de la cache.
     * Si no existe, devuelve false
     */
    this.recuperar = function(x, y, z)
    {
      var tilecode = x + '-' + y + '-' + z;

      if(this.cache.indexOf(tilecode) != -1)
      {
        return this.cacheRef[tilecode];
      }

      return false;
    };
    /**
     * Guarda una entrada en la cache interna
     * Si detecta baseURL como un string, anula el proceso,
     * no hace falta cachear si es un solo servidor de tiles
     */
    this.guardar= function(x, y, z, url)
    {
      if (typeof this.baseURL == 'string') {
        //si no tengo cache servers esto no sirve y no guardo nada
        return;
      }
      var tilecode = x + '-' + y + '-' + z;
      this.cache.push(tilecode);
      this.cacheRef[tilecode] = url;
      var sale;
      if(this.cache.length > this.MAX_TILES)
      {
         sale = this.cache.shift();
         // console.log('cache limit exceeded: ' + sale + ' borrado; url: ' + this.cacheRef[sale]);
         delete this.cacheRef[sale];
      }
      // console.log('cache set: ' + tilecode + ' guardada, ' + this.cache.length + ' tiles cacheadas');
    };

  }

})

L.tileLayer.argenmap = function(options){
  return new L.TileLayer.Argenmap(options);
};

