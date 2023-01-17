const output = document.getElementById( 'output' ),
	copyButton = document.getElementById( 'js-copy' ),
	slug = document.getElementById( 'js-slug' ),
	templates = {
		daily: `What did you do today?
[output]

What will you do next?

Are there impediments?
None

Thank you.`
	};

const slugify = str =>
	str
		.toLowerCase()
		.trim()
		.replace( /[^\w\s-]/g, '' )
		.replace( /[\s_-]+/g, '-' )
		.replace( /^-+|-+$/g, '' );

function extractDaily () {
	if ( !document.querySelector( '.page-container' ) ) {
		return 'ERROR: Not in Harvest daily timesheet page!';
	}

	return [...document.querySelectorAll( '[class^="form-for _time-entry-item_"]' )].map( e => {
		let client = e.querySelector( '[class^="_project-link_"]' ).innerText.trim(),
			task = e.querySelector( '[class^="_service-name_"]' ).innerText.trim(),
			notes = e.querySelector( '[class^="_note-and-task_"]' ).innerText.trim();

		return ( task.indexOf( client ) === -1 ? client + ' ' : '' ) + task + ( notes ? ' (' + notes + ')' : '' );
	} ).join( '\r\n' );
}

window.onload = () => {
	chrome.tabs.query(
		{ active: true },
		function ( tabs ) {
			const { id: tabId } = tabs[0];

			chrome.scripting.executeScript(
				{
					target: { tabId: tabId },
					func: extractDaily,
				},
				( injectionResults ) => {
					if ( !injectionResults ) return;

					for ( const frameResult of injectionResults ) {
						output.value = templates.daily.replaceAll( '[output]', frameResult.result );
						output.style.display = 'block';
						copyButton.style.display = 'block';
					}
				}
			);
		}
	);
}

copyButton.addEventListener( 'click', ( e ) => {
	navigator.clipboard.writeText( output.value );

	copyButton.innerText = 'Copied!';
	const originalText = copyButton.innerText;

	setTimeout( () => copyButton.innerText = originalText, 1000 );
} );

slug.addEventListener( 'change', () => {
	slug.value = slugify( slug.value );
} );