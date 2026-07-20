/* ------------------------------------------------------------------ */
/*  Worldwide Country → State/Region → City data                      */
/* ------------------------------------------------------------------ */

export interface City {
  name: string;
  lat: number;
  lng: number;
}

export interface State {
  name: string;
 cities: City[];
}

export interface Country {
  code: string;
  name: string;
  namePt: string;
  nameEs: string;
  nameFr: string;
  flag: string; // emoji flag
  states: State[];
}

export const countries: Country[] = [
  {
    code: "US",
    name: "United States",
    namePt: "Estados Unidos",
    nameEs: "Estados Unidos",
    nameFr: "États-Unis",
    flag: "🇺🇸",
    states: [
      { name: "California", cities: [
        { name: "San Francisco", lat: 37.77, lng: -122.42 },
        { name: "Los Angeles", lat: 34.05, lng: -118.24 },
        { name: "San Diego", lat: 32.72, lng: -117.16 },
        { name: "San Jose", lat: 37.34, lng: -121.89 },
      ]},
      { name: "New York", cities: [
        { name: "New York City", lat: 40.71, lng: -74.01 },
        { name: "Buffalo", lat: 42.89, lng: -78.86 },
        { name: "Albany", lat: 42.65, lng: -73.76 },
      ]},
      { name: "Texas", cities: [
        { name: "Houston", lat: 29.76, lng: -95.37 },
        { name: "Austin", lat: 30.27, lng: -97.74 },
        { name: "Dallas", lat: 32.78, lng: -96.80 },
        { name: "San Antonio", lat: 29.42, lng: -98.49 },
      ]},
      { name: "Florida", cities: [
        { name: "Miami", lat: 25.76, lng: -80.19 },
        { name: "Orlando", lat: 28.54, lng: -81.38 },
        { name: "Tampa", lat: 27.95, lng: -82.46 },
        { name: "Jacksonville", lat: 30.33, lng: -81.66 },
      ]},
      { name: "Illinois", cities: [
        { name: "Chicago", lat: 41.88, lng: -87.63 },
        { name: "Springfield", lat: 39.78, lng: -89.65 },
      ]},
      { name: "Massachusetts", cities: [
        { name: "Boston", lat: 42.36, lng: -71.06 },
        { name: "Cambridge", lat: 42.36, lng: -71.08 },
      ]},
      { name: "Washington", cities: [
        { name: "Seattle", lat: 47.61, lng: -122.33 },
        { name: "Tacoma", lat: 47.25, lng: -122.44 },
      ]},
    ],
  },
  {
    code: "BR",
    name: "Brazil",
    namePt: "Brasil",
    nameEs: "Brasil",
    nameFr: "Brésil",
    flag: "🇧🇷",
    states: [
      { name: "São Paulo", cities: [
        { name: "São Paulo", lat: -23.55, lng: -46.63 },
        { name: "Campinas", lat: -22.91, lng: -47.06 },
        { name: "Santos", lat: -23.96, lng: -46.33 },
        { name: "Ribeirão Preto", lat: -21.18, lng: -47.81 },
        { name: "Sorocaba", lat: -23.50, lng: -47.46 },
      ]},
      { name: "Rio de Janeiro", cities: [
        { name: "Rio de Janeiro", lat: -22.91, lng: -43.17 },
        { name: "Niterói", lat: -22.88, lng: -43.10 },
        { name: "Petrópolis", lat: -22.52, lng: -43.18 },
      ]},
      { name: "Minas Gerais", cities: [
        { name: "Belo Horizonte", lat: -19.92, lng: -43.94 },
        { name: "Uberlândia", lat: -18.92, lng: -48.28 },
        { name: "Juiz de Fora", lat: -21.76, lng: -43.35 },
      ]},
      { name: "Paraná", cities: [
        { name: "Curitiba", lat: -25.43, lng: -49.27 },
        { name: "Londrina", lat: -23.31, lng: -51.16 },
        { name: "Maringá", lat: -23.42, lng: -51.94 },
      ]},
      { name: "Bahia", cities: [
        { name: "Salvador", lat: -12.97, lng: -38.51 },
 { name: "Feira de Santana", lat: -12.27, lng: -38.95 },
        { name: "Vitória da Conquista", lat: -12.91, lng: -41.01 },
      ]},
      { name: "Santa Catarina", cities: [
        { name: "Florianópolis", lat: -27.60, lng: -48.55 },
        { name: "Joinville", lat: -26.30, lng: -48.84 },
        { name: "Blumenau", lat: -26.92, lng: -49.07 },
      ]},
      { name: "Rio Grande do Sul", cities: [
        { name: "Porto Alegre", lat: -30.03, lng: -51.23 },
        { name: "Caxias do Sul", lat: -29.17, lng: -51.18 },
 { name: "Pelotas", lat: -31.77, lng: -52.34 },
      ]},
    ],
  },
  {
    code: "ES",
    name: "Spain",
    namePt: "Espanha",
    nameEs: "España",
    nameFr: "Espagne",
    flag: "🇪🇸",
    states: [
      { name: "Madrid", cities: [
        { name: "Madrid", lat: 40.42, lng: -3.70 },
        { name: "Alcalá de Henares", lat: 40.48, lng: -3.37 },
        { name: "Mostoles", lat: 40.32, lng: -3.87 },
      ]},
      { name: "Cataluña", cities: [
        { name: "Barcelona", lat: 41.39, lng: 2.17 },
        { name: "Tarragona", lat: 41.12, lng: 1.25 },
        { name: "Girona", lat: 41.98, lng: 2.82 },
        { name: "Lleida", lat: 41.62, lng: 0.63 },
      ]},
      { name: "Andalucía", cities: [
        { name: "Sevilla", lat: 37.39, lng: -5.98 },
        { name: "Málaga", lat: 36.72, lng: -4.42 },
        { name: "Granada", lat: 37.18, lng: -3.60 },
        { name: "Córdoba", lat: 37.89, lng: -4.78 },
      ]},
      { name: "Valencia", cities: [
        { name: "Valencia", lat: 39.47, lng: -0.38 },
        { name: "Alicante", lat: 38.35, lng: -0.48 },
      ]},
      { name: "País Vasco", cities: [
        { name: "Bilbao", lat: 43.26, lng: -2.93 },
 { name: "San Sebastián", lat: 43.32, lng: -1.98 },
      ]},
    ],
  },
  {
    code: "FR",
    name: "France",
    namePt: "França",
    nameEs: "Francia",
    nameFr: "France",
    flag: "🇫🇷",
    states: [
      { name: "Île-de-France", cities: [
        { name: "Paris", lat: 48.86, lng: 2.35 },
        { name: "Versalhes", lat: 48.80, lng: 2.12 },
        { name: "Boulogne-Billancourt", lat: 48.84, lng: 2.24 },
      ]},
      { name: "Auvergne-Rhône-Alpes", cities: [
        { name: "Lyon", lat: 45.76, lng: 4.84 },
        { name: "Grenoble", lat: 45.19, lng: 5.72 },
      ]},
      { name: "Provence-Alpes-Côte d'Azur", cities: [
        { name: "Marseille", lat: 43.30, lng: 5.37 },
        { name: "Nice", lat: 43.71, lng: 7.25 },
        { name: "Toulon", lat: 43.12, lng: 5.94 },
      ]},
      { name: "Occitanie", cities: [
        { name: "Toulouse", lat: 43.60, lng: 1.44 },
        { name: "Montpellier", lat: 43.61, lng: 3.88 },
      ]},
      { name: "Hauts-de-France", cities: [
        { name: "Lille", lat: 50.63, lng: 3.06 },
        { name: "Roubaix", lat: 50.69, lng: 3.17 },
      ]},
      { name: "Bretagne", cities: [
        { name: "Rennes", lat: 48.11, lng: -1.68 },
        { name: "Brest", lat: 48.39, lng: -4.49 },
      ]},
    ],
  },
  {
    code: "DE",
    name: "Germany",
    namePt: "Alemanha",
    nameEs: "Alemania",
    nameFr: "Allemagne",
    flag: "🇩🇪",
    states: [
      { name: "Bayern", cities: [
        { name: "Munich", lat: 48.14, lng: 11.58 },
        { name: "Nuremberg", lat: 49.45, lng: 11.08 },
        { name: "Augsburg", lat: 48.37, lng: 10.90 },
      ]},
      { name: "Berlin", cities: [
        { name: "Berlin", lat: 52.52, lng: 13.41 },
        { name: "Potsdam", lat: 52.40, lng: 13.07 },
      ]},
      { name: "Hamburg", cities: [
        { name: "Hamburg", lat: 53.55, lng: 9.99 },
      ]},
      { name: "Hessen", cities: [
        { name: "Frankfurt", lat: 50.11, lng: 8.68 },
        { name: "Wiesbaden", lat: 50.08, lng: 8.24 },
      ]},
      { name: "Nordrhein-Westfalen", cities: [
        { name: "Düsseldorf", lat: 51.23, lng: 6.78 },
        { name: "Cologne", lat: 50.94, lng: 6.96 },
        { name: "Dortmund", lat: 51.51, lng: 7.46 },
        { name: "Essen", lat: 51.45, lng: 7.01 },
      ]},
      { name: "Baden-Württemberg", cities: [
        { name: "Stuttgart", lat: 48.78, lng: 9.18 },
        { name: "Karlsruhe", lat: 48.79, lng: 8.41 },
      ]},
    ],
 },
 {
    code: "GB",
    name: "United Kingdom",
    namePt: "Reino Unido",
    nameEs: "Reino Unido",
    nameFr: "Royaume-Uni",
    flag: "🇬🇧",
    states: [
      { name: "England", cities: [
        { name: "London", lat: 51.51, lng: -0.13 },
        { name: "Manchester", lat: 53.48, lng: -2.24 },
        { name: "Birmingham", lat: 52.48, lng: -1.90 },
        { name: "Liverpool", lat: 53.41, lng: -2.98 },
        { name: "Bristol", lat: 51.46, lng: -2.59 },
        { name: "Leeds", lat: 53.80, lng: -1.55 },
      ]},
      { name: "Scotland", cities: [
        { name: "Edinburgh", lat: 55.95, lng: -3.19 },
        { name: "Glasgow", lat: 55.86, lng: -4.25 },
      ]},
      { name: "Wales", cities: [
        { name: "Cardiff", lat: 51.48, lng: -3.18 },
        { name: "Swansea", lat: 51.62, lng: -3.94 },
      ]},
    ],
  },
 {
    code: "CA",
    name: "Canada",
    namePt: "Canadá",
    nameEs: "Canadá",
    nameFr: "Canada",
    flag: "🇨🇦",
    states: [
      { name: "Ontario", cities: [
        { name: "Toronto", lat: 43.65, lng: -79.38 },
        { name: "Ottawa", lat: 45.42, lng: -75.70 },
        { name: "Mississauga", lat: 43.59, lng: -79.64 },
      ]},
      { name: "Quebec", cities: [
        { name: "Montreal", lat: 45.50, lng: -73.57 },
        { name: "Quebec City", lat: 46.81, lng: -71.21 },
      ]},
      { name: "British Columbia", cities: [
        { name: "Vancouver", lat: 49.28, lng: -123.12 },
        { name: "Victoria", lat: 48.43, lng: -123.37 },
      ]},
      { name: "Alberta", cities: [
        { name: "Calgary", lat: 51.05, lng: -114.07 },
        { name: "Edmonton", lat: 53.55, lng: -113.49 },
      ]},
    ],
  },
 {
    code: "AU",
    name: "Australia",
    namePt: "Austrália",
    nameEs: "Australia",
    nameFr: "Australie",
    flag: "🇦🇺",
    states: [
      { name: "New South Wales", cities: [
        { name: "Sydney", lat: -33.87, lng: 151.21 },
        { name: "Newcastle", lat: -32.93, lng: 151.78 },
      ]},
      { name: "Victoria", cities: [
        { name: "Melbourne", lat: -37.81, lng: 144.96 },
        { name: "Geelong", lat: -38.15, lng: 144.36 },
      ]},
      { name: "Queensland", cities: [
        { name: "Brisbane", lat: -27.47, lng: 153.03 },
        { name: "Gold Coast", lat: -28.02, lng: 153.40 },
      ]},
      { name: "Western Australia", cities: [
        { name: "Perth", lat: -31.95, lng: 115.86 },
      ]},
    ],
  },
 {
    code: "JP",
    name: "Japan",
    namePt: "Japão",
    nameEs: "Japón",
    nameFr: "Japon",
    flag: "🇯🇵",
    states: [
      { name: "Tokyo", cities: [
        { name: "Tokyo", lat: 35.68, lng: 139.69 },
        { name: "Yokohama", lat: 35.44, lng: 139.64 },
      ]},
      { name: "Osaka", cities: [
        { name: "Osaka", lat: 34.69, lng: 135.50 },
        { name: "Kyoto", lat: 35.01, lng: 135.77 },
 ]},
      { name: "Aichi", cities: [
        { name: "Nagoya", lat: 35.18, lng: 136.91 },
      ]},
      { name: "Hokkaido", cities: [
        { name: "Sapporo", lat: 43.06, lng: 141.35 },
      ]},
    ],
 },
 {
    code: "MX",
    name: "Mexico",
    namePt: "México",
    nameEs: "México",
    nameFr: "Mexique",
    flag: "🇲🇽",
    states: [
      { name: "Ciudad de México", cities: [
        { name: "Cidade do México", lat: 19.43, lng: -99.13 },
        { name: "Guadalajara", lat: 20.67, lng: -103.35 },
      ]},
      { name: "Nuevo León", cities: [
        { name: "Monterrey", lat: 25.69, lng: -100.32 },
      ]},
      { name: "Jalisco", cities: [
        { name: "Puerto Vallarta", lat: 20.65, lng: -105.23 },
      ]},
      { name: "Quintana Roo", cities: [
        { name: "Cancún", lat: 21.16, lng: -86.85 },
      ]},
    ],
  },
 {
    code: "IT",
    name: "Italy",
    namePt: "Itália",
    nameEs: "Italia",
    nameFr: "Italie",
    flag: "🇮🇹",
    states: [
      { name: "Lombardia", cities: [
        { name: "Milão", lat: 45.46, lng: 9.19 },
      ]},
      { name: "Lazio", cities: [
        { name: "Roma", lat: 41.90, lng: 12.50 },
      ]},
      { name: "Piemonte", cities: [
        { name: "Turim", lat: 45.07, lng: 7.69 },
      ]},
      { name: "Veneto", cities: [
        { name: "Veneza", lat: 45.44, lng: 12.32 },
      ]},
      { name: "Toscana", cities: [
        { name: "Florença", lat: 43.77, lng: 11.25 },
      ]},
    ],
 },
 {
    code: "PT",
    name: "Portugal",
    namePt: "Portugal",
    nameEs: "Portugal",
    nameFr: "Portugal",
    flag: "🇵🇹",
    states: [
      { name: "Lisboa", cities: [
        { name: "Lisboa", lat: 38.72, lng: -9.14 },
        { name: "Cascais", lat: 38.70, lng: -9.42 },
      ]},
      { name: "Porto", cities: [
        { name: "Porto", lat: 41.15, lng: -8.61 },
 },
      { name: "Algarve", cities: [
        { name: "Faro", lat: 37.02, lng: -7.93 },
        { name: "Albufeira", lat: 37.09, lng: -8.22 },
      ]},
    ],
  },
 {
    code: "NL",
    name: "Netherlands",
    namePt: "Holanda",
    nameEs: "Países Bajos",
    nameFr: "Pays-Bas",
    flag: "🇳🇱",
    states: [
      { name: "Noord-Holland", cities: [
        { name: "Amsterdam", lat: 52.37, lng: 4.90 },
        { name: "Haarlem", lat: 52.38, lng: 4.64 },
      ]},
      { name: "Zuid-Holland", cities: [
        { name: "Roterdã", lat: 51.92, lng: 4.48 },
        { name: "Haia", lat: 52.08, lng: 4.31 },
      ]},
 },
 },
 {
    code: "AR",
    name: "Argentina",
    namePt: "Argentina",
    nameEs: "Argentina",
    nameFr: "Argentine",
    flag: "🇦🇷",
    states: [
      { name: "Buenos Aires", cities: [
        { name: "Buenos Aires", lat: -34.60, lng: -58.38 },
        { name: "La Plata", lat: -34.92, lng: -57.95 },
      ]},
      { name: "Córdoba", cities: [
        { name: "Córdoba", lat: -31.42, lng: -64.18 },
 ]},
      { name: "Santa Fe", cities: [
        { name: "Rosario", lat: -32.95, lng: -60.64 },
      ]},
 ],
 },
 {
    code: "CL",
    name: "Chile",
    namePt: "Chile",
    nameEs: "Chile",
    nameFr: "Chili",
    flag: "🇨🇱",
    states: [
      { name: "Región Metropolitana", cities: [
        { name: "Santiago", lat: -33.45, lng: -70.67 },
        { name: "Valparaíso", lat: -33.05, lng: -71.62 },
      ]},
 },
  {
    code: "CO",
    name: "Colombia",
    namePt: "Colômbia",
    nameEs: "Colombia",
    nameFr: "Colombie",
    flag: "🇨🇴",
    states: [
      { name: "Bogotá D.C.", cities: [
        { name: "Bogotá", lat: 4.71, lng: -74.07 },
      ]},
      { name: "Antioquia", cities: [
        { name: "Medellín", lat: 6.25, lng: -75.56 },
      ]},
 },
 {
    code: "IN",
    name: "India",
    namePt: "Índia",
    nameEs: "India",
    nameFr: "Inde",
    flag: "🇮🇳",
    states: [
      { name: "Maharashtra", cities: [
        { name: "Mumbai", lat: 19.08, lng: 72.88 },
        { name: "Pune", lat: 18.52, lng: 73.86 },
      ]},
      { name: "Delhi", cities: [
        { name: "New Delhi", lat: 28.61, lng: 77.21 },
        { name: "Gurgaon", lat: 28.46, lng: 77.03 },
      ]},
      { name: "Karnataka", cities: [
        { name: "Bangalore", lat: 12.97, lng: 77.59 },
 },
      { name: "Tamil Nadu", cities: [
        { name: "Chennai", lat: 13.08, lng: 80.27 },
      ]},
    ],
 },
 {
    code: "AE",
    name: "UAE",
    namePt: "Emirados Árabes",
    nameEs: "Emiratos Árabes",
    nameFr: "Émirats Arabes Unis",
    flag: "🇦🇪",
    states: [
      { name: "Dubai", cities: [
        { name: "Dubai", lat: 25.20, lng: 55.27 },
        { name: "Abu Dhabi", lat: 24.45, lng: 54.65 },
      ]},
    ],
 },
 {
    code: "KR",
    name: "South Korea",
    namePt: "Coreia do Sul",
    nameEs: "Corea del Sur",
    nameFr: "Corée du Sud",
    flag: "🇰🇷",
    states: [
      { name: "Seul", cities: [
        { name: "Seul", lat: 37.57, lng: 126.98 },
        { name: "Incheon", lat: 37.46, lng: 126.70 },
      ]},
  },
 {
    code: "CN",
    name: "China",
    namePt: "China",
    nameEs: "China",
    nameFr: "Chine",
    flag: "🇨🇳",
    states: [
      { name: "Beijing", cities: [
        { name: "Pequim", lat: 39.90, lng: 116.41 },
        { name: "Shanghai", lat: 31.23, lng: 121.47 },
      ]},
      { name: "Guangdong", cities: [
        { name: "Cantão", lat: 23.13, lng: 113.26 },
        { name: "Shenzhen", lat: 22.54, lng: 114.06 },
      ]},
 },
 ];

export function getCountryName(country: Country, lang: Lang): string {
  switch (lang) {
    case "pt": return country.namePt;
    case "es": return country.nameEs;
    case "fr": return country.nameFr;
    default: return country.name;
  }
}
