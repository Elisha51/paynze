
const countries = [
    { name: 'Uganda', code: 'UG' },
    { name: 'Kenya', code: 'KE' },
    { name: 'Tanzania, United Republic of', code: 'TZ' },
    { name: 'Rwanda', code: 'RW' },
    { name: 'Burundi', code: 'BI' },
    { name: 'South Sudan', code: 'SS' },
    { name: 'Congo, The Democratic Republic of the', code: 'CD' },
];

export async function getCountryList(): Promise<{name: string, code: string}[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return countries;
}
