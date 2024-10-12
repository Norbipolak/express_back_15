function getMySqlDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    const second = date.getSeconds().toString().padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export default getMySqlDate;

/*
    1. getFullYear()-vel lehet a date objektumból a year-t kiszedni
    2. const month = (date.getMonth() + 1).toString().padStart(2, "0");
        
    Ha megnézzük a date objektumunkat new Date().getMonth() -> 9 
    Azt mondja, hogy 9-dik hónap van, azért mert neki valamiért a január az a 0-dik 
        itt a hónapnál hozzá kell adni egyet date.getMonth() + 1, hogy megkapjuk, hogy 10, ahányadik hónapban vagyunk 
        majd ezt az egészet toString()-eljük és a padStart()-val pedig 
        1 paraméter, hogy milyen hosszú legyen a string -> 2
        2. hogyha nem olyan hosszú, akkor mivel egészítse ki -> 0 (fontos, hogyha pedStart, akkor előre teszi be a sting-nek)
            tehát így lesz a 9 -> 09 
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    Tehát ha toString-elve egy karakteres a hónap, akkor berakjon elé egy "0"-st, amennyiben nincsen két karakteres

    3. new Date().getDay() -> 4 
        Azt mondja meg, hogy hányadik nap a héten, nem pedig azt, hogy hányadik nap a hónapban
    ->
        new Date().getDate()
            Ez mondja meg, hogy hányadik nap a hónapban -> 3 

    const day = date.getDate().toString().padStart(2, "0");

    Az óra, perc, másodperc az ugyanúgy getHours, getMiuntes, getSeconds
    ->
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    const second = date.getSeconds().toString().padStart(2, "0");

    Ami nagyon fontos, hogy utána meg return-ölünk egy ilyet, hogy az sql-nek megfelelő formátuma legyen!!!!!!!!!!!!
    ->
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
*/