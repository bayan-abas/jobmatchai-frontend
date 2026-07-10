// This platform only ever serves Israel-based jobs (see backend externaljobs.import.country,
// always "il"), so a generic world-country filter was always effectively a single-option
// dead end. Israeli regions are what candidates actually think in when browsing local jobs.
export const ISRAELI_REGIONS = ["Tel Aviv", "Center", "Jerusalem", "Haifa", "North", "South"] as const;

export type IsraeliRegion = (typeof ISRAELI_REGIONS)[number];

// Best-effort geographic classification of ISRAELI_CITIES (utils/israeliCities.ts) into the
// region buckets above, using the common Israeli job-board grouping (Tel Aviv/Gush Dan split
// out from the wider Central district). Doesn't need to be authoritative/exhaustive - it only
// has to be good enough to make the region filter useful; getRegionForLocation() below falls
// back to loose keyword matching for city strings that aren't in this table at all.
const CITY_REGION: Record<string, IsraeliRegion> = {
  "Tel Aviv-Yafo": "Tel Aviv",
  "Ramat Gan": "Tel Aviv",
  "Givatayim": "Tel Aviv",
  "Bnei Brak": "Tel Aviv",
  "Holon": "Tel Aviv",
  "Bat Yam": "Tel Aviv",
  "Or Yehuda": "Tel Aviv",
  "Kiryat Ono": "Tel Aviv",
  "Azor": "Tel Aviv",
  "Savyon": "Tel Aviv",
  "Ramat HaSharon": "Tel Aviv",

  "Jerusalem": "Jerusalem",
  "Beit Shemesh": "Jerusalem",
  "Mevaseret Zion": "Jerusalem",
  "Maale Adumim": "Jerusalem",
  "Tzur Hadassah": "Jerusalem",
  "Ariel": "Jerusalem",
  "Efrat": "Jerusalem",
  "Beitar Illit": "Jerusalem",
  "Modiin Illit": "Jerusalem",

  "Haifa": "Haifa",
  "Kiryat Ata": "Haifa",
  "Kiryat Motzkin": "Haifa",
  "Kiryat Bialik": "Haifa",
  "Kiryat Yam": "Haifa",
  "Nesher": "Haifa",
  "Tirat Carmel": "Haifa",
  "Zichron Yaakov": "Haifa",
  "Binyamina": "Haifa",
  "Caesarea": "Haifa",
  "Pardes Hanna-Karkur": "Haifa",
  "Yokneam Illit": "Haifa",
  "Or Akiva": "Haifa",
  "Kiryat Tivon": "Haifa",
  "Hadera": "Haifa",
  "Daliyat al-Karmel": "Haifa",
  "Fureidis": "Haifa",
  "Jisr az-Zarqa": "Haifa",

  "Rishon LeZion": "Center",
  "Petah Tikva": "Center",
  "Netanya": "Center",
  "Rehovot": "Center",
  "Herzliya": "Center",
  "Kfar Saba": "Center",
  "Modiin-Maccabim-Reut": "Center",
  "Raanana": "Center",
  "Ramla": "Center",
  "Lod": "Center",
  "Yavne": "Center",
  "Hod HaSharon": "Center",
  "Rosh HaAyin": "Center",
  "Even Yehuda": "Center",
  "Kfar Yona": "Center",
  "Gan Yavne": "Center",
  "Nes Ziona": "Center",
  "Beer Yaakov": "Center",
  "Ganei Tikva": "Center",
  "Yehud-Monosson": "Center",
  "Tayibe": "Center",
  "Tira": "Center",
  "Baqa al-Gharbiyye": "Center",
  "Kfar Qasim": "Center",
  "Elad": "Center",
  "Kiryat Ekron": "Center",
  "Tirat Yehuda": "Center",
  "Shoham": "Center",
  "Gedera": "Center",
  "Kadima-Zoran": "Center",
  "Bet Dagan": "Center",
  "Rishpon": "Center",
  "Ganei Tal": "Center",
  "Mazkeret Batya": "Center",
  "Gan Yoshiya": "Center",
  "Kfar Shmaryahu": "Center",

  "Nazareth": "North",
  "Nahariya": "North",
  "Karmiel": "North",
  "Tiberias": "North",
  "Safed": "North",
  "Tzfat": "North",
  "Nof HaGalil": "North",
  "Migdal HaEmek": "North",
  "Kiryat Shmona": "North",
  "Maalot-Tarshiha": "North",
  "Acre": "North",
  "Umm al-Fahm": "North",
  "Sakhnin": "North",
  "Shfaram": "North",
  "Beit Shean": "North",
  "Nazareth Illit": "North",
  "Kfar Vradim": "North",
  "Katzrin": "North",
  "Rosh Pina": "North",
  "Afula": "North",
  "Ein Mahil": "North",
  "Reineh": "North",
  "Kafr Kanna": "North",
  "Iksal": "North",
  "Deir al-Asad": "North",
  "Julis": "North",
  "Peki'in": "North",
  "Beit Jann": "North",
  "Yirka": "North",

  "Beer Sheva": "South",
  "Ashdod": "South",
  "Ashkelon": "South",
  "Kiryat Gat": "South",
  "Eilat": "South",
  "Dimona": "South",
  "Sderot": "South",
  "Netivot": "South",
  "Ofakim": "South",
  "Arad": "South",
  "Yeruham": "South",
  "Mitzpe Ramon": "South",
  "Omer": "South",
  "Lehavim": "South",
  "Meitar": "South",
  "Rahat": "South",
  "Segev Shalom": "South",
  "Hura": "South",
  "Tel Sheva": "South",
  "Kiryat Malachi": "South",
};

const NORMALIZED_CITY_REGION: Record<string, IsraeliRegion> = Object.fromEntries(
  Object.entries(CITY_REGION).map(([city, region]) => [city.toLowerCase(), region])
);

// Loose keyword fallback for city strings from external providers that don't exactly match
// the curated list above (different transliteration, a district/area name instead of a city,
// or a Jobicy-style broad tag like "Israel"/"EMEA").
const REGION_KEYWORDS: [IsraeliRegion, string[]][] = [
  ["Tel Aviv", ["tel aviv", "gush dan", "yafo", "jaffa"]],
  ["Jerusalem", ["jerusalem", "al-quds"]],
  ["Haifa", ["haifa", "carmel", "krayot", "kiryot"]],
  ["North", ["north", "galilee", "galil", "golan", "upper nazareth"]],
  ["South", ["south", "negev", "arava", "eilat"]],
  ["Center", ["center", "central", "sharon", "shfela"]],
];

export function getRegionForLocation(...values: (string | null | undefined)[]): IsraeliRegion | null {
  for (const value of values) {
    if (!value) continue;
    const normalized = value.trim().toLowerCase();
    if (!normalized) continue;

    const exact = NORMALIZED_CITY_REGION[normalized];
    if (exact) return exact;

    for (const [city, region] of Object.entries(NORMALIZED_CITY_REGION)) {
      if (normalized.startsWith(city) || city.startsWith(normalized)) {
        return region;
      }
    }

    for (const [region, keywords] of REGION_KEYWORDS) {
      if (keywords.some((keyword) => normalized.includes(keyword))) {
        return region;
      }
    }
  }

  return null;
}

export function getRegionForCity(city?: string | null): IsraeliRegion | null {
  return getRegionForLocation(city);
}
