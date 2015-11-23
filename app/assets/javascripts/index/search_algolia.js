// Component responsible for displaying the search results
var SearchResultComponent = function ( cities ){
   this.cities = cities;
   this.container = $('#sidebar_content');
}

SearchResultComponent.prototype = {

   clear: function () {
      this.container.html("");
   },

   render: function ( cities ) {

      this.cities = cities;
      this.container.css('display','block');
      this.clear();
      this.displayCities( this.cities );
   },

   displayCity: function ( city ) {

      var country_code = city.country_code.toLowerCase();
      var search_result = $("<a class='search_results'> </a>")
      search_result.attr( "href", "/#map=9/"+ city._geoloc.lat + "/" + city._geoloc.lng );
      flag = $("<div class='flag'><img width='20px' src='http://lipis.github.io/flag-icon-css/flags/4x3/"+ country_code + ".svg'></div>")
      block = $("<div class='city'><p class='name'><b>"+ city._highlightResult.name.value +"</b></p><p class='country'>" + city.country + "</p>")
      flag.appendTo(search_result);
      block.appendTo(search_result);
      search_result.on('click', function ( e ){
         $('.query_wrapper input').val(city.name);
      });
      search_result.appendTo(this.container);

   },

   displayCities: function ( cities ) {
      if (cities.length == 0 ) {
         this.displayNoResults();
         return;
      }

      cities.forEach(  function ( city ){
         this.displayCity( city );
      }.bind(this))
   },

   displayNoResults: function (){
      this.container.html("<div class='search_results'> <div class='noresults'>No city found...</div></div>")
   }
}

//initalizer for Algoliasearch
var SearchProxy = function ( ){
   this.client = algoliasearch('3OGRF9NUBE', '1760f1ce147927dfcbe506dc64a822a3');
   this.index = this.client.initIndex('cities_v1');
}

SearchComponent = function ( resultComponent ){

   this.resultComponent = resultComponent;
   this.search_input = $('.query_wrapper input');
   this.pin = $('.query_wrapper .pin');
   this.geolocation = false;
   this.searchProxy = new SearchProxy();

}

SearchComponent.prototype = {

   init: function() {
      // Clear result on focus
      this.search_input.on('focus', function ( e ){
         this.resultComponent.clear();

      }.bind(this))

      // Auto complete search on keyup
      this.search_input.on('keyup', function( e ) {
         var query  = $(e.target).val();
         this.query = query;
         this.refresh();

      }.bind(this))
      
      this.pin.on('click',  function ( e ){
         this.toggleGeolocation();
         this.refresh();

      }.bind(this))

   },

   refresh: function (){
      this.search( this.query, this.geolocation );

      if ( !this.geolocation ) {
         this.pin.addClass('disabled');
      } else {
         this.pin.removeClass('disabled');
      }
   },

   search: function( query, geoloc ) {
      this.query = query;
      this.searchProxy.index.search(query,  { aroundLatLngViaIP: geoloc, hitsPerPage: 10, page: 0 }, function(err, hits) {
         this.resultComponent.render( hits.hits );
      }.bind(this));
   },

   toggleGeolocation: function (){
      this.geolocation = !this.geolocation
      this.refresh();

   }
}


$(document).ready( function ( ){

   var resultComponent = new SearchResultComponent()
   //var search = new SearchProxy();
   var searchComponent = new SearchComponent( resultComponent );
   searchComponent.init();
   


})
