import React from 'react';

const onClick = () => {
	chrome.runtime.sendMessage({
		name: 'trigger_onboarding',
		message: null,
		origin: 'panel',
	});
	window.close();
};

export default ({	isEnabled, children }) => {
	if (!isEnabled) {
		return children;
	}
	return (
		<div className="OnboardingCover">
			{children}
			<div className="Cover">
				<div className="Background" />
				<div className="Foreground">
					<h1>Ghostery disabled:</h1>
					<button type="button" onClick={onClick}>Enable</button>
				</div>
			</div>
		</div>
	);
};
