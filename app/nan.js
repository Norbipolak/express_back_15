function nan(num) {
    return isNaN(parseInt(num))
}

/*
    isNaN(parseInt(num))
    itt mindegy, hogy parseInt-et vagy parseFloat-ot használunk, mert nem az érték érdekel minket, hanem csak az, hogyha át akarjuk váltani 
    számmá akkor tudjuk-e 

    Tehát ha itt bejön egy olyan, hogy "5", azt parseInt-eljük, lesz belőle 5 isNaN az meg true lesz, mert ez tényleg egy number 
    de ha "fecske" az már rossz lesz 
*/

export default nan;