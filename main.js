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

	tweetRoll(colors);
}

// Generates and sends a tweet based on a die and pictures of the die
function tweetRoll(colors, die=20, img_folder_path="./img/", horoscopes_path="./horoscopes.json"){
	const roll = rollD(die);
	const roll_pad	 = String(roll).padStart(2, '0');
	const image_path = img_folder_path+"d"+die+"_"+randChoice(colors[die])+"_"+roll_pad+".jpeg";

	var status_text = "Today's roll: ";
	status_text += roll;
	status_text += '\n';

	fs.readFile(horoscopes_path, 'utf8', (error, data) => {
		if (error) {
			console.log("Error reading ",horoscopes_path);
		} else {
			const horoscopes = JSON.parse(data).rolls;
			status_text += randChoice(horoscopes[roll]);
			console.log(status_text);
			console.log(roll, image_path);
			sendTweetWithImage(status_text, image_path);
		}
	});
}

// Send a tweet with just text
function sendTweet(status_text){
	client.post('statuses/update', {status:status_text}, function(error, tweet, response) {
		if (error) {
			console.log(error);
		} else {
			console.log("success!\nStatus: ",status_text);
		}
	}); 
}

// Send a tweet with text and an image
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

// Returns a random integer that is at least the min value and less than the max value
function randInt(min, max){
	return Math.floor(
		Math.random() * (max-min) + min
	)
}

// Returns a randomly chosen value from a list
function randChoice(list_choices) {
	var index = Math.floor(Math.random() * list_choices.length);
	return list_choices[index];
}

// Returns a random die value based on the highest possible roll (d20 = rollD(20))
function rollD(die){
	return randInt(1,die+1);
}

main();
