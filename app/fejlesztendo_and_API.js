/*

1. SQL Injection veszélye:

Bár használsz lekérdezési paramétereket (prepared statements), érdemes ellenőrizni, hogy minden adatbázis interakció során használod-e őket. 
A jelenlegi megoldás valószínűleg már védi az SQL injection-től, de figyelni kell arra, 
hogy mindenhol konzisztensek legyenek ezek a biztonsági intézkedések.

2. Erősebb jelszó hashelés:

Ha még nem tetted meg, használj egy modern hashelési algoritmust, mint például bcrypt, argon2 vagy scrypt, 
amelyek lassabbak és biztonságosabbak a brute-force támadásokkal szemben.

3. Hibaüzenetek kezelése:

A rendszer 401-es hibát dob, ha a felhasználónév/jelszó páros nem megfelelő. Fontos, hogy ne legyen külön hibaüzenet, 
ha a felhasználó létezik, de a jelszó hibás. 
Ez megakadályozza, hogy egy támadó felismerje, hogy egy adott email cím regisztrált-e a rendszerben (brute-force elleni védelem).

4. Rate limiting:

Használj rate limitinget vagy captcha-t a brute-force támadások megelőzése érdekében. 
Enélkül egy támadó folyamatosan próbálkozhat felhasználói nevek és jelszavak kitalálásával.

5. Token alapú hitelesítés (pl. JWT):

A jelenlegi rendszerben nem látszik session kezelés vagy token alapú hitelesítés. 
JWT (JSON Web Token) vagy session alapú hitelesítés használata elengedhetetlen a biztonságos bejelentkezési rendszerekben. 
Ez lehetővé teszi, hogy a felhasználók egyszer bejelentkezzenek, majd a további kéréseknél azonosítva legyenek anélkül, 
hogy újra meg kellene adniuk a jelszót.

6. SSL/TLS használata:

Győződj meg arról, hogy a bejelentkezési oldalt SSL (https) alatt használják, 
hogy a jelszavak titkosítva kerüljenek továbbításra az interneten.

7. Auditálás és naplózás:

Hozz létre naplókat a bejelentkezési kísérletekről, sikeres és sikertelen bejelentkezésekről. 
Ez segíthet észlelni gyanús tevékenységeket, és lehetőséget biztosít az adminisztrátoroknak a biztonság fenntartására.

8. Csatlakozási hibák kezelése:

A catch blokk jelenleg csak egy általános üzenetet dob, ha az adatbázis elérhetetlen. 
Fontos részletesebben kezelni az ilyen hibákat, például különbséget tenni a hálózati hiba, adatbázis hiba vagy időkorlát között. 
Így jobban diagnosztizálhatók lesznek a problémák.
*********************************************************************************************************************************
*/


// Sample function to validate an address using Google Maps Geocoding API
async function validateAddress(address) {
    const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const validatedAddress = data.results[0].formatted_address;
            console.log("Valid Address:", validatedAddress);
            return validatedAddress;
        } else {
            console.log("Invalid Address or No Results Found.");
            return null;
        }
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

// Example usage
validateAddress("1600 Amphitheatre Parkway, Mountain View, CA");

/*
Steps to follow:

Get an API Key:
    You need to sign up for the Google Maps Geocoding API and obtain an API key from Google Cloud Console.

Replace the API key:
    Replace the YOUR_API_KEY in the code with your actual API key.

Address input:
    The address parameter is the address you want to validate.
*/
