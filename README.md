#MessengerUp™ 
###automates the building of bots and organizes user accounts for the management and analysis of their bots.

#####Add the following files with format:

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

