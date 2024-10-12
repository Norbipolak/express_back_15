function trim(obj) {
    const keys = Object.keys(obj);   //mekapja az objektum összes kulcsát 

    for(const key of keys) {  //végigmegy az összes kulcson 
        if(typeof obj[key] === "string")  //ellenőrzni, hogy a kulcshoz tartozó érték string típusú-e 
            obj[key] = obj[key].trim(); //ha string, akkor eltávolítja a szóközöket az elejéről és a végéről 
    }

    return obj; //visszaadja a ciklus után 
}

export default trim;

/*
    function trim(obj) 
    Bekérünk egy object-et 

    De ezt lehet máshogyan is, nem kell, hogy const keys = Object.keys(obj) és utána végigmenni egy for of-val 

    Hanem!!!!!!!!!!!!
    for(const key in object) {
        if(typeof obj[key] === "string") 
            obj[key] = obj[key].trim();
    }
*/

const obj = {
    id:5,
    name: "Pista"
}

for(const key in obj) {
    console.log(key); //id name, ilyenkor visszaadja a kulcsokat egy objektumban
}

/*
    az in, arra lett kitalálva, hogy objektumnak a kulcsain végigmenjünk 
    de ezt meg lehet csinálni nem csak egy objektummal, hanem egy tömbbel is 
    Akkor az index-eket fogjuk visszakapni, mert a tömb is egy objektum, aminek az indexek a kulcsai!!!!!!!!!
*/