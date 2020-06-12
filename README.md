# MessengerUp™ 

Client user interface to build user specifications, and translate them to full functioning directed conversation dialog applications ready for deployment.

### REQUIREMENTS

Please create a `.env` file, key `MODE` is used in this application to determine the environment, which is also utilized to map the keys in a `.secrets.json` file that is also necessary.

* .env
```
DEBUG=client:*
MODE=DEV
```

* .secrets.json
```
{
	"EMAIL": {
		"DEV": "",
		"PROD": ""
	},
	"SES": {
			"AWS_KEY": "", 
			"AWS_SECRET": "", 
			"AWS_REGION": ""
	},
	"STRIPE": {
		"DEV": {
			"PUBLIC": "",
			"PRIVATE": "",
			// create products, add "price" id, and remove this comment
			"PRICE": {
				"PREMIUM": "",
				"ENHANCED": "",
				"BASIC": "",
				"DOWNLOAD": ""
			}
		},
		"PROD": {
			"PUBLIC": "",
			"PRIVATE": "",
			"PRICE": {
				"PREMIUM": "",
				"ENHANCED": "",
				"BASIC": "",
				"DOWNLOAD": ""
			}
		}
	},
	"URL": {
		"DEV": "http://localhost:$PORT",
		"PROD": ""
	},
	"DEPLOY": {
		"DEV": {
			"PATH": "/Users/rexfatahi/Desktop/ae/deploys",
			"NGINX": "/Users/rexfatahi/Desktop/ae"
		},
		"PROD": {
			"PATH": "PATH TO CONF FILES",
			"NGINX": "PATH TO CONF FILES"
		}
	},
	"MONGO_PROD": "CONNECTION URI",
	"MONGO_DEV": "CONNECTION URI"
}
```

### LICENSE

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
