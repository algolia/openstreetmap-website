require 'csv'

namespace "algolia" do
  desc "Index cities in algolia rake algolia:index data_path=path/to/cities"
  task index: [ :environment ] do

    # init Algolia
    Algolia.init(
      :application_id => "3OGRF9NUBE",
      :api_key        => "3936175635c47b4bd1add46baebd65f9"
    )
    index = Algolia::Index.new("cities_v2")

    data_path = ENV['data_path']
    # init Cities gem
    if( data_path.nil? )
      raise "Indexing failed: please specity data_path"
    end

    # fetching countries code from xml
    countries = File.open("config/countries.xml") { |f| Nokogiri::XML(f) }
    countries = countries.xpath('//country').map do |country|
      {
        code: country.at_xpath('countryCode').content,
        name: country.at_xpath('countryName').content
      }
    end

    buffer = []
    current_country_code = ""
    current_country_name = ""

    CSV.foreach(data_path, :encoding => 'windows-1251:utf-8', :quote_char => '@', :headers => true ) do |row|

      # csv file structure:
      # code,url-name,name,region,population,lat,lng

      next if row.header_row?

      # only find country if code changes from the previous line ( file is mostly ordered by country
      if  current_country_code != row[0].upcase

        current_country_code = row[0].upcase
        current_country_name  = countries.find{ |c| c[:code] == current_country_code }[:name] rescue current_country_code

        puts ""
        puts "###################################"
        puts "Indexing country: #{current_country_name}"
        puts "###################################"
        puts ""
      end


      city = {
          name: row[2],
          country: current_country_name,
          country_code: current_country_code,
          population: row[4].to_i,
          _geoloc: {
            lat: row[5],
            lng: row[6]
          }
      }

      if buffer.length < 1000
        buffer << city
      else
        p "Indexing 1000"
        index.add_objects(buffer)
        buffer = []
      end


    end

  end
end
