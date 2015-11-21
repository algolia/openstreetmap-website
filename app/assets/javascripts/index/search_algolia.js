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
      search_result.attr( "href", "#map=7/"+ city._geoloc.lat + "/" + city._geoloc.lng );
      flag = $("<div class='flag'><img width='20px' src='http://lipis.github.io/flag-icon-css/flags/4x3/"+ country_code + ".svg'></div>")
      block = $("<div class='city'><p class='name'><b>"+ city.name +"</b></p><p class='country'>" + city.country + "</p>")
      flag.appendTo(search_result);
      block.appendTo(search_result);
      search_result.appendTo(this.container);
   },

   displayCities: function ( cities ) {

      cities.forEach(  function ( city ){
         this.displayCity( city );
      }.bind(this))
   }
}

//initalizer for Algoliasearch
var SearchProxy = function ( ){
   this.client = algoliasearch('F7SOH92SLF', '073e04ff24420c3b1e97c0ecea951392');
   this.index = this.client.initIndex('cities');
}


$(document).ready( function ( ){

   var ResultComponent = new SearchResultComponent()
   var search = new SearchProxy();

   var search_input =  $('.query_wrapper input');

   // Clear result on focus
   search_input.on('focus', function ( e ){
      Component.clear();

   })

   // Auto complete search on keyup
   search_input.on('keyup', function( e ) {
      var query  = $(e.target).val();

      search.index.search(query,  { hitsPerPage: 10, page: 0 }, function(err, hits) {
         ResultComponent.render( hits.hits );
      });
   })

})
