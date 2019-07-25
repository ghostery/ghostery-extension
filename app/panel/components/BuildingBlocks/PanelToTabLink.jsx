import React from 'react';
import { openFixedDestinationLinkInNewTab } from '../../utils/msg';

const PanelToTabLink = (props) => {
	const { href, label } = props;

	return (
		<a href={href} onClick={openFixedDestinationLinkInNewTab}>{label}</a>
	);
};

export default PanelToTabLink;
