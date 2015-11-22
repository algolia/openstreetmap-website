namespace "algolia" do
  desc "Index cities in algolia"
  task :index  do

    # init Algolia
    Algolia.init(
      :application_id => "XXXXXXXXXXX",
      :api_key        => "XXXXXXXXXXXXXXXXXXXXX"
    )
    index = Algolia::Index.new("cities")

    # init Cities gem
    Cities.data_path = '~/Tmp/cities'

    # fetching countries code from xml
    countries = File.open("config/countries.xml") { |f| Nokogiri::XML(f) }
    countries = countries.xpath('//country').map do |country|
      {
        code: country.at_xpath('countryCode').content,
        name: country.at_xpath('countryName').content
      }
    end

    # indexing cities in algolia
    countries.each do |country|

      p ""
      p "###################################"
      p "Indexing county: #{country[:name]}"
      p "###################################"
      p ""

      Cities.cities_in_country(country[:code])
      .each_slice(1000) do |batch|

        cities = batch.map do |city|
          # get city Object
          city = city.last

          {
            name: city.name,
            country: country[:name],
            country_code: country[:code],
            population: city.population,
            _geoloc: {
              lat: city.latitude,
              lng: city.longitude
            }

          }
        
        end

        p "Indexing 1000"
        index.add_objects(cities)


      end
    end
  end
end
