const dotenv = require('dotenv');
const Twitter = require('twitter');
const fs = require('fs');

dotenv.config();

const client = new Twitter({
	consumer_key: process.env.TWITTER_API_KEY,
	consumer_secret: process.env.TWITTER_API_KEY_SECRET,
  	access_token_key: process.env.TWITTER_ACCESS_TOKEN,
 	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

function main(){
	const die = 20;
	const img_folder_path = "./img/"
	const horoscopes_path = "./horoscopes.json"

	const colors = {
		20: ["clear","purple","red"],
		6:	["white"],
	}
	const roll = rollD(20);
	const roll_pad	 = String(roll).padStart(2, '0');
	const image_path = img_folder_path+"d"+die+"_"+randChoice(colors[die])+"_"+roll_pad+".jpeg";

	var status_text = "";
	status_text += roll;
	status_text += '\n';

	fs.readFile(horoscopes_path, 'utf8', (error, data) => {
		if (error) {
			console.log("Error reading ",horoscopes_path);
		} else {
			const horoscopes = JSON.parse(data).rolls;
			status_text += randChoice(horoscopes[roll]);
			console.log(status_text);
			sendTweetWithImage(status_text, image_path);
		}
	});
}

function sendTweet(status_text){
	client.post('statuses/update', {status:status_text}, function(error, tweet, response) {
		if (error) {
			console.log(error);
		} else {
			console.log("success!\nStatus: ",status_text);
		}
	}); 
}

function sendTweetWithImage(status_text,image_path){
	const image_data = fs.readFileSync(image_path);
	client.post( 'media/upload', { media: image_data }, function ( error, media, response ) {
		if ( error ){
			console.log( 'media/upload error:', error );
		} else {
			const status = {
				status: status_text,
				media_ids: media.media_id_string
			}
			client.post( 'statuses/update', status, function( error, tweet, response) {
				if (error){
					console.log( 'statuses/update error:', error );
				}
				else{
					console.log( 'Success!' );
				}
			})
		}
	});
}

function randInt(min, max){
	return Math.floor(
		Math.random() * (max-min) + min
	)
}

function randChoice(list_choices) {
	var index = Math.floor(Math.random() * list_choices.length);
	return list_choices[index];
}

function rollD(die){
	return randInt(1,die+1);
}

main();
