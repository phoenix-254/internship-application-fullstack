addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request));
})

async function handleRequest(request) {
	// The URL to hit - given in the problem statement
	const url = 'https://cfw-takehome.developers.workers.dev/api/variants';
	
	let variants = await (await (await fetch(url)).json()).variants;

	let variantIndex = getPageVariant(request);
	
	let response = await fetch(variants[variantIndex]);

	response = new Response(response.body, response);
	response.headers.set('Set-Cookie', 'variant=' + variantIndex);
	
	return getCustomRewriter().transform(response);
}

// Returns the variant of the page to be loaded. Use cookies if saved else return random index.
function getPageVariant(request) {
	let cookies = request.headers.get('Cookie');
	if (cookies && cookies.includes('variant')) {
		if(cookies.includes('variant=0')) return 0;
		else if(cookies.includes('variant=1')) return 1;
	}
	
	return getRandomPageVariant();
}

// Returns random index (0 or 1).
function getRandomPageVariant() {
	return Math.floor(Math.random() * 10) % 2;
}

function getCustomRewriter() {
	let htmlRewriter = new HTMLRewriter();
	
	htmlRewriter
	.on('title', {
		element(element) {
			element.setInnerContent('Thank You!');
		}
	})
	.on('h1#title', {
		element(element) {
			element.setInnerContent('Thank You Cloudflare!');
		}
	})
	.on('p#description', {
		element(element) {
			element.setInnerContent('Thank you giving us an opportunity to showcase our skills and standing for us in this tough crisis situation. :)');
		}
	})
	.on('a#url', {
		element(element) {
			element.setInnerContent('Click here to know more.');
			element.setAttribute("href", 'https://blog.cloudflare.com/cloudflare-doubling-size-of-2020-summer-intern-class/');
		}
	});
	
	return htmlRewriter;
}