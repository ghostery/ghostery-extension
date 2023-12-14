import fs from 'node:fs';
import path from 'node:path';

describe('locales', () => {
	describe('extension name', () => {
		const localesPath = path.join('.', '_locales');
		const locales = fs.readdirSync(localesPath, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name);

		for (const locale of locales) {
			it(`extension name for locale "${locale}" is too long`, () => {
				const translations = JSON.parse(fs.readFileSync(path.join(localesPath, locale, 'messages.json'), { encoding: 'utf8' }));
				expect(translations.name.message.length).toBeLessThanOrEqual(45);
			});
		}
	});
});
