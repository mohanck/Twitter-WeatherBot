console.log('Twitter WeatherBot has started!');

var fs = require('fs');
var weather = require('openweathermap');
weather.defaults({units:'metric', lang:'en', mode:'json',appid:'660ae3342334692ca133a6145413ee11'});

var Twit = require('twit');

var config = require('./config.js');

var tweet = new Twit(config);

var stream = tweet.stream('statuses/filter',{ track: '@weatherProvider' });
stream.on('tweet',tweeted);

function tweeted(eventMsg){
	name = eventMsg.user.name
	reply_to = eventMsg.user.screen_name;
	split = eventMsg.text.split("-");
	fn   = split[1].split(":")[0].trim();
	city_name = split[1].split(":")[1].trim();

	switch(fn.toLowerCase()){
		case "weather":
			  			weatherInfo(city_name);
						break;
		//Add new features here!
	}
}

function weatherInfo(city_name){
	weather.now({q:city_name}, getWeatherData);
}

function getWeatherData(err, data){
	console.log(data);
	if(err){
		return console.log("getWeatherData -- "+err);
	}
    city_name 	= data.name;
    country 	= data.sys.country;
    description = data.weather[0].description;
    iconUrl 	= data.weather[0].iconUrl;
    min 		= data.main.temp_min;
    max 		= data.main.temp_max;
    avg 		= data.main.temp;

    text 		=  "All Temperatures in Fahrenheit" +"\r\n"
		         + "Average:"+ avg +"\r\n"
		         + "Minimum:"+ min +"\r\n"
		         + "Maximum:"+ max ;

     getWeatherIcon(iconUrl);
     postTweetsMedia();
}

function getWeatherIcon(iconUrl){
	var request = require('request').defaults({ encoding: null });
	request.get(iconUrl, writeImage);
}

function writeImage(err, res, body) {
	if(err){
		return console.log("writeImage -- "+err);
	}
    fs.writeFile('test.png',body,function(err)
		    		{
					    if(!err)
					    {
					    	console.log("The file was saved!");
					    }
					}
				);
}

function postTweetsMedia(){
  	var filename = 'test.png';
  	var params = {
  		encoding: 'base64'
  	};
  	var b64 = fs.readFileSync(filename,params);

  	tweet.post("media/upload",{media_data : b64},uploaded);
}

function uploaded(err,data,response){
	if(err){
		return console.log("uploaded -- "+err);
	}
	var mediaIdStr = data.media_id_string;
	text =".@"+reply_to+" Hey "+name+"! Here is today's "+fn+" data for "+city_name+","+country+"\r\n"+text;
	var params = {
		status : text,			 //"Uploading media",
		media_ids : [mediaIdStr] //Can upload upto 4 photos
	};
	console.log(text);
	tweet.post("statuses/update", params, postData);
}

function postData(err,data,response){
	if(err){
		return console.log("postData -- "+err);
	}
  	console.log(data.text);
}