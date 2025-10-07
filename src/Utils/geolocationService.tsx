// geolocationService.ts

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationDetails {
  address: string;
  city?: string;
  postalcode?: string;
  country?: string;
  codeInsee?: string;
  codeRivoli?: string;
  street?: string;
}

// Fonction pour obtenir les coordonnées GPS de l'utilisateur
export const getUserLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
          reject(new Error("La géolocalisation n'est pas supportée par ce navigateur."));
          return;
      }
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              resolve({ latitude, longitude });
          },
          (error) => {
              reject(new Error("Erreur lors de l'obtention de la géolocalisation : " + error.message));
          }
      );
  });
};

// Fonction pour obtenir une adresse depuis des coordonnées GPS en utilisant data.gouv.fr
export const getAddressFromCoordinates = async (
coordinates: Coordinates,
retries = 3
): Promise<LocationDetails> => {
const { latitude, longitude } = coordinates;
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(
    `https://api-adresse.data.gouv.fr/reverse/?lat=${latitude}&lon=${longitude}`,
    { signal: controller.signal }
  );
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération de l'adresse depuis les coordonnées.");
  }

  const data = await response.json();
  if (data.features && data.features.length > 0) {
    const result = data.features[0];
    const address = result.properties.label;
    const city = result.properties.city;
    const postalcode = result.properties.postcode;
    const fullStreetName = result.properties.name;
    const street = fullStreetName.replace(/^\d+\s+/, '');
    const country = "France";
    const codeInsee = result.properties.citycode;
    const codeRivoli = result.properties.id.split("_")[1];

    return {
      address,
      city,
      postalcode,
      street,
      country,
      codeInsee,
      codeRivoli,
    };
  } else {
    throw new Error("Aucune adresse trouvée pour les coordonnées fournies.");
  }
} catch (err: unknown) {
  clearTimeout(timeoutId);
  let errorToThrow: Error;
  if (err instanceof Error) {
    if (err.name === 'AbortError') {
      errorToThrow = new Error("La requête a expiré. Veuillez réessayer plus tard.");
    } else {
      errorToThrow = err;
    }
  } else {
    errorToThrow = new Error("Erreur inconnue lors de la récupération de l'adresse.");
  }

  if (retries > 0) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getAddressFromCoordinates(coordinates, retries - 1);
  } else {
    throw errorToThrow;
  }
}
};
