

const countries = [
    { name: 'Uganda', code: 'UG', dialCode: '+256' },
    { name: 'Kenya', code: 'KE', dialCode: '+254' },
    { name: 'Tanzania, United Republic of', code: 'TZ', dialCode: '+255' },
    { name: 'Rwanda', code: 'RW', dialCode: '+250' },
    { name: 'Burundi', code: 'BI', dialCode: '+257' },
    { name: 'South Sudan', code: 'SS', dialCode: '+211' },
    { name: 'Congo, The Democratic Republic of the', code: 'CD', dialCode: '+243' },
];

export async function getCountryList(): Promise<{name: string, code: string, dialCode: string}[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return countries;
}
