const output = document.getElementById( 'output' ),
	copyButton = document.getElementById( 'js-copy' ),
	templates = {
		daily: `What did you do today?
[output]

What will you do next?

Are there impediments?
None

Thank you.`
	};

function extractDaily () {
	if ( !document.querySelector( '.time-day-entry-forms__time-table' ) ) {
		return 'ERROR: Not in Harvest daily timesheet page!';
	}

	return [...document.querySelectorAll( '.time-day-entry-forms__time-table .time-entry-item-form' )].map( e => {
		let client = e.querySelector( '.time-entry-item-form__project-link' ).innerText.trim(),
			task = e.querySelector( '.time-entry-item-form__service-name' ).innerText.trim(),
			notes = e.querySelector( '.time-entry-item-form__note-field' ).innerText.trim();

		return ( task.indexOf( client ) === -1 ? client + '\n' : '' ) + task + ( notes ? ' (' + notes + ')' : '' );
	} ).join( '\r\n\r\n' );
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
